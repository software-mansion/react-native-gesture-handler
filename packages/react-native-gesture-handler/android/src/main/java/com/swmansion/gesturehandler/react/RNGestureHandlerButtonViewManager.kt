package com.swmansion.gesturehandler.react

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.graphics.drawable.PaintDrawable
import android.graphics.drawable.RippleDrawable
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.RectShape
import android.os.Build
import android.os.SystemClock
import android.util.TypedValue
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.children
import androidx.interpolator.view.animation.LinearOutSlowInInterpolator
import com.facebook.react.R
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.BackgroundStyleApplicator
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.LengthPercentageType
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.ReactPointerEventsView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.uimanager.style.BorderStyle
import com.facebook.react.uimanager.style.LogicalEdge
import com.facebook.react.viewmanagers.RNGestureHandlerButtonManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonManagerInterface
import com.swmansion.gesturehandler.core.NativeViewGestureHandler
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager.ButtonViewGroup

@ReactModule(name = RNGestureHandlerButtonViewManager.REACT_CLASS)
class RNGestureHandlerButtonViewManager :
  ViewGroupManager<ButtonViewGroup>(),
  RNGestureHandlerButtonManagerInterface<ButtonViewGroup> {
  private val mDelegate: ViewManagerDelegate<ButtonViewGroup>

  init {
    mDelegate = RNGestureHandlerButtonManagerDelegate<ButtonViewGroup, RNGestureHandlerButtonViewManager>(this)
  }

  override fun getName() = REACT_CLASS

  public override fun createViewInstance(context: ThemedReactContext) = ButtonViewGroup(context)

  @TargetApi(Build.VERSION_CODES.M)
  @ReactProp(name = "foreground")
  override fun setForeground(view: ButtonViewGroup, useDrawableOnForeground: Boolean) {
    view.useDrawableOnForeground = useDrawableOnForeground
  }

  @ReactProp(name = "backgroundColor")
  override fun setBackgroundColor(view: ButtonViewGroup, backgroundColor: Int) {
    BackgroundStyleApplicator.setBackgroundColor(view, backgroundColor)
  }

  @ReactProp(name = "borderless")
  override fun setBorderless(view: ButtonViewGroup, useBorderlessDrawable: Boolean) {
    view.useBorderlessDrawable = useBorderlessDrawable
  }

  @ReactProp(name = "enabled")
  override fun setEnabled(view: ButtonViewGroup, enabled: Boolean) {
    view.isEnabled = enabled
  }

  @ReactProp(name = "borderWidth")
  override fun setBorderWidth(view: ButtonViewGroup, borderWidth: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.ALL, borderWidth)
  }

  @ReactProp(name = "borderLeftWidth")
  override fun setBorderLeftWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.LEFT, value)
  }

  @ReactProp(name = "borderRightWidth")
  override fun setBorderRightWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.RIGHT, value)
  }

  @ReactProp(name = "borderTopWidth")
  override fun setBorderTopWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.TOP, value)
  }

  @ReactProp(name = "borderBottomWidth")
  override fun setBorderBottomWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.BOTTOM, value)
  }

  @ReactProp(name = "borderStartWidth")
  override fun setBorderStartWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.START, value)
  }

  @ReactProp(name = "borderEndWidth")
  override fun setBorderEndWidth(view: ButtonViewGroup, value: Float) {
    BackgroundStyleApplicator.setBorderWidth(view, LogicalEdge.END, value)
  }

  @ReactProp(name = "borderColor")
  override fun setBorderColor(view: ButtonViewGroup, borderColor: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.ALL, borderColor)
  }

  @ReactProp(name = "borderLeftColor")
  override fun setBorderLeftColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.LEFT, value)
  }

  @ReactProp(name = "borderRightColor")
  override fun setBorderRightColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.RIGHT, value)
  }

  @ReactProp(name = "borderTopColor")
  override fun setBorderTopColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.TOP, value)
  }

  @ReactProp(name = "borderBottomColor")
  override fun setBorderBottomColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.BOTTOM, value)
  }

  @ReactProp(name = "borderStartColor")
  override fun setBorderStartColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.START, value)
  }

  @ReactProp(name = "borderEndColor")
  override fun setBorderEndColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.END, value)
  }

  @ReactProp(name = "borderBlockColor")
  override fun setBorderBlockColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.BLOCK, value)
  }

  @ReactProp(name = "borderBlockEndColor")
  override fun setBorderBlockEndColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.BLOCK_END, value)
  }

  @ReactProp(name = "borderBlockStartColor")
  override fun setBorderBlockStartColor(view: ButtonViewGroup, value: Int?) {
    BackgroundStyleApplicator.setBorderColor(view, LogicalEdge.BLOCK_START, value)
  }

  @ReactProp(name = "borderStyle")
  override fun setBorderStyle(view: ButtonViewGroup, borderStyle: String?) {
    val parsed = if (borderStyle == null) null else BorderStyle.fromString(borderStyle)
    BackgroundStyleApplicator.setBorderStyle(view, parsed)
  }

  @ReactProp(name = ViewProps.OVERFLOW)
  override fun setOverflow(view: ButtonViewGroup, overflow: String?) {
    view.setOverflow(overflow)
  }

  private fun setBorderRadiusInternal(view: ButtonViewGroup, prop: BorderRadiusProp, value: Float) {
    val isUnset = value.isNaN() || value < 0f
    val lp = if (isUnset) null else LengthPercentage(value, LengthPercentageType.POINT)
    BackgroundStyleApplicator.setBorderRadius(view, prop, lp)
  }

  @ReactProp(name = ViewProps.BORDER_RADIUS)
  override fun setBorderRadius(view: ButtonViewGroup, borderRadius: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_RADIUS, borderRadius)
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS, value)
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS, value)
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS, value)
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS, value)
  }

  @ReactProp(name = "borderTopStartRadius")
  override fun setBorderTopStartRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_START_RADIUS, value)
  }

  @ReactProp(name = "borderTopEndRadius")
  override fun setBorderTopEndRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_END_RADIUS, value)
  }

  @ReactProp(name = "borderBottomStartRadius")
  override fun setBorderBottomStartRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, value)
  }

  @ReactProp(name = "borderBottomEndRadius")
  override fun setBorderBottomEndRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, value)
  }

  @ReactProp(name = "borderEndEndRadius")
  override fun setBorderEndEndRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_END_END_RADIUS, value)
  }

  @ReactProp(name = "borderEndStartRadius")
  override fun setBorderEndStartRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_END_START_RADIUS, value)
  }

  @ReactProp(name = "borderStartEndRadius")
  override fun setBorderStartEndRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_START_END_RADIUS, value)
  }

  @ReactProp(name = "borderStartStartRadius")
  override fun setBorderStartStartRadius(view: ButtonViewGroup, value: Float) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_START_START_RADIUS, value)
  }

  @ReactProp(name = "rippleColor")
  override fun setRippleColor(view: ButtonViewGroup, rippleColor: Int?) {
    view.rippleColor = rippleColor
  }

  @ReactProp(name = "rippleRadius")
  override fun setRippleRadius(view: ButtonViewGroup, rippleRadius: Int) {
    view.rippleRadius = rippleRadius
  }

  @ReactProp(name = "exclusive")
  override fun setExclusive(view: ButtonViewGroup, exclusive: Boolean) {
    view.exclusive = exclusive
  }

  @ReactProp(name = "touchSoundDisabled")
  override fun setTouchSoundDisabled(view: ButtonViewGroup, touchSoundDisabled: Boolean) {
    view.isSoundEffectsEnabled = !touchSoundDisabled
  }

  @ReactProp(name = "pressAndHoldAnimationDuration")
  override fun setPressAndHoldAnimationDuration(view: ButtonViewGroup, pressAndHoldAnimationDuration: Int) {
    view.pressAndHoldAnimationDuration = pressAndHoldAnimationDuration
  }

  @ReactProp(name = "tapAnimationDuration")
  override fun setTapAnimationDuration(view: ButtonViewGroup, tapAnimationDuration: Int) {
    view.tapAnimationDuration = tapAnimationDuration
  }

  @ReactProp(name = "defaultOpacity")
  override fun setDefaultOpacity(view: ButtonViewGroup, defaultOpacity: Float) {
    view.defaultOpacity = defaultOpacity
  }

  @ReactProp(name = "activeOpacity")
  override fun setActiveOpacity(view: ButtonViewGroup, targetOpacity: Float) {
    view.activeOpacity = targetOpacity
  }

  @ReactProp(name = "defaultScale")
  override fun setDefaultScale(view: ButtonViewGroup, defaultScale: Float) {
    view.defaultScale = defaultScale
  }

  @ReactProp(name = "activeScale")
  override fun setActiveScale(view: ButtonViewGroup, activeScale: Float) {
    view.activeScale = activeScale
  }

  @ReactProp(name = "underlayColor")
  override fun setUnderlayColor(view: ButtonViewGroup, underlayColor: Int?) {
    view.underlayColor = underlayColor
  }

  @ReactProp(name = "defaultUnderlayOpacity")
  override fun setDefaultUnderlayOpacity(view: ButtonViewGroup, defaultUnderlayOpacity: Float) {
    view.defaultUnderlayOpacity = defaultUnderlayOpacity
  }

  @ReactProp(name = "activeUnderlayOpacity")
  override fun setActiveUnderlayOpacity(view: ButtonViewGroup, activeUnderlayOpacity: Float) {
    view.activeUnderlayOpacity = activeUnderlayOpacity
  }

  @ReactProp(name = ViewProps.POINTER_EVENTS)
  override fun setPointerEvents(view: ButtonViewGroup, pointerEvents: String?) {
    view.pointerEvents = when (pointerEvents) {
      "none" -> PointerEvents.NONE
      "box-none" -> PointerEvents.BOX_NONE
      "box-only" -> PointerEvents.BOX_ONLY
      "auto", null -> PointerEvents.AUTO
      else -> PointerEvents.AUTO
    }
  }

  override fun onAfterUpdateTransaction(view: ButtonViewGroup) {
    super.onAfterUpdateTransaction(view)

    view.updateBackground()
  }

  override fun getDelegate(): ViewManagerDelegate<ButtonViewGroup>? = mDelegate

  class ButtonViewGroup(context: Context?) :
    ViewGroup(context),
    NativeViewGestureHandler.NativeViewGestureHandlerHook,
    ReactPointerEventsView {
    // Using object because of handling null representing no value set.
    var rippleColor: Int? = null
      set(color) = withBackgroundUpdate {
        field = color
      }

    var rippleRadius: Int? = null
      set(radius) = withBackgroundUpdate {
        field = radius
      }
    var useDrawableOnForeground = false
      set(useForeground) = withBackgroundUpdate {
        field = useForeground
      }
    var useBorderlessDrawable = false

    var exclusive = true
    var tapAnimationDuration: Int = 100
    var pressAndHoldAnimationDuration: Int = -1
      get() = if (field < 0) tapAnimationDuration else field
    var activeOpacity: Float = 1.0f
    var defaultOpacity: Float = 1.0f
    var activeScale: Float = 1.0f
    var defaultScale: Float = 1.0f
    var underlayColor: Int? = null
      set(color) = withBackgroundUpdate {
        field = color
      }
    var activeUnderlayOpacity: Float = 0f
    var defaultUnderlayOpacity: Float = 0f
      set(value) = withBackgroundUpdate {
        field = value
      }

    override var pointerEvents: PointerEvents = PointerEvents.AUTO

    private var needBackgroundUpdate = false
    private var lastEventTime = -1L
    private var lastAction = -1
    private var receivedKeyEvent = false
    private var currentAnimator: AnimatorSet? = null
    private var underlayDrawable: PaintDrawable? = null
    private var pressInTimestamp = 0L
    private var pendingPressOut: Runnable? = null

    // When non-null the ripple is drawn in dispatchDraw (above background, below children).
    // When null the ripple lives on the foreground drawable instead.
    private var selectableDrawable: Drawable? = null

    var isTouched = false

    init {
      // we attach empty click listener to trigger tap sounds (see View#performClick())
      setOnClickListener(dummyClickListener)
      isClickable = true
      isFocusable = true
      needBackgroundUpdate = true
      clipChildren = false
    }

    private inline fun withBackgroundUpdate(block: () -> Unit) {
      block()
      needBackgroundUpdate = true
    }

    fun setOverflow(overflow: String?) {
      when (overflow) {
        "hidden" -> {
          clipChildren = true
          clipToPadding = true
        }
        else -> {
          clipChildren = false
          clipToPadding = false
        }
      }
      invalidate()
    }

    override fun setBackgroundColor(color: Int) {
      BackgroundStyleApplicator.setBackgroundColor(this, color)
    }

    override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
      super.onInitializeAccessibilityNodeInfo(info)

      // Expose the testID prop as the resource-id name of the view. Black-box E2E/UI testing
      // frameworks, which interact with the UI through the accessibility framework, do not have
      // access to view tags. This allows developers/testers to avoid polluting the
      // content-description with test identifiers.
      val testId = super.getTag(R.id.react_test_id)

      if (testId is String) {
        info.setViewIdResourceName(testId)
      }
    }

    override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
      if (super.onInterceptTouchEvent(event)) {
        return true
      }
      // We call `onTouchEvent` and wait until button changes state to `pressed`, if it's pressed
      // we return true so that the gesture handler can activate.
      onTouchEvent(event)
      return isPressed
    }

    /**
     * Buttons in RN are wrapped in NativeViewGestureHandler which manages
     * calling onTouchEvent after activation of the handler. Problem is, in order to verify that
     * underlying button implementation is interested in receiving touches we have to call onTouchEvent
     * and check if button is pressed.
     *
     * This leads to invoking onTouchEvent twice which isn't idempotent in View - it calls OnClickListener
     * and plays sound effect if OnClickListener was set.
     *
     * To mitigate this behavior we use lastEventTime and lastAction variables to check that we already handled
     * the event in [onInterceptTouchEvent]. We assume here that different events
     * will have different event times or actions.
     * Events with same event time can occur on some devices for different actions.
     * (e.g. move and up in one gesture; move and cancel)
     *
     * Reference:
     * [com.swmansion.gesturehandler.NativeViewGestureHandler.onHandle]  */
    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
      val eventTime = event.eventTime
      val action = event.action

      if (touchResponder != null && touchResponder !== this && touchResponder!!.exclusive) {
        if (isPressed) {
          setPressed(false)
        }
        lastEventTime = eventTime
        lastAction = action
        return false
      }

      if (event.action == MotionEvent.ACTION_CANCEL) {
        tryFreeingResponder()
      }

      // always true when lastEventTime or lastAction have default value (-1)
      if (lastEventTime != eventTime || lastAction != action || action == MotionEvent.ACTION_CANCEL) {
        lastEventTime = eventTime
        lastAction = action
        return super.onTouchEvent(event)
      }
      return false
    }

    private fun applyStartAnimationState() {
      if (activeOpacity != 1.0f || defaultOpacity != 1.0f) {
        alpha = defaultOpacity
      }
      if (activeScale != 1.0f || defaultScale != 1.0f) {
        scaleX = defaultScale
        scaleY = defaultScale
      }
      underlayDrawable?.alpha = (defaultUnderlayOpacity * 255).toInt()
    }

    private fun animateTo(opacity: Float, scale: Float, underlayOpacity: Float, durationMs: Long) {
      val hasOpacity = activeOpacity != 1.0f || defaultOpacity != 1.0f
      val hasScale = activeScale != 1.0f || defaultScale != 1.0f
      val hasUnderlay = activeUnderlayOpacity != defaultUnderlayOpacity && underlayDrawable != null
      if (!hasOpacity && !hasScale && !hasUnderlay) {
        return
      }

      currentAnimator?.cancel()
      val animators = ArrayList<Animator>()
      if (hasOpacity) {
        animators.add(ObjectAnimator.ofFloat(this, "alpha", opacity))
      }
      if (hasScale) {
        animators.add(ObjectAnimator.ofFloat(this, "scaleX", scale))
        animators.add(ObjectAnimator.ofFloat(this, "scaleY", scale))
      }
      if (hasUnderlay) {
        animators.add(ObjectAnimator.ofInt(underlayDrawable!!, "alpha", (underlayOpacity * 255).toInt()))
      }
      currentAnimator = AnimatorSet().apply {
        playTogether(animators)
        duration = durationMs
        interpolator = LinearOutSlowInInterpolator()
        start()
      }
    }

    private fun animatePressIn() {
      pendingPressOut?.let {
        handler.removeCallbacks(it)
        pendingPressOut = null
      }
      pressInTimestamp = SystemClock.uptimeMillis()
      animateTo(activeOpacity, activeScale, activeUnderlayOpacity, pressAndHoldAnimationDuration.toLong())
    }

    private fun animatePressOut() {
      pendingPressOut?.let { handler.removeCallbacks(it) }
      val pressAndHoldMs = pressAndHoldAnimationDuration.toLong()
      val tapMs = tapAnimationDuration.toLong()
      val elapsed = SystemClock.uptimeMillis() - pressInTimestamp

      if (elapsed >= pressAndHoldMs) {
        animateTo(defaultOpacity, defaultScale, defaultUnderlayOpacity, pressAndHoldMs)
        // elapsed * 2 to ensure there is at least half of the tapAnimationDuration left for the animation to play
      } else if (elapsed * 2 >= tapMs) {
        animateTo(defaultOpacity, defaultScale, defaultUnderlayOpacity, elapsed)
      } else {
        val remaining = tapMs - elapsed
        animateTo(activeOpacity, activeScale, activeUnderlayOpacity, remaining)

        val runnable = Runnable {
          pendingPressOut = null
          animateTo(defaultOpacity, defaultScale, defaultUnderlayOpacity, tapMs)
        }
        pendingPressOut = runnable
        handler.postDelayed(runnable, remaining)
      }
    }

    private fun createUnderlayDrawable(): PaintDrawable {
      val drawable = PaintDrawable(underlayColor ?: Color.BLACK)
      drawable.alpha = (defaultUnderlayOpacity * 255).toInt()
      return drawable
    }

    fun updateBackground() {
      if (!needBackgroundUpdate) {
        return
      }
      needBackgroundUpdate = false

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        foreground = null
      }

      val selectable = createSelectableDrawable()
      val underlay = createUnderlayDrawable()
      underlayDrawable = underlay
      // Set this view as callback so ObjectAnimator alpha changes trigger redraws.
      underlay.callback = this

      if (useDrawableOnForeground && selectable != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        // Explicit foreground mode — View natively forwards state/hotspot.
        foreground = selectable
        selectableDrawable = null
      } else {
        // Default — draw ripple in dispatchDraw above background, below children.
        // State and hotspot are forwarded manually.
        selectableDrawable = selectable
        selectable?.callback = this
      }

      applyStartAnimationState()
    }

    // Draw the underlay and ripple between background and children.
    // Clip to BackgroundStyleApplicator's padding box so the overlay
    // never extends beyond the view's resolved border-radius shape.
    // Borderless ripples are intentionally not clipped so they can
    // extend beyond the view bounds.
    override fun dispatchDraw(canvas: Canvas) {
      underlayDrawable?.let {
        canvas.save()
        BackgroundStyleApplicator.clipToPaddingBox(this, canvas)
        it.setBounds(0, 0, width, height)
        it.draw(canvas)
        canvas.restore()
      }
      selectableDrawable?.let {
        if (!useBorderlessDrawable) {
          canvas.save()
          BackgroundStyleApplicator.clipToPaddingBox(this, canvas)
        }
        it.setBounds(0, 0, width, height)
        it.draw(canvas)
        if (!useBorderlessDrawable) {
          canvas.restore()
        }
      }
      super.dispatchDraw(canvas)
    }

    override fun verifyDrawable(who: Drawable): Boolean =
      super.verifyDrawable(who) || who == underlayDrawable || who == selectableDrawable

    override fun drawableStateChanged() {
      super.drawableStateChanged()
      // Forward pressed/enabled state to the ripple when it's drawn manually.
      selectableDrawable?.let {
        if (it.isStateful) {
          it.setState(drawableState)
        }
      }
    }

    private fun createSelectableDrawable(): Drawable? {
      // don't create ripple drawable at all when it's not supposed to be visible
      if (rippleColor == Color.TRANSPARENT) {
        return null
      }

      val states = arrayOf(intArrayOf(android.R.attr.state_enabled))
      val rippleRadius = rippleRadius
      val colorStateList = if (rippleColor != null) {
        val colors = intArrayOf(rippleColor!!)
        ColorStateList(states, colors)
      } else {
        // if rippleColor is null, reapply the default color
        context.theme.resolveAttribute(android.R.attr.colorControlHighlight, resolveOutValue, true)
        val colors = intArrayOf(resolveOutValue.data)
        ColorStateList(states, colors)
      }

      val drawable = RippleDrawable(
        colorStateList,
        null,
        if (useBorderlessDrawable) null else ShapeDrawable(RectShape()),
      )

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && rippleRadius != null) {
        drawable.radius = PixelUtil.toPixelFromDIP(rippleRadius.toFloat()).toInt()
      }

      return drawable
    }

    override fun onDetachedFromWindow() {
      super.onDetachedFromWindow()
      pendingPressOut?.let { handler.removeCallbacks(it) }
      pendingPressOut = null
      currentAnimator?.cancel()
      currentAnimator = null
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
      super.onSizeChanged(w, h, oldw, oldh)
      needBackgroundUpdate = true
      updateBackground()
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
      // No-op
    }

    override fun drawableHotspotChanged(x: Float, y: Float) {
      if (touchResponder == null || touchResponder === this) {
        super.drawableHotspotChanged(x, y)
        // Forward hotspot to the ripple when it's drawn manually.
        selectableDrawable?.setHotspot(x, y)
      }
    }

    override fun canBegin(event: MotionEvent): Boolean {
      if (event.action == MotionEvent.ACTION_CANCEL ||
        event.action == MotionEvent.ACTION_UP ||
        event.actionMasked == MotionEvent.ACTION_POINTER_UP
      ) {
        return false
      }

      val isResponder = tryGrabbingResponder()
      if (isResponder) {
        isTouched = true
      }

      return isResponder
    }

    override fun afterGestureEnd(event: MotionEvent) {
      tryFreeingResponder()
      isTouched = false
    }

    private fun tryFreeingResponder() {
      if (touchResponder === this) {
        touchResponder = null
        soundResponder = this
      }
    }

    private fun tryGrabbingResponder(): Boolean {
      if (isChildTouched()) {
        return false
      }

      if (touchResponder == null) {
        touchResponder = this
        return true
      }
      return if (exclusive) {
        touchResponder === this
      } else {
        !(touchResponder?.exclusive ?: false)
      }
    }

    private fun isChildTouched(children: Sequence<View> = this.children): Boolean {
      for (child in children) {
        if (child is ButtonViewGroup && (child.isTouched || child.isPressed)) {
          return true
        } else if (child is ViewGroup) {
          if (isChildTouched(child.children)) {
            return true
          }
        }
      }

      return false
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
      receivedKeyEvent = true
      return super.onKeyUp(keyCode, event)
    }

    override fun performClick(): Boolean {
      // don't preform click when a child button is pressed (mainly to prevent sound effect of
      // a parent button from playing)
      return if (!isChildTouched()) {
        if (context.isScreenReaderOn()) {
          RNGestureHandlerRootView.findGestureHandlerRootView(this)?.activateNativeHandlers(this)
        } else if (receivedKeyEvent) {
          RNGestureHandlerRootView.findGestureHandlerRootView(this)?.activateNativeHandlers(this)
          receivedKeyEvent = false
        }

        if (soundResponder === this) {
          tryFreeingResponder()
          soundResponder = null
          super.performClick()
        } else {
          false
        }
      } else {
        false
      }
    }

    override fun setPressed(pressed: Boolean) {
      // button can be pressed alongside other button if both are non-exclusive and it doesn't have
      // any pressed children (to prevent pressing the parent when children is pressed).
      val canBePressedAlongsideOther = !exclusive && touchResponder?.exclusive != true && !isChildTouched()

      if (!pressed || touchResponder === this || canBePressedAlongsideOther) {
        // we set pressed state only for current responder or any non-exclusive button when responder
        // is null or non-exclusive, assuming it doesn't have pressed children
        isTouched = pressed
        super.setPressed(pressed)

        if (pressed) {
          animatePressIn()
        } else {
          animatePressOut()
        }
      }

      if (!pressed && touchResponder === this) {
        // if the responder is no longer pressed we release button responder
        isTouched = false
      }
    }

    override fun dispatchDrawableHotspotChanged(x: Float, y: Float) {
      // No-op
      // by default Viewgroup would pass hotspot change events
    }

    companion object {
      var resolveOutValue = TypedValue()
      var touchResponder: ButtonViewGroup? = null
      var soundResponder: ButtonViewGroup? = null
      var dummyClickListener = OnClickListener { }
    }
  }

  companion object {
    const val REACT_CLASS = "RNGestureHandlerButton"
  }
}
