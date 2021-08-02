package com.swmansion.gesturehandler

import android.graphics.Matrix
import android.graphics.PointF
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import java.util.*

class GestureHandlerOrchestrator(
  private val mWrapperView: ViewGroup,
  private val mHandlerRegistry: GestureHandlerRegistry,
  private val mViewConfigHelper: ViewConfigurationHelper
) {
  private val mGestureHandlers = arrayOfNulls<GestureHandler<*>?>(SIMULTANEOUS_GESTURE_HANDLER_LIMIT)
  private val mAwaitingHandlers: Array<GestureHandler<*>> = arrayOfNulls(SIMULTANEOUS_GESTURE_HANDLER_LIMIT)
  private val mPreparedHandlers = arrayOfNulls<GestureHandler<*>?>(SIMULTANEOUS_GESTURE_HANDLER_LIMIT)
  private val mHandlersToCancel = arrayOfNulls<GestureHandler<*>?>(SIMULTANEOUS_GESTURE_HANDLER_LIMIT)
  private var mGestureHandlersCount = 0
  private var mAwaitingHandlersCount = 0
  private var mIsHandlingTouch = false
  private var mHandlingChangeSemaphore = 0
  private var mFinishedHandlersCleanupScheduled = false
  private var mActivationIndex = 0
  private var mMinAlphaForTraversal = DEFAULT_MIN_ALPHA_FOR_TRAVERSAL

  /**
   * Minimum alpha (value from 0 to 1) that should be set to a view so that it can be treated as a
   * gesture target. E.g. if set to 0.1 then views that less than 10% opaque will be ignored when
   * traversing view hierarchy and looking for gesture handlers.
   */
  fun setMinimumAlphaForTraversal(alpha: Float) {
    mMinAlphaForTraversal = alpha
  }

  /**
   * Should be called from the view wrapper
   */
  fun onTouchEvent(event: MotionEvent): Boolean {
    mIsHandlingTouch = true
    val action = event.actionMasked
    if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
      extractGestureHandlers(event)
    } else if (action == MotionEvent.ACTION_CANCEL) {
      cancelAll()
    }
    deliverEventToGestureHandlers(event)
    mIsHandlingTouch = false
    if (mFinishedHandlersCleanupScheduled && mHandlingChangeSemaphore == 0) {
      cleanupFinishedHandlers()
    }
    return true
  }

  private fun scheduleFinishedHandlersCleanup() {
    if (mIsHandlingTouch || mHandlingChangeSemaphore != 0) {
      mFinishedHandlersCleanupScheduled = true
    } else {
      cleanupFinishedHandlers()
    }
  }

  private fun cleanupFinishedHandlers() {
    var shouldCleanEmptyCells = false
    for (i in mGestureHandlersCount - 1 downTo 0) {
      val handler = mGestureHandlers[i]
      if (isFinished(handler!!.state) && !handler.mIsAwaiting) {
        mGestureHandlers[i] = null
        shouldCleanEmptyCells = true
        handler.reset()
        handler.mIsActive = false
        handler.mIsAwaiting = false
        handler.mActivationIndex = Int.MAX_VALUE
      }
    }
    if (shouldCleanEmptyCells) {
      var out = 0
      for (i in 0 until mGestureHandlersCount) {
        if (mGestureHandlers[i] != null) {
          mGestureHandlers[out++] = mGestureHandlers[i]
        }
      }
      mGestureHandlersCount = out
    }
    mFinishedHandlersCleanupScheduled = false
  }

  private fun hasOtherHandlerToWaitFor(handler: GestureHandler<*>): Boolean {
    for (i in 0 until mGestureHandlersCount) {
      val otherHandler = mGestureHandlers[i]
      if (!isFinished(otherHandler!!.state)
        && shouldHandlerWaitForOther(handler, otherHandler)) {
        return true
      }
    }
    return false
  }

  private fun tryActivate(handler: GestureHandler<*>) {
    // see if there is anyone else who we need to wait for
    if (hasOtherHandlerToWaitFor(handler)) {
      addAwaitingHandler(handler)
    } else {
      // we can activate handler right away
      makeActive(handler)
      handler.mIsAwaiting = false
    }
  }

  private fun cleanupAwaitingHandlers() {
    var out = 0
    for (i in 0 until mAwaitingHandlersCount) {
      if (mAwaitingHandlers[i].mIsAwaiting) {
        mAwaitingHandlers[out++] = mAwaitingHandlers[i]
      }
    }
    mAwaitingHandlersCount = out
  }

  /*package*/
  fun onHandlerStateChange(handler: GestureHandler<*>, newState: Int, prevState: Int) {
    mHandlingChangeSemaphore += 1
    if (isFinished(newState)) {
      // if there were handlers awaiting completion of this handler, we can trigger active state
      for (i in 0 until mAwaitingHandlersCount) {
        val otherHandler = mAwaitingHandlers[i]
        if (shouldHandlerWaitForOther(otherHandler, handler)) {
          if (newState == GestureHandler.STATE_END) {
            // gesture has ended, we need to kill the awaiting handler
            otherHandler.cancel()
            otherHandler.mIsAwaiting = false
          } else {
            // gesture has failed recognition, we may try activating
            tryActivate(otherHandler)
          }
        }
      }
      cleanupAwaitingHandlers()
    }
    if (newState == GestureHandler.STATE_ACTIVE) {
      tryActivate(handler)
    } else if (prevState == GestureHandler.STATE_ACTIVE || prevState == GestureHandler.STATE_END) {
      if (handler.mIsActive) {
        handler.dispatchStateChange(newState, prevState)
      }
    } else {
      handler.dispatchStateChange(newState, prevState)
    }
    mHandlingChangeSemaphore -= 1
    scheduleFinishedHandlersCleanup()
  }

  private fun makeActive(handler: GestureHandler<*>) {
    val currentState = handler.state
    handler.mIsAwaiting = false
    handler.mIsActive = true
    handler.mActivationIndex = mActivationIndex++
    var toCancelCount = 0
    // Cancel all handlers that are required to be cancel upon current handler's activation
    for (i in 0 until mGestureHandlersCount) {
      val otherHandler = mGestureHandlers[i]
      if (shouldHandlerBeCancelledBy(otherHandler, handler)) {
        mHandlersToCancel[toCancelCount++] = otherHandler
      }
    }
    for (i in toCancelCount - 1 downTo 0) {
      mHandlersToCancel[i]!!.cancel()
    }

    // Clear all awaiting handlers waiting for the current handler to fail
    for (i in mAwaitingHandlersCount - 1 downTo 0) {
      val otherHandler = mAwaitingHandlers[i]
      if (shouldHandlerBeCancelledBy(otherHandler, handler)) {
        otherHandler.cancel()
        otherHandler.mIsAwaiting = false
      }
    }
    cleanupAwaitingHandlers()

    // Dispatch state change event if handler is no longer in the active state we should also
    // trigger END state change and UNDETERMINED state change if necessary
    handler.dispatchStateChange(GestureHandler.STATE_ACTIVE, GestureHandler.STATE_BEGAN)
    if (currentState != GestureHandler.STATE_ACTIVE) {
      handler.dispatchStateChange(GestureHandler.STATE_END, GestureHandler.STATE_ACTIVE)
      if (currentState != GestureHandler.STATE_END) {
        handler.dispatchStateChange(GestureHandler.STATE_UNDETERMINED, GestureHandler.STATE_END)
      }
    }
  }

  fun deliverEventToGestureHandlers(event: MotionEvent) {
    // Copy handlers to "prepared handlers" array, because the list of active handlers can change
    // as a result of state updates
    val handlersCount = mGestureHandlersCount
    System.arraycopy(mGestureHandlers, 0, mPreparedHandlers, 0, handlersCount)
    // We want to deliver events to active handlers first in order of their activation (handlers
    // that activated first will first get event delivered). Otherwise we deliver events in the
    // order in which handlers has been added ("most direct" children goes first). Therefore we rely
    // on Arrays.sort providing a stable sort (as children are registered in order in which they
    // should be tested)
    Arrays.sort(mPreparedHandlers, 0, handlersCount, sHandlersComparator)
    for (i in 0 until handlersCount) {
      deliverEventToGestureHandler(mPreparedHandlers[i], event)
    }
  }

  private fun cancelAll() {
    for (i in mAwaitingHandlersCount - 1 downTo 0) {
      mAwaitingHandlers[i].cancel()
    }
    // Copy handlers to "prepared handlers" array, because the list of active handlers can change
    // as a result of state updates
    val handlersCount = mGestureHandlersCount
    for (i in 0 until handlersCount) {
      mPreparedHandlers[i] = mGestureHandlers[i]
    }
    for (i in handlersCount - 1 downTo 0) {
      mPreparedHandlers[i]!!.cancel()
    }
  }

  private fun deliverEventToGestureHandler(handler: GestureHandler<*>?, event: MotionEvent) {
    if (!isViewAttachedUnderWrapper(handler!!.view)) {
      handler.cancel()
      return
    }
    if (!handler.wantEvents()) {
      return
    }
    val action = event.actionMasked
    if (handler.mIsAwaiting && action == MotionEvent.ACTION_MOVE) {
      return
    }
    val coords = sTempCoords
    extractCoordsForView(handler.view, event, coords)
    val oldX = event.x
    val oldY = event.y
    // TODO: we may conside scaling events if necessary using MotionEvent.transform
    // for now the events are only offset to the top left corner of the view but if
    // view or any ot the parents is scaled the other pointers position will not reflect
    // their actual place in the view. On the other hand not scaling seems like a better
    // approach when we want to use pointer coordinates to calculate velocity or distance
    // for pinch so I don't know yet if we should transform or not...
    event.setLocation(coords[0], coords[1])
    handler.handle(event)
    if (handler.mIsActive) {
      handler.dispatchTouchEvent(event)
    }
    event.setLocation(oldX, oldY)
    // if event was of type UP or POINTER_UP we request handler to stop tracking now that
    // the event has been dispatched
    if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) {
      val pointerId = event.getPointerId(event.actionIndex)
      handler.stopTrackingPointer(pointerId)
    }
  }

  /**
   * isViewAttachedUnderWrapper checks whether all of parents for view related to handler
   * view are attached. Since there might be an issue rarely observed when view
   * has been detached and handler's state hasn't been change to canceled, failed or
   * ended yet. Probably it's a result of some race condition and stopping delivering
   * for this handler and changing its state to failed of end appear to be good enough solution.
   */
  private fun isViewAttachedUnderWrapper(view: View?): Boolean {
    if (view == null) {
      return false
    }
    if (view === mWrapperView) {
      return true
    }
    var parent = view.parent
    while (parent != null && parent !== mWrapperView) {
      parent = parent.parent
    }
    return parent === mWrapperView
  }

  private fun extractCoordsForView(view: View?, event: MotionEvent, outputCoords: FloatArray) {
    if (view === mWrapperView) {
      outputCoords[0] = event.x
      outputCoords[1] = event.y
      return
    }
    require(!(view == null || view.parent !is ViewGroup)) { "Parent is null? View is no longer in the tree" }
    val parent = view.parent as ViewGroup
    extractCoordsForView(parent, event, outputCoords)
    val childPoint = sTempPoint
    transformTouchPointToViewCoords(outputCoords[0], outputCoords[1], parent, view, childPoint)
    outputCoords[0] = childPoint.x
    outputCoords[1] = childPoint.y
  }

  private fun addAwaitingHandler(handler: GestureHandler<*>) {
    for (i in 0 until mAwaitingHandlersCount) {
      if (mAwaitingHandlers[i] === handler) {
        return
      }
    }
    check(mAwaitingHandlersCount < mAwaitingHandlers.size) { "Too many recognizers" }
    mAwaitingHandlers[mAwaitingHandlersCount++] = handler
    handler.mIsAwaiting = true
    handler.mActivationIndex = mActivationIndex++
  }

  private fun recordHandlerIfNotPresent(handler: GestureHandler<*>, view: View) {
    for (i in 0 until mGestureHandlersCount) {
      if (mGestureHandlers[i] === handler) {
        return
      }
    }
    check(mGestureHandlersCount < mGestureHandlers.size) { "Too many recognizers" }
    mGestureHandlers[mGestureHandlersCount++] = handler
    handler.mIsActive = false
    handler.mIsAwaiting = false
    handler.mActivationIndex = Int.MAX_VALUE
    handler.prepare(view, this)
  }

  private fun recordViewHandlersForPointer(view: View, coords: FloatArray, pointerId: Int): Boolean {
    val handlers = mHandlerRegistry.getHandlersForView(view)
    var found = false
    if (handlers != null) {
      var i = 0
      val size = handlers.size
      while (i < size) {
        val handler = handlers[i]
        if (handler.isEnabled && handler.isWithinBounds(view, coords[0], coords[1])) {
          recordHandlerIfNotPresent(handler, view)
          handler.startTrackingPointer(pointerId)
          found = true
        }
        i++
      }
    }
    return found
  }

  private fun extractGestureHandlers(event: MotionEvent) {
    val actionIndex = event.actionIndex
    val pointerId = event.getPointerId(actionIndex)
    sTempCoords[0] = event.getX(actionIndex)
    sTempCoords[1] = event.getY(actionIndex)
    traverseWithPointerEvents(mWrapperView, sTempCoords, pointerId)
    extractGestureHandlers(mWrapperView, sTempCoords, pointerId)
  }

  private fun extractGestureHandlers(viewGroup: ViewGroup, coords: FloatArray, pointerId: Int): Boolean {
    val childrenCount = viewGroup.childCount
    for (i in childrenCount - 1 downTo 0) {
      val child = mViewConfigHelper.getChildInDrawingOrderAtIndex(viewGroup, i)
      if (canReceiveEvents(child)) {
        val childPoint = sTempPoint
        transformTouchPointToViewCoords(coords[0], coords[1], viewGroup, child, childPoint)
        val restoreX = coords[0]
        val restoreY = coords[1]
        coords[0] = childPoint.x
        coords[1] = childPoint.y
        var found = false
        if (!isClipping(child) || isTransformedTouchPointInView(coords[0], coords[1], child)) {
          // we only consider the view if touch is inside the view bounds or if the view's children
          // can render outside of the view bounds (overflow visible)
          found = traverseWithPointerEvents(child, coords, pointerId)
        }
        coords[0] = restoreX
        coords[1] = restoreY
        if (found) {
          return true
        }
      }
    }
    return false
  }

  private fun traverseWithPointerEvents(view: View, coords: FloatArray, pointerId: Int): Boolean {
    val pointerEvents = mViewConfigHelper.getPointerEventsConfigForView(view)
    return if (pointerEvents == PointerEventsConfig.NONE) {
      // This view and its children can't be the target
      false
    } else if (pointerEvents == PointerEventsConfig.BOX_ONLY) {
      // This view is the target, its children don't matter
      (recordViewHandlersForPointer(view, coords, pointerId)
        || shouldHandlerlessViewBecomeTouchTarget(view, coords))
    } else if (pointerEvents == PointerEventsConfig.BOX_NONE) {
      // This view can't be the target, but its children might
      if (view is ViewGroup) {
        extractGestureHandlers(view, coords, pointerId)
      } else false
    } else if (pointerEvents == PointerEventsConfig.AUTO) {
      // Either this view or one of its children is the target
      var found = false
      if (view is ViewGroup) {
        found = extractGestureHandlers(view, coords, pointerId)
      }
      (recordViewHandlersForPointer(view, coords, pointerId)
        || found || shouldHandlerlessViewBecomeTouchTarget(view, coords))
    } else {
      throw IllegalArgumentException(
        "Unknown pointer event type: $pointerEvents")
    }
  }

  private fun canReceiveEvents(view: View): Boolean {
    return view.visibility == View.VISIBLE && view.alpha >= mMinAlphaForTraversal
  }

  private fun isClipping(view: View): Boolean {
    // if view is not a view group it is clipping, otherwise we check for `getClipChildren` flag to
    // be turned on and also confirm with the ViewConfigHelper implementation
    return view !is ViewGroup || mViewConfigHelper.isViewClippingChildren(view)
  }

  companion object {
    // The limit doesn't necessarily need to exists, it was just simpler to implement it that way
    // it is also more allocation-wise efficient to have a fixed limit
    private const val SIMULTANEOUS_GESTURE_HANDLER_LIMIT = 20

    // Be default fully transparent views can receive touch
    private const val DEFAULT_MIN_ALPHA_FOR_TRAVERSAL = 0f
    private val sTempPoint = PointF()
    private val sMatrixTransformCoords = FloatArray(2)
    private val sInverseMatrix = Matrix()
    private val sTempCoords = FloatArray(2)
    private val sHandlersComparator = Comparator<GestureHandler<*>> { a, b ->
      if (a.mIsActive && b.mIsActive || a.mIsAwaiting && b.mIsAwaiting) {
        // both A and B are either active or awaiting activation, in which case we prefer one that
        // has activated (or turned into "awaiting" state) earlier
        return@Comparator Integer.signum(b.mActivationIndex - a.mActivationIndex)
      } else if (a.mIsActive) {
        return@Comparator -1 // only A is active
      } else if (b.mIsActive) {
        return@Comparator 1 // only B is active
      } else if (a.mIsAwaiting) {
        return@Comparator -1 // only A is awaiting, B is inactive
      } else if (b.mIsAwaiting) {
        return@Comparator 1 // only B is awaiting, A is inactive
      }
      0 // both A and B are inactive, stable order matters
    }

    private fun shouldHandlerlessViewBecomeTouchTarget(view: View, coords: FloatArray): Boolean {
      // The following code is to match the iOS behavior where transparent parts of the views can
      // pass touch events through them allowing sibling nodes to handle them.

      // TODO: this is not an ideal solution as we only consider ViewGroups that has no background set
      // TODO: ideally we should determine the pixel color under the given coordinates and return
      // false if the color is transparent
      val isLeafOrTransparent = view !is ViewGroup || view.getBackground() != null
      return isLeafOrTransparent && isTransformedTouchPointInView(coords[0], coords[1], view)
    }

    private fun transformTouchPointToViewCoords(
      x: Float,
      y: Float,
      parent: ViewGroup,
      child: View,
      outLocalPoint: PointF
    ) {
      var localX = x + parent.scrollX - child.left
      var localY = y + parent.scrollY - child.top
      val matrix = child.matrix
      if (!matrix.isIdentity) {
        val localXY = sMatrixTransformCoords
        localXY[0] = localX
        localXY[1] = localY
        val inverseMatrix = sInverseMatrix
        matrix.invert(inverseMatrix)
        inverseMatrix.mapPoints(localXY)
        localX = localXY[0]
        localY = localXY[1]
      }
      outLocalPoint[localX] = localY
    }

    private fun isTransformedTouchPointInView(x: Float, y: Float, child: View): Boolean {
      return x >= 0 && x <= child.width && y >= 0 && y < child.height
    }

    private fun shouldHandlerWaitForOther(handler: GestureHandler<*>, other: GestureHandler<*>?): Boolean {
      return handler !== other && (handler.shouldWaitForHandlerFailure(other!!)
        || other.shouldRequireToWaitForFailure(handler))
    }

    private fun canRunSimultaneously(a: GestureHandler<*>?, b: GestureHandler<*>): Boolean {
      return a === b || a!!.shouldRecognizeSimultaneously(b) || b.shouldRecognizeSimultaneously(a)
    }

    private fun shouldHandlerBeCancelledBy(handler: GestureHandler<*>?, other: GestureHandler<*>): Boolean {
      if (!handler!!.hasCommonPointers(other)) {
        // if two handlers share no common pointer one can never trigger cancel for the other
        return false
      }
      if (canRunSimultaneously(handler, other)) {
        // if handlers are allowed to run simultaneously, when first activates second can still remain
        // in began state
        return false
      }
      return if (handler !== other &&
        (handler.mIsAwaiting || handler.state == GestureHandler.STATE_ACTIVE)) {
        // in every other case as long as the handler is about to be activated or already in active
        // state, we delegate the decision to the implementation of GestureHandler#shouldBeCancelledBy
        handler.shouldBeCancelledBy(other)
      } else true
    }

    private fun isFinished(state: Int): Boolean {
      return state == GestureHandler.STATE_CANCELLED || state == GestureHandler.STATE_FAILED || state == GestureHandler.STATE_END
    }
  }
}
