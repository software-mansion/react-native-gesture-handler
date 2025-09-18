package com.swmansion.gesturehandler.core

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.graphics.PointF
import android.os.Build
import android.view.MotionEvent
import android.view.MotionEvent.PointerCoords
import android.view.MotionEvent.PointerProperties
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableArray
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.BuildConfig
import com.swmansion.gesturehandler.RNSVGHitTester
import com.swmansion.gesturehandler.react.RNGestureHandlerDetectorView
import com.swmansion.gesturehandler.react.RNGestureHandlerInteractionManager
import com.swmansion.gesturehandler.react.events.RNGestureHandlerTouchEvent
import com.swmansion.gesturehandler.react.events.eventbuilders.GestureHandlerEventDataBuilder
import java.lang.IllegalStateException
import java.util.*

open class GestureHandler {
  private val trackedPointerIDs = IntArray(MAX_POINTERS_COUNT)
  private var trackedPointersIDsCount = 0
  private val windowOffset = IntArray(2) { 0 }
  var tag = 0
  var view: View? = null
    private set
  val viewForEvents: RNGestureHandlerDetectorView
    get() {
      assert(actionType == ACTION_TYPE_NATIVE_DETECTOR) {
        "[react-native-gesture-handler] `viewForEvents` can only be used with NativeDetector."
      }

      val detector = if (this is NativeViewGestureHandler) this.view?.parent else view

      if (detector !is RNGestureHandlerDetectorView) {
        throw Error(
          "[react-native-gesture-handler] Expected RNGestureHandlerDetectorView to be the target for the event.",
        )
      }

      return detector
    }
  var state = STATE_UNDETERMINED
    private set
  var x = 0f
    private set
  var y = 0f
    private set
  var isWithinBounds = false
    private set
  var isEnabled = true
    private set(enabled) {
      // Don't cancel handler when not changing the value of the isEnabled, executing it always caused
      // handlers to be cancelled on re-render because that's the moment when the config is updated.
      // If the enabled prop "changed" from true to true the handler would get cancelled.
      if (view != null && isEnabled != enabled) {
        // If view is set then handler is in "active" state. In that case we want to "cancel" handler
        // when it changes enabled state so that it gets cleared from the orchestrator
        UiThreadUtil.runOnUiThread { cancel() }
      }
      field = enabled
    }
  var actionType = 0

  var changedTouchesPayload: WritableArray? = null
    private set
  var allTouchesPayload: WritableArray? = null
    private set
  var touchEventType = RNGestureHandlerTouchEvent.EVENT_UNDETERMINED
    private set
  var trackedPointersCount = 0
    private set
  private val trackedPointers: Array<PointerData?> = Array(MAX_POINTERS_COUNT) { null }
  var needsPointerData = false
  var dispatchesAnimatedEvents = false
  var dispatchesReanimatedEvents = false

  private var hitSlop: FloatArray? = null
  var eventCoalescingKey: Short = 0
    private set
  var lastAbsolutePositionX = 0f
    private set
  var lastAbsolutePositionY = 0f
    private set

  private var manualActivation = false

  private var lastEventOffsetX = 0f
  private var lastEventOffsetY = 0f
  var numberOfPointers = 0
    protected set
  protected var shouldCancelWhenOutside = false
  protected var orchestrator: GestureHandlerOrchestrator? = null
  var onTouchEventListener: OnTouchEventListener? = null
  private var interactionController: GestureHandlerInteractionController? = null
  var pointerType: Int = POINTER_TYPE_OTHER
    private set

  protected var mouseButton = 0

  // properties set and accessed only by the orchestrator
  var activationIndex = 0
  var isActive = false
  var isAwaiting = false
  var shouldResetProgress = false

  open fun dispatchStateChange(newState: Int, prevState: Int) {
    onTouchEventListener?.onStateChange(this, newState, prevState)
  }

  open fun dispatchHandlerUpdate(event: MotionEvent) {
    onTouchEventListener?.onHandlerUpdate(this, event)
  }

  open fun dispatchTouchEvent() {
    if (changedTouchesPayload != null) {
      onTouchEventListener?.onTouchEvent(this)
    }
  }

  open fun resetConfig() {
    needsPointerData = DEFAULT_NEEDS_POINTER_DATA
    manualActivation = DEFAULT_MANUAL_ACTIVATION
    shouldCancelWhenOutside = DEFAULT_SHOULD_CANCEL_WHEN_OUTSIDE
    isEnabled = DEFAULT_IS_ENABLED
    hitSlop = DEFAULT_HIT_SLOP
    mouseButton = DEFAULT_MOUSE_BUTTON
    dispatchesAnimatedEvents = DEFAULT_DISPATCHES_ANIMATED_EVENTS
    dispatchesReanimatedEvents = DEFAULT_DISPATCHES_REANIMATED_EVENTS
  }

  fun hasCommonPointers(other: GestureHandler): Boolean {
    for (i in trackedPointerIDs.indices) {
      if (trackedPointerIDs[i] != -1 && other.trackedPointerIDs[i] != -1) {
        return true
      }
    }
    return false
  }

  fun setHitSlop(leftPad: Float, topPad: Float, rightPad: Float, bottomPad: Float, width: Float, height: Float) {
    if (hitSlop == null) {
      hitSlop = FloatArray(6)
    }
    hitSlop!![HIT_SLOP_LEFT_IDX] = leftPad
    hitSlop!![HIT_SLOP_TOP_IDX] = topPad
    hitSlop!![HIT_SLOP_RIGHT_IDX] = rightPad
    hitSlop!![HIT_SLOP_BOTTOM_IDX] = bottomPad
    hitSlop!![HIT_SLOP_WIDTH_IDX] = width
    hitSlop!![HIT_SLOP_HEIGHT_IDX] = height
    require(!(hitSlopSet(width) && hitSlopSet(leftPad) && hitSlopSet(rightPad))) {
      "Cannot have all of left, right and width defined"
    }
    require(!(hitSlopSet(width) && !hitSlopSet(leftPad) && !hitSlopSet(rightPad))) {
      "When width is set one of left or right pads need to be defined"
    }
    require(!(hitSlopSet(height) && hitSlopSet(bottomPad) && hitSlopSet(topPad))) {
      "Cannot have all of top, bottom and height defined"
    }
    require(!(hitSlopSet(height) && !hitSlopSet(bottomPad) && !hitSlopSet(topPad))) {
      "When height is set one of top or bottom pads need to be defined"
    }
  }

  fun setHitSlop(padding: Float) = setHitSlop(padding, padding, padding, padding, HIT_SLOP_NONE, HIT_SLOP_NONE)

  fun setInteractionController(controller: GestureHandlerInteractionController?) {
    interactionController = controller
  }

  fun prepare(view: View?, orchestrator: GestureHandlerOrchestrator?) {
    check(!(this.view != null || this.orchestrator != null)) {
      "Already prepared or hasn't been reset"
    }
    Arrays.fill(trackedPointerIDs, -1)
    trackedPointersIDsCount = 0
    state = STATE_UNDETERMINED
    this.view = view
    this.orchestrator = orchestrator

    val content = getActivity(view?.context)?.findViewById<View>(android.R.id.content)
    if (content != null) {
      content.getLocationOnScreen(windowOffset)
    } else {
      windowOffset[0] = 0
      windowOffset[1] = 0
    }

    onPrepare()
  }

  protected open fun onPrepare() {}

  private fun getActivity(context: Context?): Activity? = when (context) {
    is ReactContext -> context.currentActivity
    is Activity -> context
    is ContextWrapper -> getActivity(context.baseContext)
    else -> null
  }

  private fun findNextLocalPointerId(): Int {
    var localPointerId = 0
    while (localPointerId < trackedPointersIDsCount) {
      var i = 0
      while (i < trackedPointerIDs.size) {
        if (trackedPointerIDs[i] == localPointerId) {
          break
        }
        i++
      }
      if (i == trackedPointerIDs.size) {
        return localPointerId
      }
      localPointerId++
    }
    return localPointerId
  }

  fun startTrackingPointer(pointerId: Int) {
    if (isTrackingPointer(pointerId)) {
      return
    }

    trackedPointerIDs[pointerId] = findNextLocalPointerId()
    trackedPointersIDsCount++
  }

  fun stopTrackingPointer(pointerId: Int) {
    if (!isTrackingPointer(pointerId)) {
      return
    }

    trackedPointerIDs[pointerId] = -1
    trackedPointersIDsCount--
  }

  private fun isTrackingPointer(pointerId: Int) = trackedPointerIDs[pointerId] != -1

  private fun needAdapt(event: MotionEvent): Boolean {
    if (event.pointerCount != trackedPointersIDsCount) {
      return true
    }

    for (i in trackedPointerIDs.indices) {
      val trackedPointer = trackedPointerIDs[i]
      if (trackedPointer != -1 && trackedPointer != i) {
        return true
      }
    }
    return false
  }

  private fun adaptEvent(event: MotionEvent): MotionEvent {
    if (!needAdapt(event)) {
      return event
    }
    var action = event.actionMasked
    var actionIndex = -1
    if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
      actionIndex = event.actionIndex
      val actionPointer = event.getPointerId(actionIndex)
      action = if (trackedPointerIDs[actionPointer] != -1) {
        if (trackedPointersIDsCount == 1) {
          MotionEvent.ACTION_DOWN
        } else {
          MotionEvent.ACTION_POINTER_DOWN
        }
      } else {
        MotionEvent.ACTION_MOVE
      }
    } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) {
      actionIndex = event.actionIndex
      val actionPointer = event.getPointerId(actionIndex)
      action = if (trackedPointerIDs[actionPointer] != -1) {
        if (trackedPointersIDsCount == 1) {
          MotionEvent.ACTION_UP
        } else {
          MotionEvent.ACTION_POINTER_UP
        }
      } else {
        MotionEvent.ACTION_MOVE
      }
    }
    initPointerProps(trackedPointersIDsCount)
    var count = 0
    val deltaX = event.rawX - event.x
    val deltaY = event.rawY - event.y
    event.offsetLocation(deltaX, deltaY)
    var index = 0
    val size = event.pointerCount
    while (index < size) {
      val origPointerId = event.getPointerId(index)
      if (trackedPointerIDs[origPointerId] != -1) {
        event.getPointerProperties(index, pointerProps[count])
        pointerProps[count]!!.id = trackedPointerIDs[origPointerId]
        event.getPointerCoords(index, pointerCoords[count])
        if (index == actionIndex) {
          action = action or (count shl MotionEvent.ACTION_POINTER_INDEX_SHIFT)
        }
        count++
      }
      index++
    }

    // introduced in 1.11.0, remove if crashes are not reported
    if (pointerProps.isEmpty() || pointerCoords.isEmpty()) {
      throw IllegalStateException(
        "pointerCoords.size=${pointerCoords.size}, pointerProps.size=${pointerProps.size}",
      )
    }

    val result: MotionEvent
    try {
      result = MotionEvent.obtain(
        event.downTime,
        event.eventTime,
        action,
        count,
        pointerProps, /* props are copied and hence it is safe to use static array here */
        pointerCoords, /* same applies to coords */
        event.metaState,
        event.buttonState,
        event.xPrecision,
        event.yPrecision,
        event.deviceId,
        event.edgeFlags,
        event.source,
        event.flags,
      )
    } catch (e: IllegalArgumentException) {
      throw AdaptEventException(this, event, e)
    }
    event.offsetLocation(-deltaX, -deltaY)
    result.offsetLocation(-deltaX, -deltaY)
    return result
  }

  // exception to help debug https://github.com/software-mansion/react-native-gesture-handler/issues/1188
  class AdaptEventException(handler: GestureHandler, event: MotionEvent, e: IllegalArgumentException) :
    Exception(
      """
    handler: ${handler::class.simpleName}
    state: ${handler.state}
    view: ${handler.view}
    orchestrator: ${handler.orchestrator}
    isEnabled: ${handler.isEnabled}
    isActive: ${handler.isActive}
    isAwaiting: ${handler.isAwaiting}
    trackedPointersCount: ${handler.trackedPointersIDsCount}
    trackedPointers: ${handler.trackedPointerIDs.joinToString(separator = ", ")}
    while handling event: $event
      """.trimIndent(),
      e,
    )

  fun handle(transformedEvent: MotionEvent, sourceEvent: MotionEvent) {
    if (!isEnabled ||
      state == STATE_CANCELLED ||
      state == STATE_FAILED ||
      state == STATE_END ||
      trackedPointersIDsCount < 1
    ) {
      return
    }

    // a workaround for https://github.com/software-mansion/react-native-gesture-handler/issues/1188
    val (adaptedTransformedEvent, adaptedSourceEvent) = if (BuildConfig.DEBUG) {
      arrayOf(adaptEvent(transformedEvent), adaptEvent(sourceEvent))
    } else {
      try {
        arrayOf(adaptEvent(transformedEvent), adaptEvent(sourceEvent))
      } catch (e: AdaptEventException) {
        fail()
        return
      }
    }

    x = adaptedTransformedEvent.x
    y = adaptedTransformedEvent.y
    numberOfPointers = adaptedTransformedEvent.pointerCount
    isWithinBounds = isWithinBounds(view, x, y)
    if (shouldCancelWhenOutside && !isWithinBounds) {
      if (state == STATE_ACTIVE) {
        cancel()
      } else if (state == STATE_BEGAN) {
        fail()
      }
      return
    }
    lastAbsolutePositionX = GestureUtils.getLastPointerX(adaptedTransformedEvent, true)
    lastAbsolutePositionY = GestureUtils.getLastPointerY(adaptedTransformedEvent, true)
    lastEventOffsetX = adaptedTransformedEvent.rawX - adaptedTransformedEvent.x
    lastEventOffsetY = adaptedTransformedEvent.rawY - adaptedTransformedEvent.y

    if (sourceEvent.action == MotionEvent.ACTION_DOWN ||
      sourceEvent.action == MotionEvent.ACTION_HOVER_ENTER ||
      sourceEvent.action == MotionEvent.ACTION_HOVER_MOVE
    ) {
      setPointerType(sourceEvent)
    }

    if (sourceEvent.action == MotionEvent.ACTION_HOVER_ENTER ||
      sourceEvent.action == MotionEvent.ACTION_HOVER_MOVE ||
      sourceEvent.action == MotionEvent.ACTION_HOVER_EXIT
    ) {
      onHandleHover(adaptedTransformedEvent, adaptedSourceEvent)
    } else {
      onHandle(adaptedTransformedEvent, adaptedSourceEvent)
    }
    if (adaptedTransformedEvent != transformedEvent) {
      adaptedTransformedEvent.recycle()
    }
    if (adaptedSourceEvent != sourceEvent) {
      adaptedSourceEvent.recycle()
    }
  }

  private fun dispatchTouchDownEvent(event: MotionEvent, sourceEvent: MotionEvent) {
    changedTouchesPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCH_DOWN
    val pointerId = event.getPointerId(event.actionIndex)
    val offsetX = sourceEvent.rawX - sourceEvent.x
    val offsetY = sourceEvent.rawY - sourceEvent.y

    trackedPointers[pointerId] = PointerData(
      pointerId,
      event.getX(event.actionIndex),
      event.getY(event.actionIndex),
      sourceEvent.getX(event.actionIndex) + offsetX - windowOffset[0],
      sourceEvent.getY(event.actionIndex) + offsetY - windowOffset[1],
    )
    trackedPointersCount++
    addChangedPointer(trackedPointers[pointerId]!!)
    extractAllPointersData()

    dispatchTouchEvent()
  }

  private fun dispatchTouchUpEvent(event: MotionEvent, sourceEvent: MotionEvent) {
    extractAllPointersData()
    changedTouchesPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCH_UP
    val pointerId = event.getPointerId(event.actionIndex)
    val offsetX = sourceEvent.rawX - sourceEvent.x
    val offsetY = sourceEvent.rawY - sourceEvent.y

    trackedPointers[pointerId] = PointerData(
      pointerId,
      event.getX(event.actionIndex),
      event.getY(event.actionIndex),
      sourceEvent.getX(event.actionIndex) + offsetX - windowOffset[0],
      sourceEvent.getY(event.actionIndex) + offsetY - windowOffset[1],
    )
    addChangedPointer(trackedPointers[pointerId]!!)
    trackedPointers[pointerId] = null
    trackedPointersCount--

    dispatchTouchEvent()
  }

  private fun dispatchTouchMoveEvent(event: MotionEvent, sourceEvent: MotionEvent) {
    changedTouchesPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCH_MOVE
    val offsetX = sourceEvent.rawX - sourceEvent.x
    val offsetY = sourceEvent.rawY - sourceEvent.y
    var pointersAdded = 0

    for (i in 0 until event.pointerCount) {
      val pointerId = event.getPointerId(i)
      val pointer = trackedPointers[pointerId] ?: continue

      if (pointer.x != event.getX(i) || pointer.y != event.getY(i)) {
        pointer.x = event.getX(i)
        pointer.y = event.getY(i)
        pointer.absoluteX = sourceEvent.getX(i) + offsetX - windowOffset[0]
        pointer.absoluteY = sourceEvent.getY(i) + offsetY - windowOffset[1]

        addChangedPointer(pointer)
        pointersAdded++
      }
    }

    // only data about pointers that have changed their position is sent, it makes no sense to send
    // an empty move event (especially when this method is called during down/up event and there is
    // only info about one pointer)
    if (pointersAdded > 0) {
      extractAllPointersData()
      dispatchTouchEvent()
    }
  }

  fun updatePointerData(event: MotionEvent, sourceEvent: MotionEvent) {
    if (event.actionMasked == MotionEvent.ACTION_DOWN ||
      event.actionMasked == MotionEvent.ACTION_POINTER_DOWN
    ) {
      dispatchTouchDownEvent(event, sourceEvent)
      dispatchTouchMoveEvent(event, sourceEvent)
    } else if (event.actionMasked == MotionEvent.ACTION_UP ||
      event.actionMasked == MotionEvent.ACTION_POINTER_UP
    ) {
      dispatchTouchMoveEvent(event, sourceEvent)
      dispatchTouchUpEvent(event, sourceEvent)
    } else if (event.actionMasked == MotionEvent.ACTION_MOVE) {
      dispatchTouchMoveEvent(event, sourceEvent)
    }
  }

  private fun extractAllPointersData() {
    allTouchesPayload = null

    for (pointerData in trackedPointers) {
      if (pointerData != null) {
        addPointerToAll(pointerData)
      }
    }
  }

  private fun cancelPointers() {
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCH_CANCELLED
    changedTouchesPayload = null
    extractAllPointersData()

    for (pointer in trackedPointers) {
      pointer?.let {
        addChangedPointer(it)
      }
    }

    trackedPointersCount = 0
    trackedPointers.fill(null)

    dispatchTouchEvent()
  }

  private fun addChangedPointer(pointerData: PointerData) {
    if (changedTouchesPayload == null) {
      changedTouchesPayload = Arguments.createArray()
    }

    changedTouchesPayload!!.pushMap(createPointerData(pointerData))
  }

  private fun addPointerToAll(pointerData: PointerData) {
    if (allTouchesPayload == null) {
      allTouchesPayload = Arguments.createArray()
    }

    allTouchesPayload!!.pushMap(createPointerData(pointerData))
  }

  private fun createPointerData(pointerData: PointerData) = Arguments.createMap().apply {
    putInt("id", pointerData.pointerId)
    putDouble("x", PixelUtil.toDIPFromPixel(pointerData.x).toDouble())
    putDouble("y", PixelUtil.toDIPFromPixel(pointerData.y).toDouble())
    putDouble("absoluteX", PixelUtil.toDIPFromPixel(pointerData.absoluteX).toDouble())
    putDouble("absoluteY", PixelUtil.toDIPFromPixel(pointerData.absoluteY).toDouble())
  }

  fun consumeChangedTouchesPayload(): WritableArray? {
    val result = changedTouchesPayload
    changedTouchesPayload = null
    return result
  }

  fun consumeAllTouchesPayload(): WritableArray? {
    val result = allTouchesPayload
    allTouchesPayload = null
    return result
  }

  private fun moveToState(newState: Int) {
    UiThreadUtil.assertOnUiThread()
    if (state == newState) {
      return
    }

    // if there are tracked pointers and the gesture is about to end, send event cancelling all pointers
    if (trackedPointersCount > 0 &&
      (newState == STATE_END || newState == STATE_CANCELLED || newState == STATE_FAILED)
    ) {
      cancelPointers()
    }

    val oldState = state
    state = newState
    if (state == STATE_ACTIVE) {
      // Generate a unique coalescing-key each time the gesture-handler becomes active. All events will have
      // the same coalescing-key allowing EventDispatcher to coalesce RNGestureHandlerEvents when events are
      // generated faster than they can be treated by JS thread
      eventCoalescingKey = nextEventCoalescingKey++
    }
    orchestrator!!.onHandlerStateChange(this, newState, oldState)
    onStateChange(newState, oldState)
  }

  fun wantsEvent(event: MotionEvent): Boolean = isEnabled &&
    state != STATE_FAILED &&
    state != STATE_CANCELLED &&
    state != STATE_END &&
    isTrackingPointer(event.getPointerId(event.actionIndex))

  open fun shouldRequireToWaitForFailure(handler: GestureHandler): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldRequireHandlerToWaitForFailure(this, handler) ?: false
  }

  fun shouldWaitForHandlerFailure(handler: GestureHandler): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldWaitForHandlerFailure(this, handler) ?: false
  }

  open fun shouldRecognizeSimultaneously(handler: GestureHandler): Boolean {
    if (handler === this) {
      return true
    }

    return interactionController?.shouldRecognizeSimultaneously(this, handler) ?: false
  }

  open fun shouldBeCancelledBy(handler: GestureHandler): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldHandlerBeCancelledBy(this, handler) ?: false
  }

  fun isWithinBounds(view: View?, posX: Float, posY: Float): Boolean {
    if (RNSVGHitTester.isSvgElement(view!!)) {
      return RNSVGHitTester.hitTest(view, posX, posY)
    }

    var left = 0f
    var top = 0f
    var right = view.width.toFloat()
    var bottom = view.height.toFloat()
    hitSlop?.let { hitSlop ->
      val padLeft = hitSlop[HIT_SLOP_LEFT_IDX]
      val padTop = hitSlop[HIT_SLOP_TOP_IDX]
      val padRight = hitSlop[HIT_SLOP_RIGHT_IDX]
      val padBottom = hitSlop[HIT_SLOP_BOTTOM_IDX]
      if (hitSlopSet(padLeft)) {
        left -= padLeft
      }
      if (hitSlopSet(padTop)) {
        top -= padTop
      }
      if (hitSlopSet(padRight)) {
        right += padRight
      }
      if (hitSlopSet(padBottom)) {
        bottom += padBottom
      }
      val width = hitSlop[HIT_SLOP_WIDTH_IDX]
      val height = hitSlop[HIT_SLOP_HEIGHT_IDX]
      if (hitSlopSet(width)) {
        if (!hitSlopSet(padLeft)) {
          left = right - width
        } else if (!hitSlopSet(padRight)) {
          right = left + width
        }
      }
      if (hitSlopSet(height)) {
        if (!hitSlopSet(padTop)) {
          top = bottom - height
        } else if (!hitSlopSet(padBottom)) {
          bottom = top + height
        }
      }
    }
    return posX in left..right && posY in top..bottom
  }

  fun cancel() {
    if (state == STATE_ACTIVE ||
      state == STATE_UNDETERMINED ||
      state == STATE_BEGAN ||
      this.isAwaiting
    ) {
      onCancel()
      moveToState(STATE_CANCELLED)
    }
  }

  fun fail() {
    if (state == STATE_ACTIVE || state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      onFail()
      moveToState(STATE_FAILED)
    }
  }

  fun activate() = activate(force = false)

  open fun activate(force: Boolean) {
    if ((!manualActivation || force) && (state == STATE_UNDETERMINED || state == STATE_BEGAN)) {
      moveToState(STATE_ACTIVE)
    }
  }

  fun begin() {
    if (state == STATE_UNDETERMINED) {
      moveToState(STATE_BEGAN)
    }
  }

  fun end() {
    if (state == STATE_BEGAN || state == STATE_ACTIVE) {
      moveToState(STATE_END)
    }
  }

  /*
   * Returns true if the view this handler is attached to is a descendant of the view the other handler
   * is attached to and false otherwise.
   */
  fun isDescendantOf(of: GestureHandler): Boolean {
    var view = this.view?.parent as? View
    while (view != null) {
      if (view == of.view) {
        return true
      }

      view = view.parent as? View
    }
    return false
  }

  // responsible for resetting the state of handler upon activation (may be called more than once
  // if the handler is waiting for failure of other one)
  open fun resetProgress() {}

  protected open fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    moveToState(STATE_FAILED)
  }

  protected open fun onHandleHover(event: MotionEvent, sourceEvent: MotionEvent) {}

  protected open fun onStateChange(newState: Int, previousState: Int) {}
  protected open fun onReset() {}
  protected open fun onCancel() {}
  protected open fun onFail() {}

  private fun isButtonInConfig(clickedButton: Int): Boolean {
    if (mouseButton == 0) {
      return clickedButton == MotionEvent.BUTTON_PRIMARY
    }

    return clickedButton and mouseButton != 0
  }

  protected fun shouldActivateWithMouse(sourceEvent: MotionEvent): Boolean {
    // While using mouse, we get both sets of events, for example ACTION_DOWN and ACTION_BUTTON_PRESS. That's why we want to take actions to only one of them.
    // On API >= 23, we will use events with infix BUTTON, otherwise we use standard action events (like ACTION_DOWN).

    with(sourceEvent) {
      // To use actionButton, we need API >= 23.
      if (getToolType(0) == MotionEvent.TOOL_TYPE_MOUSE &&
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
      ) {
        // While using mouse, we want to ignore default events for touch.
        if (action == MotionEvent.ACTION_DOWN ||
          action == MotionEvent.ACTION_UP ||
          action == MotionEvent.ACTION_POINTER_UP ||
          action == MotionEvent.ACTION_POINTER_DOWN
        ) {
          return@shouldActivateWithMouse false
        }

        // We don't want to do anything if wrong button was clicked. If we received event for BUTTON, we have to use actionButton to get which one was clicked.
        if (action != MotionEvent.ACTION_MOVE && !isButtonInConfig(actionButton)) {
          return@shouldActivateWithMouse false
        }

        // When we receive ACTION_MOVE, we have to check buttonState field.
        if (action == MotionEvent.ACTION_MOVE && !isButtonInConfig(buttonState)) {
          return@shouldActivateWithMouse false
        }
      } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        // We do not fully support mouse below API 23, so we will ignore BUTTON events.
        if (action == MotionEvent.ACTION_BUTTON_PRESS ||
          action == MotionEvent.ACTION_BUTTON_RELEASE
        ) {
          return@shouldActivateWithMouse false
        }
      }
    }

    return true
  }

  /**
   * Transforms a point in the coordinate space of the wrapperView (GestureHandlerRootView) to
   * coordinate space of the view the gesture is attached to.
   *
   * If the gesture handler is not currently attached to a view, it will return (NaN, NaN).
   *
   * This method modifies and transforms the received point.
   */
  protected fun transformPoint(point: PointF): PointF =
    orchestrator?.transformPointToViewCoords(this.view, point) ?: run {
      point.x = Float.NaN
      point.y = Float.NaN
      point
    }
  fun reset() {
    view = null
    orchestrator = null
    Arrays.fill(trackedPointerIDs, -1)
    trackedPointersIDsCount = 0
    trackedPointersCount = 0
    trackedPointers.fill(null)
    touchEventType = RNGestureHandlerTouchEvent.EVENT_UNDETERMINED
    onReset()
  }

  fun withMarkedAsInBounds(closure: () -> Unit) {
    isWithinBounds = true
    closure()
    isWithinBounds = false
  }

  private fun setPointerType(event: MotionEvent) {
    val pointerIndex = event.actionIndex

    pointerType = when (event.getToolType(pointerIndex)) {
      MotionEvent.TOOL_TYPE_FINGER -> POINTER_TYPE_TOUCH
      MotionEvent.TOOL_TYPE_STYLUS -> POINTER_TYPE_STYLUS
      MotionEvent.TOOL_TYPE_MOUSE -> POINTER_TYPE_MOUSE
      else -> POINTER_TYPE_OTHER
    }
  }

  open fun wantsToAttachDirectlyToView() = false

  override fun toString(): String {
    val viewString = if (view == null) null else view!!.javaClass.simpleName
    return this.javaClass.simpleName + "@[" + tag + "]:" + viewString
  }

  val lastRelativePositionX: Float
    get() = lastAbsolutePositionX
  val lastRelativePositionY: Float
    get() = lastAbsolutePositionY

  val lastPositionInWindowX: Float
    get() = lastAbsolutePositionX + lastEventOffsetX - windowOffset[0]
  val lastPositionInWindowY: Float
    get() = lastAbsolutePositionY + lastEventOffsetY - windowOffset[1]

  abstract class Factory<T : GestureHandler> {
    abstract val type: Class<T>
    abstract val name: String
    private val interactionManager = RNGestureHandlerInteractionManager()
    protected abstract fun create(context: Context?): T

    fun create(context: Context?, handlerTag: Int): T = create(context).also { it.tag = handlerTag }

    fun setConfig(handler: T, config: ReadableMap) {
      handler.resetConfig()
      updateConfig(handler, config)
    }

    open fun updateConfig(handler: T, config: ReadableMap) {
      if (config.hasKey(KEY_SHOULD_CANCEL_WHEN_OUTSIDE)) {
        handler.shouldCancelWhenOutside = config.getBoolean(KEY_SHOULD_CANCEL_WHEN_OUTSIDE)
      }
      if (config.hasKey(KEY_ENABLED)) {
        handler.isEnabled = config.getBoolean(KEY_ENABLED)
      }
      if (config.hasKey(KEY_HIT_SLOP)) {
        handleHitSlopProperty(handler, config)
      }
      if (config.hasKey(KEY_NEEDS_POINTER_DATA)) {
        handler.needsPointerData = config.getBoolean(KEY_NEEDS_POINTER_DATA)
      }
      if (config.hasKey(KEY_DISPATCHES_ANIMATED_EVENTS)) {
        handler.dispatchesAnimatedEvents = config.getBoolean(KEY_DISPATCHES_ANIMATED_EVENTS)
      }
      if (config.hasKey(KEY_SHOULD_USE_REANIMATED)) {
        handler.dispatchesReanimatedEvents = config.getBoolean(KEY_SHOULD_USE_REANIMATED)
      }
      if (config.hasKey(KEY_MANUAL_ACTIVATION)) {
        handler.manualActivation = config.getBoolean(KEY_MANUAL_ACTIVATION)
      }
      if (config.hasKey(KEY_MOUSE_BUTTON)) {
        handler.mouseButton = config.getInt(KEY_MOUSE_BUTTON)
      }
      if (handler.actionType != ACTION_TYPE_NATIVE_DETECTOR) {
        interactionManager.dropRelationsForHandlerWithTag(handler.tag)
        interactionManager.configureInteractions(handler, config)
      }
    }

    abstract fun createEventBuilder(handler: T): GestureHandlerEventDataBuilder<T>

    companion object {
      private const val KEY_SHOULD_CANCEL_WHEN_OUTSIDE = "shouldCancelWhenOutside"
      private const val KEY_ENABLED = "enabled"
      private const val KEY_NEEDS_POINTER_DATA = "needsPointerData"
      private const val KEY_DISPATCHES_ANIMATED_EVENTS = "dispatchesAnimatedEvents"
      private const val KEY_SHOULD_USE_REANIMATED = "shouldUseReanimated"
      private const val KEY_MANUAL_ACTIVATION = "manualActivation"
      private const val KEY_MOUSE_BUTTON = "mouseButton"
      private const val KEY_HIT_SLOP = "hitSlop"
      private const val KEY_HIT_SLOP_LEFT = "left"
      private const val KEY_HIT_SLOP_TOP = "top"
      private const val KEY_HIT_SLOP_RIGHT = "right"
      private const val KEY_HIT_SLOP_BOTTOM = "bottom"
      private const val KEY_HIT_SLOP_VERTICAL = "vertical"
      private const val KEY_HIT_SLOP_HORIZONTAL = "horizontal"
      private const val KEY_HIT_SLOP_WIDTH = "width"
      private const val KEY_HIT_SLOP_HEIGHT = "height"

      private fun handleHitSlopProperty(handler: GestureHandler, config: ReadableMap) {
        if (config.getType(KEY_HIT_SLOP) == ReadableType.Number) {
          val hitSlop = PixelUtil.toPixelFromDIP(config.getDouble(KEY_HIT_SLOP))
          handler.setHitSlop(
            hitSlop,
            hitSlop,
            hitSlop,
            hitSlop,
            GestureHandler.HIT_SLOP_NONE,
            GestureHandler.HIT_SLOP_NONE,
          )
        } else {
          val hitSlop = config.getMap(KEY_HIT_SLOP)!!
          var left = GestureHandler.HIT_SLOP_NONE
          var top = GestureHandler.HIT_SLOP_NONE
          var right = GestureHandler.HIT_SLOP_NONE
          var bottom = GestureHandler.HIT_SLOP_NONE
          var width = GestureHandler.HIT_SLOP_NONE
          var height = GestureHandler.HIT_SLOP_NONE
          if (hitSlop.hasKey(KEY_HIT_SLOP_HORIZONTAL)) {
            val horizontalPad = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_HORIZONTAL))
            right = horizontalPad
            left = right
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_VERTICAL)) {
            val verticalPad = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_VERTICAL))
            bottom = verticalPad
            top = bottom
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_LEFT)) {
            left = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_LEFT))
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_TOP)) {
            top = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_TOP))
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_RIGHT)) {
            right = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_RIGHT))
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_BOTTOM)) {
            bottom = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_BOTTOM))
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_WIDTH)) {
            width = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_WIDTH))
          }
          if (hitSlop.hasKey(KEY_HIT_SLOP_HEIGHT)) {
            height = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_HEIGHT))
          }
          handler.setHitSlop(left, top, right, bottom, width, height)
        }
      }
    }
  }

  companion object {
    private const val DEFAULT_NEEDS_POINTER_DATA = false
    private const val DEFAULT_MANUAL_ACTIVATION = false
    private const val DEFAULT_SHOULD_CANCEL_WHEN_OUTSIDE = false
    private const val DEFAULT_IS_ENABLED = true
    private val DEFAULT_HIT_SLOP = null
    private const val DEFAULT_MOUSE_BUTTON = 0
    private const val DEFAULT_DISPATCHES_ANIMATED_EVENTS = false
    private const val DEFAULT_DISPATCHES_REANIMATED_EVENTS = false

    const val STATE_UNDETERMINED = 0
    const val STATE_FAILED = 1
    const val STATE_BEGAN = 2
    const val STATE_CANCELLED = 3
    const val STATE_ACTIVE = 4
    const val STATE_END = 5
    const val HIT_SLOP_NONE = Float.NaN
    private const val HIT_SLOP_LEFT_IDX = 0
    private const val HIT_SLOP_TOP_IDX = 1
    private const val HIT_SLOP_RIGHT_IDX = 2
    private const val HIT_SLOP_BOTTOM_IDX = 3
    private const val HIT_SLOP_WIDTH_IDX = 4
    private const val HIT_SLOP_HEIGHT_IDX = 5
    const val DIRECTION_RIGHT = 1
    const val DIRECTION_LEFT = 2
    const val DIRECTION_UP = 4
    const val DIRECTION_DOWN = 8
    const val ACTION_TYPE_REANIMATED_WORKLET = 1
    const val ACTION_TYPE_NATIVE_ANIMATED_EVENT = 2
    const val ACTION_TYPE_JS_FUNCTION_OLD_API = 3
    const val ACTION_TYPE_JS_FUNCTION_NEW_API = 4
    const val ACTION_TYPE_NATIVE_DETECTOR = 5
    const val POINTER_TYPE_TOUCH = 0
    const val POINTER_TYPE_STYLUS = 1
    const val POINTER_TYPE_MOUSE = 2
    const val POINTER_TYPE_OTHER = 3
    private const val MAX_POINTERS_COUNT = 12
    private lateinit var pointerProps: Array<PointerProperties?>
    private lateinit var pointerCoords: Array<PointerCoords?>
    private fun initPointerProps(size: Int) {
      var pointerPropsSize = size
      if (!Companion::pointerProps.isInitialized) {
        pointerProps = arrayOfNulls(MAX_POINTERS_COUNT)
        pointerCoords = arrayOfNulls(MAX_POINTERS_COUNT)
      }
      while (pointerPropsSize > 0 && pointerProps[pointerPropsSize - 1] == null) {
        pointerProps[pointerPropsSize - 1] = PointerProperties()
        pointerCoords[pointerPropsSize - 1] = PointerCoords()
        pointerPropsSize--
      }
    }

    private var nextEventCoalescingKey: Short = 0
    private fun hitSlopSet(value: Float): Boolean = !java.lang.Float.isNaN(value)

    fun stateToString(state: Int): String? {
      when (state) {
        STATE_UNDETERMINED -> return "UNDETERMINED"
        STATE_ACTIVE -> return "ACTIVE"
        STATE_FAILED -> return "FAILED"
        STATE_BEGAN -> return "BEGIN"
        STATE_CANCELLED -> return "CANCELLED"
        STATE_END -> return "END"
      }
      return null
    }
  }

  private data class PointerData(
    val pointerId: Int,
    var x: Float,
    var y: Float,
    var absoluteX: Float,
    var absoluteY: Float,
  )
}
