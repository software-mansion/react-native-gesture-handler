package com.swmansion.gesturehandler

import android.view.MotionEvent
import android.view.MotionEvent.PointerCoords
import android.view.MotionEvent.PointerProperties
import android.view.View
import com.facebook.react.bridge.UiThreadUtil
import java.util.*

open class GestureHandler<ConcreteGestureHandlerT : GestureHandler<ConcreteGestureHandlerT>> {
  private val mTrackedPointerIDs = IntArray(MAX_POINTERS_COUNT)
  private var mTrackedPointersCount = 0
  var tag = 0
  var view: View? = null
    private set
  var state = STATE_UNDETERMINED
    private set
  var x = 0f
    private set
  var y = 0f
    private set
  var isWithinBounds = false
    private set
  var isEnabled = true
    private set

  private var mHitSlop: FloatArray? = null
  var eventCoalescingKey: Short = 0
    private set
  var lastAbsolutePositionX = 0f
    private set
  var lastAbsolutePositionY = 0f
    private set

  private var mLastEventOffsetX = 0f
  private var mLastEventOffsetY = 0f
  private var mShouldCancelWhenOutside = false
  var numberOfPointers = 0
    private set
  private var mOrchestrator: GestureHandlerOrchestrator? = null
  private var mListener: OnTouchEventListener<ConcreteGestureHandlerT>? = null
  private var mInteractionController: GestureHandlerInteractionController? = null

  @Suppress("UNCHECKED_CAST")
  protected fun self(): ConcreteGestureHandlerT = this as ConcreteGestureHandlerT

  protected inline fun applySelf(block: ConcreteGestureHandlerT.() -> Unit): ConcreteGestureHandlerT =
    self().apply { block() }

  // set and accessed only by the orchestrator
  @JvmField
  var mActivationIndex = 0

  // set and accessed only by the orchestrator
  @JvmField
  var mIsActive = false

  // set and accessed only by the orchestrator
  @JvmField
  var mIsAwaiting = false

  open fun dispatchStateChange(newState: Int, prevState: Int) {
    mListener?.onStateChange(self(), newState, prevState)
  }

  open fun dispatchTouchEvent(event: MotionEvent?) {
    mListener?.onTouchEvent(self(), event)
  }

  open fun resetConfig() {
    mShouldCancelWhenOutside = false
    isEnabled = true
    mHitSlop = null
  }

  fun hasCommonPointers(other: GestureHandler<*>): Boolean {
    for (i in mTrackedPointerIDs.indices) {
      if (mTrackedPointerIDs[i] != -1 && other.mTrackedPointerIDs[i] != -1) {
        return true
      }
    }
    return false
  }

  fun setShouldCancelWhenOutside(shouldCancelWhenOutside: Boolean) = applySelf {
    mShouldCancelWhenOutside = shouldCancelWhenOutside
  }

  fun setEnabled(enabled: Boolean) = applySelf {
    if (view != null) {
      // If view is set then handler is in "active" state. In that case we want to "cancel" handler
      // when it changes enabled state so that it gets cleared from the orchestrator
      UiThreadUtil.runOnUiThread { cancel() }
    }
    isEnabled = enabled
  }

  fun setHitSlop(leftPad: Float, topPad: Float, rightPad: Float, bottomPad: Float, width: Float, height: Float) = applySelf {
    if (mHitSlop == null) {
      mHitSlop = FloatArray(6)
    }
    mHitSlop!![HIT_SLOP_LEFT_IDX] = leftPad
    mHitSlop!![HIT_SLOP_TOP_IDX] = topPad
    mHitSlop!![HIT_SLOP_RIGHT_IDX] = rightPad
    mHitSlop!![HIT_SLOP_BOTTOM_IDX] = bottomPad
    mHitSlop!![HIT_SLOP_WIDTH_IDX] = width
    mHitSlop!![HIT_SLOP_HEIGHT_IDX] = height
    require(!(hitSlopSet(width) && hitSlopSet(leftPad) && hitSlopSet(rightPad))) { "Cannot have all of left, right and width defined" }
    require(!(hitSlopSet(width) && !hitSlopSet(leftPad) && !hitSlopSet(rightPad))) { "When width is set one of left or right pads need to be defined" }
    require(!(hitSlopSet(height) && hitSlopSet(bottomPad) && hitSlopSet(topPad))) { "Cannot have all of top, bottom and height defined" }
    require(!(hitSlopSet(height) && !hitSlopSet(bottomPad) && !hitSlopSet(topPad))) { "When height is set one of top or bottom pads need to be defined" }
  }

  fun setHitSlop(padding: Float): ConcreteGestureHandlerT {
    return setHitSlop(padding, padding, padding, padding, HIT_SLOP_NONE, HIT_SLOP_NONE)
  }

  fun setInteractionController(controller: GestureHandlerInteractionController?) = applySelf {
    mInteractionController = controller
  }

  fun prepare(view: View?, orchestrator: GestureHandlerOrchestrator?) {
    check(!(this.view != null || mOrchestrator != null)) { "Already prepared or hasn't been reset" }
    Arrays.fill(mTrackedPointerIDs, -1)
    mTrackedPointersCount = 0
    state = STATE_UNDETERMINED
    this.view = view
    mOrchestrator = orchestrator
  }

  private fun findNextLocalPointerId(): Int {
    var localPointerId = 0
    while (localPointerId < mTrackedPointersCount) {
      var i = 0
      while (i < mTrackedPointerIDs.size) {
        if (mTrackedPointerIDs[i] == localPointerId) {
          break
        }
        i++
      }
      if (i == mTrackedPointerIDs.size) {
        return localPointerId
      }
      localPointerId++
    }
    return localPointerId
  }

  fun startTrackingPointer(pointerId: Int) {
    if (mTrackedPointerIDs[pointerId] == -1) {
      mTrackedPointerIDs[pointerId] = findNextLocalPointerId()
      mTrackedPointersCount++
    }
  }

  fun stopTrackingPointer(pointerId: Int) {
    if (mTrackedPointerIDs[pointerId] != -1) {
      mTrackedPointerIDs[pointerId] = -1
      mTrackedPointersCount--
    }
  }

  private fun needAdapt(event: MotionEvent): Boolean {
    if (event.pointerCount != mTrackedPointersCount) {
      return true
    }

    for (i in mTrackedPointerIDs.indices) {
      val trackedPointer = mTrackedPointerIDs[i]
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
      action = if (mTrackedPointerIDs[actionPointer] != -1) {
        if (mTrackedPointersCount == 1) MotionEvent.ACTION_DOWN else MotionEvent.ACTION_POINTER_DOWN
      } else {
        MotionEvent.ACTION_MOVE
      }
    } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) {
      actionIndex = event.actionIndex
      val actionPointer = event.getPointerId(actionIndex)
      action = if (mTrackedPointerIDs[actionPointer] != -1) {
        if (mTrackedPointersCount == 1) MotionEvent.ACTION_UP else MotionEvent.ACTION_POINTER_UP
      } else {
        MotionEvent.ACTION_MOVE
      }
    }
    initPointerProps(mTrackedPointersCount)
    var count = 0
    val oldX = event.x
    val oldY = event.y
    event.setLocation(event.rawX, event.rawY)
    var index = 0
    val size = event.pointerCount
    while (index < size) {
      val origPointerId = event.getPointerId(index)
      if (mTrackedPointerIDs[origPointerId] != -1) {
        event.getPointerProperties(index, sPointerProps[count])
        sPointerProps[count]!!.id = mTrackedPointerIDs[origPointerId]
        event.getPointerCoords(index, sPointerCoords[count])
        if (index == actionIndex) {
          action = action or (count shl MotionEvent.ACTION_POINTER_INDEX_SHIFT)
        }
        count++
      }
      index++
    }
    val result = MotionEvent.obtain(
      event.downTime,
      event.eventTime,
      action,
      count,
      sPointerProps,  /* props are copied and hence it is safe to use static array here */
      sPointerCoords,  /* same applies to coords */
      event.metaState,
      event.buttonState,
      event.xPrecision,
      event.yPrecision,
      event.deviceId,
      event.edgeFlags,
      event.source,
      event.flags)
    event.setLocation(oldX, oldY)
    result.setLocation(oldX, oldY)
    return result
  }

  fun handle(origEvent: MotionEvent) {
    if (!isEnabled
      || state == STATE_CANCELLED
      || state == STATE_FAILED
      || state == STATE_END
      || mTrackedPointersCount < 1) {
      return
    }
    val event = adaptEvent(origEvent)
    x = event.x
    y = event.y
    numberOfPointers = event.pointerCount
    isWithinBounds = isWithinBounds(view, x, y)
    if (mShouldCancelWhenOutside && !isWithinBounds) {
      if (state == STATE_ACTIVE) {
        cancel()
      } else if (state == STATE_BEGAN) {
        fail()
      }
      return
    }
    lastAbsolutePositionX = GestureUtils.getLastPointerX(event, true)
    lastAbsolutePositionY = GestureUtils.getLastPointerY(event, true)
    mLastEventOffsetX = event.rawX - event.x
    mLastEventOffsetY = event.rawY - event.y
    onHandle(event)
    if (event != origEvent) {
      event.recycle()
    }
  }

  private fun moveToState(newState: Int) {
    UiThreadUtil.assertOnUiThread()
    if (state == newState) {
      return
    }
    val oldState = state
    state = newState
    if (state == STATE_ACTIVE) {
      // Generate a unique coalescing-key each time the gesture-handler becomes active. All events will have
      // the same coalescing-key allowing EventDispatcher to coalesce RNGestureHandlerEvents when events are
      // generated faster than they can be treated by JS thread
      eventCoalescingKey = sNextEventCoalescingKey++
    }
    mOrchestrator!!.onHandlerStateChange(this, newState, oldState)
    onStateChange(newState, oldState)
  }

  fun wantEvents(): Boolean {
    return isEnabled
      && state != STATE_FAILED
      && state != STATE_CANCELLED
      && state != STATE_END
      && mTrackedPointersCount > 0
  }

  open fun shouldRequireToWaitForFailure(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return mInteractionController?.shouldRequireHandlerToWaitForFailure(this, handler) ?: false
  }

  fun shouldWaitForHandlerFailure(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return mInteractionController?.shouldWaitForHandlerFailure(this, handler) ?: false
  }

  open fun shouldRecognizeSimultaneously(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return true
    }

    return mInteractionController?.shouldRecognizeSimultaneously(this, handler) ?: false
  }

  open fun shouldBeCancelledBy(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return mInteractionController?.shouldHandlerBeCancelledBy(this, handler) ?: false
  }

  fun isWithinBounds(view: View?, posX: Float, posY: Float): Boolean {
    var left = 0f
    var top = 0f
    var right = view!!.width.toFloat()
    var bottom = view.height.toFloat()
    if (mHitSlop != null) {
      val padLeft = mHitSlop!![HIT_SLOP_LEFT_IDX]
      val padTop = mHitSlop!![HIT_SLOP_TOP_IDX]
      val padRight = mHitSlop!![HIT_SLOP_RIGHT_IDX]
      val padBottom = mHitSlop!![HIT_SLOP_BOTTOM_IDX]
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
      val width = mHitSlop!![HIT_SLOP_WIDTH_IDX]
      val height = mHitSlop!![HIT_SLOP_HEIGHT_IDX]
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
    return posX in left..right && posY >= top && posY <= bottom
  }

  fun cancel() {
    if (state == STATE_ACTIVE || state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      onCancel()
      moveToState(STATE_CANCELLED)
    }
  }

  fun fail() {
    if (state == STATE_ACTIVE || state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      moveToState(STATE_FAILED)
    }
  }

  fun activate() {
    if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
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

  protected open fun onHandle(event: MotionEvent) {
    moveToState(STATE_FAILED)
  }

  protected open fun onStateChange(newState: Int, previousState: Int) {}
  protected open fun onReset() {}
  protected open fun onCancel() {}
  fun reset() {
    view = null
    mOrchestrator = null
    Arrays.fill(mTrackedPointerIDs, -1)
    mTrackedPointersCount = 0
    onReset()
  }

  fun setOnTouchEventListener(listener: OnTouchEventListener<ConcreteGestureHandlerT>?): GestureHandler<*> {
    mListener = listener
    return this
  }

  override fun toString(): String {
    val viewString = if (view == null) null else view!!.javaClass.simpleName
    return this.javaClass.simpleName + "@[" + tag + "]:" + viewString
  }

  val lastRelativePositionX: Float
    get() = lastAbsolutePositionX - mLastEventOffsetX
  val lastRelativePositionY: Float
    get() = lastAbsolutePositionY - mLastEventOffsetY

  companion object {
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
    private const val MAX_POINTERS_COUNT = 12
    private lateinit var sPointerProps: Array<PointerProperties?>
    private lateinit var sPointerCoords: Array<PointerCoords?>
    private fun initPointerProps(size: Int) {
      var size = size
      if (!::sPointerProps.isInitialized) {
        sPointerProps = arrayOfNulls(MAX_POINTERS_COUNT)
        sPointerCoords = arrayOfNulls(MAX_POINTERS_COUNT)
      }
      while (size > 0 && sPointerProps[size - 1] == null) {
        sPointerProps[size - 1] = PointerProperties()
        sPointerCoords[size - 1] = PointerCoords()
        size--
      }
    }

    private var sNextEventCoalescingKey: Short = 0
    private fun hitSlopSet(value: Float): Boolean {
      return !java.lang.Float.isNaN(value)
    }

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
}
