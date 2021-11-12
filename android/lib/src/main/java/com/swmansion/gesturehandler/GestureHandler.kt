package com.swmansion.gesturehandler

import android.view.MotionEvent
import android.view.MotionEvent.PointerCoords
import android.view.MotionEvent.PointerProperties
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableArray
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.react.RNGestureHandlerTouchEvent
import java.lang.IllegalStateException
import java.util.*

open class GestureHandler<ConcreteGestureHandlerT : GestureHandler<ConcreteGestureHandlerT>> {
  private val trackedPointerIDs = IntArray(MAX_TOUCHES_COUNT)
  private var trackedPointersIDsCount = 0
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
  var usesDeviceEvents = false

  var needsTouchData = false
  var touchEventPayload: WritableArray? = null
    private set
  var touchEventType = RNGestureHandlerTouchEvent.EVENT_UNDETERMINED
    private set
  var trackedTouchesCount = 0
    private set
  private val trackedTouches: Array<TouchData?> = Array(MAX_TOUCHES_COUNT) { null }

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
  private var shouldCancelWhenOutside = false
  var numberOfPointers = 0
    private set
  private var orchestrator: GestureHandlerOrchestrator? = null
  private var onTouchEventListener: OnTouchEventListener? = null
  private var interactionController: GestureHandlerInteractionController? = null

  @Suppress("UNCHECKED_CAST")
  protected fun self(): ConcreteGestureHandlerT = this as ConcreteGestureHandlerT

  protected inline fun applySelf(block: ConcreteGestureHandlerT.() -> Unit): ConcreteGestureHandlerT =
    self().apply { block() }

  // set and accessed only by the orchestrator
  var activationIndex = 0

  // set and accessed only by the orchestrator
  var isActive = false

  // set and accessed only by the orchestrator
  var isAwaiting = false

  open fun dispatchStateChange(newState: Int, prevState: Int) {
    onTouchEventListener?.onStateChange(self(), newState, prevState)
  }

  open fun dispatchTouchEvent(event: MotionEvent) {
    onTouchEventListener?.onHandlerEvent(self(), event)
  }

  open fun dispatchTouchEvent() {
    if (touchEventPayload != null) {
      onTouchEventListener?.onTouchEvent(self())
    }
  }

  open fun resetConfig() {
    needsTouchData = false
    manualActivation = false
    shouldCancelWhenOutside = false
    isEnabled = true
    hitSlop = null
  }

  fun hasCommonPointers(other: GestureHandler<*>): Boolean {
    for (i in trackedPointerIDs.indices) {
      if (trackedPointerIDs[i] != -1 && other.trackedPointerIDs[i] != -1) {
        return true
      }
    }
    return false
  }

  fun setShouldCancelWhenOutside(shouldCancelWhenOutside: Boolean): ConcreteGestureHandlerT =
    applySelf { this.shouldCancelWhenOutside = shouldCancelWhenOutside }

  fun setEnabled(enabled: Boolean): ConcreteGestureHandlerT = applySelf {
    if (view != null) {
      // If view is set then handler is in "active" state. In that case we want to "cancel" handler
      // when it changes enabled state so that it gets cleared from the orchestrator
      UiThreadUtil.runOnUiThread { cancel() }
    }
    isEnabled = enabled
  }

  fun setManualActivation(manualActivation: Boolean): ConcreteGestureHandlerT =
      applySelf { this.manualActivation = manualActivation }

  fun setHitSlop(
    leftPad: Float, topPad: Float, rightPad: Float, bottomPad: Float,
    width: Float, height: Float,
  ): ConcreteGestureHandlerT = applySelf {
    if (hitSlop == null) {
      hitSlop = FloatArray(6)
    }
    hitSlop!![HIT_SLOP_LEFT_IDX] = leftPad
    hitSlop!![HIT_SLOP_TOP_IDX] = topPad
    hitSlop!![HIT_SLOP_RIGHT_IDX] = rightPad
    hitSlop!![HIT_SLOP_BOTTOM_IDX] = bottomPad
    hitSlop!![HIT_SLOP_WIDTH_IDX] = width
    hitSlop!![HIT_SLOP_HEIGHT_IDX] = height
    require(!(hitSlopSet(width) && hitSlopSet(leftPad) && hitSlopSet(rightPad))) { "Cannot have all of left, right and width defined" }
    require(!(hitSlopSet(width) && !hitSlopSet(leftPad) && !hitSlopSet(rightPad))) { "When width is set one of left or right pads need to be defined" }
    require(!(hitSlopSet(height) && hitSlopSet(bottomPad) && hitSlopSet(topPad))) { "Cannot have all of top, bottom and height defined" }
    require(!(hitSlopSet(height) && !hitSlopSet(bottomPad) && !hitSlopSet(topPad))) { "When height is set one of top or bottom pads need to be defined" }
  }

  fun setHitSlop(padding: Float): ConcreteGestureHandlerT {
    return setHitSlop(padding, padding, padding, padding, HIT_SLOP_NONE, HIT_SLOP_NONE)
  }

  fun setInteractionController(controller: GestureHandlerInteractionController?): ConcreteGestureHandlerT =
    applySelf { interactionController = controller }

  fun prepare(view: View?, orchestrator: GestureHandlerOrchestrator?) {
    check(!(this.view != null || this.orchestrator != null)) { "Already prepared or hasn't been reset" }
    Arrays.fill(trackedPointerIDs, -1)
    trackedPointersIDsCount = 0
    state = STATE_UNDETERMINED
    this.view = view
    this.orchestrator = orchestrator
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
    if (trackedPointerIDs[pointerId] == -1) {
      trackedPointerIDs[pointerId] = findNextLocalPointerId()
      trackedPointersIDsCount++
    }
  }

  fun stopTrackingPointer(pointerId: Int) {
    if (trackedPointerIDs[pointerId] != -1) {
      trackedPointerIDs[pointerId] = -1
      trackedPointersIDsCount--
    }
  }

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
        if (trackedPointersIDsCount == 1) MotionEvent.ACTION_DOWN else MotionEvent.ACTION_POINTER_DOWN
      } else {
        MotionEvent.ACTION_MOVE
      }
    } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) {
      actionIndex = event.actionIndex
      val actionPointer = event.getPointerId(actionIndex)
      action = if (trackedPointerIDs[actionPointer] != -1) {
        if (trackedPointersIDsCount == 1) MotionEvent.ACTION_UP else MotionEvent.ACTION_POINTER_UP
      } else {
        MotionEvent.ACTION_MOVE
      }
    }
    initPointerProps(trackedPointersIDsCount)
    var count = 0
    val oldX = event.x
    val oldY = event.y
    event.setLocation(event.rawX, event.rawY)
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
    if(pointerProps.isEmpty()|| pointerCoords.isEmpty()){
      throw IllegalStateException("pointerCoords.size=${pointerCoords.size}, pointerProps.size=${pointerProps.size}")
    }

    val result = MotionEvent.obtain(
      event.downTime,
      event.eventTime,
      action,
      count,
      pointerProps,  /* props are copied and hence it is safe to use static array here */
      pointerCoords,  /* same applies to coords */
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
      || trackedPointersIDsCount < 1) {
      return
    }
    val event = adaptEvent(origEvent)
    x = event.x
    y = event.y
    numberOfPointers = event.pointerCount
    isWithinBounds = isWithinBounds(view, x, y)
    if (shouldCancelWhenOutside && !isWithinBounds) {
      if (state == STATE_ACTIVE) {
        cancel()
      } else if (state == STATE_BEGAN) {
        fail()
      }
      return
    }
    lastAbsolutePositionX = GestureUtils.getLastPointerX(event, true)
    lastAbsolutePositionY = GestureUtils.getLastPointerY(event, true)
    lastEventOffsetX = event.rawX - event.x
    lastEventOffsetY = event.rawY - event.y
    onHandle(event)
    if (event != origEvent) {
      event.recycle()
    }
  }

  private fun dispatchTouchesDownEvent(event: MotionEvent) {
    touchEventPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCHES_DOWN
    val pointerId = event.getPointerId(event.actionIndex)
    val offsetX = event.rawX - event.x
    val offsetY = event.rawY - event.y

    trackedTouches[pointerId] = TouchData(
        pointerId,
        event.getX(event.actionIndex),
        event.getY(event.actionIndex),
        event.getX(event.actionIndex) + offsetX,
        event.getY(event.actionIndex) + offsetY,
    )
    trackedTouchesCount++
    addTouchData(trackedTouches[pointerId]!!)

    dispatchTouchEvent()
  }

  private fun dispatchTouchesUpEvent(event: MotionEvent) {
    touchEventPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCHES_UP
    val pointerId = event.getPointerId(event.actionIndex)
    val offsetX = event.rawX - event.x
    val offsetY = event.rawY - event.y

    trackedTouches[pointerId] = TouchData(
        pointerId,
        event.getX(event.actionIndex),
        event.getY(event.actionIndex),
        event.getX(event.actionIndex) + offsetX,
        event.getY(event.actionIndex) + offsetY,
    )
    addTouchData(trackedTouches[pointerId]!!)
    trackedTouches[pointerId] = null
    trackedTouchesCount--

    dispatchTouchEvent()
  }

  private fun dispatchTouchesMoveEvent(event: MotionEvent) {
    touchEventPayload = null
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCHES_MOVE
    val offsetX = event.rawX - event.x
    val offsetY = event.rawY - event.y
    var touchesAdded = 0

    for (i in 0 until event.pointerCount) {
      val pointerId = event.getPointerId(i)
      val touchData = trackedTouches[pointerId] ?: continue

      if (touchData.x != event.getX(i) || touchData.y != event.getY(i)) {
        touchData.x = event.getX(i)
        touchData.y = event.getY(i)
        touchData.absoluteX = event.getX(i) + offsetX
        touchData.absoluteY = event.getY(i) + offsetY

        addTouchData(touchData)
        touchesAdded++
      }
    }

    // only data about pointers that have changed their position is sent, it makes no sense to send
    // an empty move event (especially when this method is called during down/up event and there is
    // only info about one pointer)
    if (touchesAdded > 0) {
      dispatchTouchEvent()
    }
  }

  fun updateTouchData(event: MotionEvent) {
    if (event.actionMasked == MotionEvent.ACTION_DOWN || event.actionMasked == MotionEvent.ACTION_POINTER_DOWN) {
      dispatchTouchesDownEvent(event)
      dispatchTouchesMoveEvent(event)
    } else if (event.actionMasked == MotionEvent.ACTION_UP || event.actionMasked == MotionEvent.ACTION_POINTER_UP) {
      dispatchTouchesMoveEvent(event)
      dispatchTouchesUpEvent(event)
    } else if (event.actionMasked == MotionEvent.ACTION_MOVE) {
      dispatchTouchesMoveEvent(event)
    }
  }

  private fun cancelTouches() {
    touchEventType = RNGestureHandlerTouchEvent.EVENT_TOUCHES_CANCELLED
    touchEventPayload = null

    for (touch in trackedTouches) {
      touch?.let {
        addTouchData(it)
      }
    }

    trackedTouchesCount = 0
    trackedTouches.fill(null)

    dispatchTouchEvent()
  }

  private fun addTouchData(touchData: TouchData) {
    if (touchEventPayload == null) {
      touchEventPayload = Arguments.createArray()
    }

    touchEventPayload?.pushMap(Arguments.createMap().apply {
      putInt("touchId", touchData.touchId)
      putDouble("x", PixelUtil.toDIPFromPixel(touchData.x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(touchData.y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(touchData.absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(touchData.absoluteY).toDouble())
    })
  }

  fun consumeTouchEventPayload(): WritableArray? {
    val result = touchEventPayload
    touchEventPayload = null
    return result
  }

  private fun moveToState(newState: Int) {
    UiThreadUtil.assertOnUiThread()
    if (state == newState) {
      return
    }

    // if there are tracked pointers and the gesture is about to end, send event cancelling all pointers
    if (trackedTouchesCount > 0 && (newState == STATE_END || newState == STATE_CANCELLED || newState == STATE_FAILED)) {
      cancelTouches()
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

  fun wantEvents(): Boolean {
    return isEnabled
      && state != STATE_FAILED
      && state != STATE_CANCELLED
      && state != STATE_END
      && trackedPointersIDsCount > 0
  }

  open fun shouldRequireToWaitForFailure(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldRequireHandlerToWaitForFailure(this, handler) ?: false
  }

  fun shouldWaitForHandlerFailure(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldWaitForHandlerFailure(this, handler) ?: false
  }

  open fun shouldRecognizeSimultaneously(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return true
    }

    return interactionController?.shouldRecognizeSimultaneously(this, handler) ?: false
  }

  open fun shouldBeCancelledBy(handler: GestureHandler<*>): Boolean {
    if (handler === this) {
      return false
    }

    return interactionController?.shouldHandlerBeCancelledBy(this, handler) ?: false
  }

  fun isWithinBounds(view: View?, posX: Float, posY: Float): Boolean {
    var left = 0f
    var top = 0f
    var right = view!!.width.toFloat()
    var bottom = view.height.toFloat()
    if (hitSlop != null) {
      val padLeft = hitSlop!![HIT_SLOP_LEFT_IDX]
      val padTop = hitSlop!![HIT_SLOP_TOP_IDX]
      val padRight = hitSlop!![HIT_SLOP_RIGHT_IDX]
      val padBottom = hitSlop!![HIT_SLOP_BOTTOM_IDX]
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
      val width = hitSlop!![HIT_SLOP_WIDTH_IDX]
      val height = hitSlop!![HIT_SLOP_HEIGHT_IDX]
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

  open fun activate() {
    if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      moveToState(STATE_ACTIVE)
    }
  }

  fun activateIfNotManual() {
    if (!manualActivation) {
      activate()
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
    orchestrator = null
    Arrays.fill(trackedPointerIDs, -1)
    trackedPointersIDsCount = 0

    trackedTouchesCount = 0
    trackedTouches.fill(null)
    touchEventType = RNGestureHandlerTouchEvent.EVENT_UNDETERMINED
    onReset()
  }

  fun setOnTouchEventListener(listener: OnTouchEventListener?): GestureHandler<*> {
    onTouchEventListener = listener
    return this
  }

  override fun toString(): String {
    val viewString = if (view == null) null else view!!.javaClass.simpleName
    return this.javaClass.simpleName + "@[" + tag + "]:" + viewString
  }

  val lastRelativePositionX: Float
    get() = lastAbsolutePositionX - lastEventOffsetX
  val lastRelativePositionY: Float
    get() = lastAbsolutePositionY - lastEventOffsetY

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
    private const val MAX_TOUCHES_COUNT = 12
    private lateinit var pointerProps: Array<PointerProperties?>
    private lateinit var pointerCoords: Array<PointerCoords?>
    private fun initPointerProps(size: Int) {
      var size = size
      if (!::pointerProps.isInitialized) {
        pointerProps = arrayOfNulls(MAX_TOUCHES_COUNT)
        pointerCoords = arrayOfNulls(MAX_TOUCHES_COUNT)
      }
      while (size > 0 && pointerProps[size - 1] == null) {
        pointerProps[size - 1] = PointerProperties()
        pointerCoords[size - 1] = PointerCoords()
        size--
      }
    }

    private var nextEventCoalescingKey: Short = 0
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

  private data class TouchData(
    val touchId: Int,
    var x: Float,
    var y: Float,
    var absoluteX: Float,
    var absoluteY: Float
  )
}
