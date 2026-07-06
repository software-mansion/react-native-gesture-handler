package com.swmansion.gesturehandler.react

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.annotation.SuppressLint
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
import android.view.Choreographer
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.children
import androidx.interpolator.view.animation.FastOutSlowInInterpolator
import com.facebook.react.R
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.BackgroundStyleApplicator
import com.facebook.react.uimanager.LengthPercentage
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
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.HoverGestureHandler
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

  private fun setBorderRadiusInternal(view: ButtonViewGroup, prop: BorderRadiusProp, value: Dynamic) {
    // setFromDynamic returns null for null Dynamics, negative numbers, and
    // unparseable strings — which is what we want for "unset" so that
    // general / physical radii continue to cascade.
    val lp = LengthPercentage.setFromDynamic(value)
    BackgroundStyleApplicator.setBorderRadius(view, prop, lp)
  }

  @ReactProp(name = ViewProps.BORDER_RADIUS)
  override fun setBorderRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_RADIUS, value)
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS, value)
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS, value)
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS, value)
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS, value)
  }

  @ReactProp(name = "borderTopStartRadius")
  override fun setBorderTopStartRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_START_RADIUS, value)
  }

  @ReactProp(name = "borderTopEndRadius")
  override fun setBorderTopEndRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_TOP_END_RADIUS, value)
  }

  @ReactProp(name = "borderBottomStartRadius")
  override fun setBorderBottomStartRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_START_RADIUS, value)
  }

  @ReactProp(name = "borderBottomEndRadius")
  override fun setBorderBottomEndRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_BOTTOM_END_RADIUS, value)
  }

  @ReactProp(name = "borderEndEndRadius")
  override fun setBorderEndEndRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_END_END_RADIUS, value)
  }

  @ReactProp(name = "borderEndStartRadius")
  override fun setBorderEndStartRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_END_START_RADIUS, value)
  }

  @ReactProp(name = "borderStartEndRadius")
  override fun setBorderStartEndRadius(view: ButtonViewGroup, value: Dynamic) {
    setBorderRadiusInternal(view, BorderRadiusProp.BORDER_START_END_RADIUS, value)
  }

  @ReactProp(name = "borderStartStartRadius")
  override fun setBorderStartStartRadius(view: ButtonViewGroup, value: Dynamic) {
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

  @ReactProp(name = "tapAnimationInDuration")
  override fun setTapAnimationInDuration(view: ButtonViewGroup, value: Int) {
    view.tapAnimationInDuration = if (value > 0) value else 0
  }

  @ReactProp(name = "tapAnimationOutDuration")
  override fun setTapAnimationOutDuration(view: ButtonViewGroup, value: Int) {
    view.tapAnimationOutDuration = if (value > 0) value else 0
  }

  @ReactProp(name = "longPressDuration")
  override fun setLongPressDuration(view: ButtonViewGroup, value: Int) {
    view.longPressDuration = value
  }

  @ReactProp(name = "longPressAnimationOutDuration")
  override fun setLongPressAnimationOutDuration(view: ButtonViewGroup, value: Int) {
    view.longPressAnimationOutDuration = value
  }

  @ReactProp(name = "needsOffscreenAlphaCompositing")
  override fun setNeedsOffscreenAlphaCompositing(view: ButtonViewGroup, value: Boolean) {
    view.needsOffscreenAlphaCompositing = value
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

  @ReactProp(name = "hoverOpacity")
  override fun setHoverOpacity(view: ButtonViewGroup, hoverOpacity: Float) {
    view.hoverOpacity = hoverOpacity
  }

  @ReactProp(name = "hoverScale")
  override fun setHoverScale(view: ButtonViewGroup, hoverScale: Float) {
    view.hoverScale = hoverScale
  }

  @ReactProp(name = "hoverUnderlayOpacity")
  override fun setHoverUnderlayOpacity(view: ButtonViewGroup, hoverUnderlayOpacity: Float) {
    view.hoverUnderlayOpacity = hoverUnderlayOpacity
  }

  @ReactProp(name = "hoverAnimationInDuration")
  override fun setHoverAnimationInDuration(view: ButtonViewGroup, value: Int) {
    view.hoverAnimationInDuration = if (value > 0) value else 0
  }

  @ReactProp(name = "hoverAnimationOutDuration")
  override fun setHoverAnimationOutDuration(view: ButtonViewGroup, value: Int) {
    view.hoverAnimationOutDuration = if (value > 0) value else 0
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
    view.updateLongPressAccessibility()
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
    var tapAnimationInDuration: Int = 50
    var tapAnimationOutDuration: Int = 100
    var longPressDuration: Int = -1
    var longPressAnimationOutDuration: Int = -1
      get() = if (field < 0) tapAnimationOutDuration else field
    var activeOpacity: Float = 1.0f
    var defaultOpacity: Float = 1.0f
    var activeScale: Float = 1.0f
    var defaultScale: Float = 1.0f
    var hoverAnimationInDuration: Int = 50
    var hoverAnimationOutDuration: Int = 100
    var hoverOpacity: Float = -1f
      get() = if (field < 0f) defaultOpacity else field
    var hoverScale: Float = -1f
      get() = if (field < 0f) defaultScale else field
    var hoverUnderlayOpacity: Float = -1f
      get() = if (field < 0f) defaultUnderlayOpacity else field
    var underlayColor: Int? = null
      set(color) = withBackgroundUpdate {
        field = color
      }
    var activeUnderlayOpacity: Float = 0f
    var defaultUnderlayOpacity: Float = 0f
      set(value) = withBackgroundUpdate {
        field = value
      }
    var needsOffscreenAlphaCompositing = false

    override var pointerEvents: PointerEvents = PointerEvents.AUTO

    private var needBackgroundUpdate = false
    private var lastEventTime = -1L
    private var lastAction = -1
    private var receivedKeyEvent = false
    private var currentAnimator: AnimatorSet? = null
    private var underlayDrawable: PaintDrawable? = null
    private var pressInTimestamp = 0L
    private var pendingPressOut: Runnable? = null
    private var pendingHoverOut: Choreographer.FrameCallback? = null
    private var isPointerInsideBounds = false
    private var isHovered = false

    // Whether a hover was active at press-start. A hovering pointer fires
    // ACTION_HOVER_ENTER first (so isHovered is already true at DOWN).
    private var hoverActiveAtPressStart = false

    private val shouldAnimateHover get() = isHovered && isEnabled

    private val restingOpacity get() = if (shouldAnimateHover) hoverOpacity else defaultOpacity
    private val restingScale get() = if (shouldAnimateHover) hoverScale else defaultScale
    private val restingUnderlayOpacity get() = if (shouldAnimateHover) hoverUnderlayOpacity else defaultUnderlayOpacity

    private val hasOpacityAnimation get() = activeOpacity != 1.0f || defaultOpacity != 1.0f || hoverOpacity != 1.0f
    private val hasScaleAnimation get() = activeScale != 1.0f || defaultScale != 1.0f || hoverScale != 1.0f
    private val hasUnderlayAnimation get() = underlayDrawable != null &&
      (activeUnderlayOpacity != defaultUnderlayOpacity || hoverUnderlayOpacity != defaultUnderlayOpacity)

    // When non-null the ripple is drawn in dispatchDraw (above background, below children).
    // When null the ripple lives on the foreground drawable instead.
    private var selectableDrawable: Drawable? = null

    // When true, dispatchDraw clips children to the resolved border-radius shape
    // (overflow: hidden). ViewGroup's clipChildren is only a rectangular clip and
    // wouldn't respect rounded corners.
    private var clipChildrenToShape = false

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
      clipChildrenToShape = overflow == "hidden"
      invalidate()
    }

    fun updateLongPressAccessibility() {
      val hasLongPress = hasLongPressAccessibilityAction()
      setOnLongClickListener(if (hasLongPress) dummyLongClickListener else null)
      isLongClickable = hasLongPress
    }

    private fun hasLongPressAccessibilityAction(): Boolean {
      val actions = getTag(R.id.accessibility_actions) as? ReadableArray ?: return false
      for (i in 0 until actions.size()) {
        if (actions.getMap(i)?.getString("name") == "longpress") {
          return true
        }
      }

      return false
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

      if (event.actionMasked == MotionEvent.ACTION_DOWN ||
        event.actionMasked == MotionEvent.ACTION_POINTER_DOWN
      ) {
        cancelPendingHoverOut()
      }

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

        // No hover events arrive while the button is held, so derive hover from
        // the touch stream (within bounds). Gated on hoverActiveAtPressStart so
        // it only maintains an already-active hover.
        when (event.actionMasked) {
          MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> hoverActiveAtPressStart = isHovered
          MotionEvent.ACTION_MOVE,
          MotionEvent.ACTION_UP,
          MotionEvent.ACTION_POINTER_UP,
          ->
            if (hoverActiveAtPressStart) {
              isHovered = isWithinBounds(event)
            }
          MotionEvent.ACTION_CANCEL -> isHovered = false
        }

        val handled = super.onTouchEvent(event)

        // Replay press-in / press-out animations across drag transitions.
        if (handled && canRespondToTouches()) {
          when (event.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> isPointerInsideBounds = true
            MotionEvent.ACTION_MOVE -> {
              val inside = isWithinBounds(event)
              if (inside != isPointerInsideBounds) {
                isPointerInsideBounds = inside
                if (inside) {
                  // Re-establish View's pressed flag to restore ripple and the
                  // UP handler runs its normal release cleanup.
                  setPressed(true)
                } else {
                  animatePressOut()
                }
              }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL ->
              isPointerInsideBounds =
                false
          }
        }

        return handled
      }
      return false
    }

    override fun onHoverEvent(event: MotionEvent): Boolean {
      when (event.actionMasked) {
        MotionEvent.ACTION_HOVER_ENTER -> onHoverIn()
        MotionEvent.ACTION_HOVER_EXIT -> onHoverOut()
      }

      return super.onHoverEvent(event)
    }

    private fun getAnimatorDurationScale(): Float = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      ValueAnimator.getDurationScale()
    } else {
      try {
        android.provider.Settings.Global.getFloat(
          context.contentResolver,
          android.provider.Settings.Global.ANIMATOR_DURATION_SCALE,
        )
      } catch (e: android.provider.Settings.SettingNotFoundException) {
        1.0f
      }
    }

    private fun applyStartAnimationState() {
      if (hasOpacityAnimation) {
        alpha = defaultOpacity
      }
      if (hasScaleAnimation) {
        scaleX = defaultScale
        scaleY = defaultScale
      }
      underlayDrawable?.alpha = (defaultUnderlayOpacity * 255).toInt()
    }

    private fun animateTo(opacity: Float, scale: Float, underlayOpacity: Float, durationMs: Long) {
      if (!hasOpacityAnimation && !hasScaleAnimation && !hasUnderlayAnimation) {
        return
      }

      currentAnimator?.cancel()
      currentAnimator = null

      // Sub-frame durations: snap directly. ObjectAnimator with duration 0
      // still defers its property write to the next frame callback, so if a
      // follow-up animateTo() cancels it in the same frame the property never
      // lands on its target and the next animator captures a stale starting
      // value (e.g. an instant press-in followed by press-out in the same
      // frame, leaving the press-out to animate default → default).
      // Animator duration scale folds in here too: scale 0 collapses any
      // duration to the same deferred-write territory.
      val durationScale = getAnimatorDurationScale()
      val effectiveDurationMs = (durationMs * durationScale).toLong()
      if (effectiveDurationMs < (display?.minimumFrameTime ?: 16f)) {
        if (hasOpacityAnimation) {
          alpha = opacity
        }
        if (hasScaleAnimation) {
          scaleX = scale
          scaleY = scale
        }
        if (hasUnderlayAnimation) {
          underlayDrawable!!.alpha = (underlayOpacity * 255).toInt()
        }
        return
      }

      val animators = ArrayList<Animator>()
      if (hasOpacityAnimation) {
        animators.add(ObjectAnimator.ofFloat(this, "alpha", opacity))
      }
      if (hasScaleAnimation) {
        animators.add(ObjectAnimator.ofFloat(this, "scaleX", scale))
        animators.add(ObjectAnimator.ofFloat(this, "scaleY", scale))
      }
      if (hasUnderlayAnimation) {
        animators.add(ObjectAnimator.ofInt(underlayDrawable!!, "alpha", (underlayOpacity * 255).toInt()))
      }
      currentAnimator = AnimatorSet().apply {
        playTogether(animators)
        duration = durationMs
        interpolator = FastOutSlowInInterpolator()
        start()
      }
    }

    private fun animatePressIn() {
      pendingPressOut?.let {
        handler?.removeCallbacks(it)
        pendingPressOut = null
      }
      pressInTimestamp = SystemClock.uptimeMillis()
      animateTo(activeOpacity, activeScale, activeUnderlayOpacity, tapAnimationInDuration.toLong())
    }

    private fun animateHoverState() {
      if (isPressed) {
        return
      }

      if (shouldAnimateHover) {
        animateTo(hoverOpacity, hoverScale, hoverUnderlayOpacity, hoverAnimationInDuration.toLong())
      } else {
        animateTo(defaultOpacity, defaultScale, defaultUnderlayOpacity, hoverAnimationOutDuration.toLong())
      }
    }

    private fun onHoverIn() {
      cancelPendingHoverOut()

      if (isHovered) {
        return
      }

      isHovered = true
      animateHoverState()
    }

    private fun onHoverOut() {
      if (isPressed) {
        isHovered = false
        return
      }

      cancelPendingHoverOut()

      // Hover-out arrives just before a press-down, so defer a frame to let a
      // following press-in cancel it and keep the hover state through the press.
      val callback = Choreographer.FrameCallback {
        pendingHoverOut = null
        isHovered = false
        animateHoverState()
      }

      pendingHoverOut = callback
      Choreographer.getInstance().postFrameCallback(callback)
    }

    private fun cancelPendingHoverOut() {
      pendingHoverOut?.let { Choreographer.getInstance().removeFrameCallback(it) }
      pendingHoverOut = null
    }

    private fun isWithinBounds(event: MotionEvent): Boolean =
      event.x >= 0 && event.y >= 0 && event.x < width && event.y < height

    private fun animatePressOut() {
      pendingPressOut?.let { handler?.removeCallbacks(it) }
      val tapInMs = tapAnimationInDuration.toLong()
      val tapOutMs = tapAnimationOutDuration.toLong()
      val longPressMs = longPressDuration.toLong()
      val longPressOutMs = longPressAnimationOutDuration.toLong()
      val elapsed = SystemClock.uptimeMillis() - pressInTimestamp

      if (longPressMs >= 0 && elapsed >= longPressMs) {
        // Long-press release - use the configured long-press out duration.
        animateTo(restingOpacity, restingScale, restingUnderlayOpacity, longPressOutMs)
      } else if (elapsed >= tapInMs) {
        // Press-in animation fully finished — release with the configured out duration.
        animateTo(restingOpacity, restingScale, restingUnderlayOpacity, tapOutMs)
        // elapsed * 2 to ensure there is at least half of the tapAnimationOutDuration left for the animation to play
      } else if (elapsed * 2 >= tapOutMs) {
        animateTo(restingOpacity, restingScale, restingUnderlayOpacity, elapsed)
      } else {
        val remaining = tapInMs - elapsed
        animateTo(activeOpacity, activeScale, activeUnderlayOpacity, remaining)

        val runnable = Runnable {
          pendingPressOut = null
          animateTo(restingOpacity, restingScale, restingUnderlayOpacity, tapOutMs)
        }
        pendingPressOut = runnable
        // The animator scales `remaining` by ANIMATOR_DURATION_SCALE internally,
        // so the press-in actually completes after `remaining * scale` ms. We need
        // to match that.
        handler?.postDelayed(runnable, (remaining * getAnimatorDurationScale()).toLong())
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
      foreground = null

      val selectable = createSelectableDrawable()
      val underlay = createUnderlayDrawable()
      underlayDrawable = underlay
      // Set this view as callback so ObjectAnimator alpha changes trigger redraws.
      underlay.callback = this

      if (useDrawableOnForeground && selectable != null) {
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
      if (clipChildrenToShape) {
        canvas.save()
        BackgroundStyleApplicator.clipToPaddingBox(this, canvas)
        super.dispatchDraw(canvas)
        canvas.restore()
      } else {
        super.dispatchDraw(canvas)
      }
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

      if (rippleRadius != null) {
        drawable.radius = PixelUtil.toPixelFromDIP(rippleRadius.toFloat()).toInt()
      }

      return drawable
    }

    override fun onDetachedFromWindow() {
      super.onDetachedFromWindow()
      pendingPressOut?.let { handler?.removeCallbacks(it) }
      pendingPressOut = null
      cancelPendingHoverOut()
      currentAnimator?.cancel()
      currentAnimator = null
      isHovered = false
      applyStartAnimationState()

      if (touchResponder === this) {
        touchResponder = null
      }
      if (soundResponder === this) {
        soundResponder = null
      }
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

    override fun shouldBeginWithRecordedHandlers(
      recorded: List<GestureHandler>,
      handler: NativeViewGestureHandler,
    ): Boolean = recorded.all {
      it.shouldRecognizeSimultaneously(handler) ||
        handler.shouldRecognizeSimultaneously(it) ||
        it.view == this ||
        it is HoverGestureHandler
    }

    private fun tryFreeingResponder() {
      if (touchResponder === this) {
        touchResponder = null
        soundResponder = this
      }
    }

    private fun canRespondToTouches(): Boolean = if (exclusive) {
      touchResponder === this
    } else {
      !(touchResponder?.exclusive ?: false)
    }

    private fun tryGrabbingResponder(): Boolean {
      if (isChildTouched()) {
        return false
      }

      if (touchResponder == null) {
        touchResponder = this
        return true
      }

      return canRespondToTouches()
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
      // don't perform click when a child button is pressed (mainly to prevent sound effect of
      // a parent button from playing)
      return if (!isChildTouched()) {
        // Don't activate native handlers when isPressed is true (motion events are passing through)
        if (context.isScreenReaderOn() && !isPressed) {
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

    override fun setEnabled(enabled: Boolean) {
      val changed = enabled != isEnabled
      super.setEnabled(enabled)

      if (changed && isHovered) {
        animateHoverState()
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

    // Default to skipping the offscreen buffer so children's border anti-aliasing
    // at the view edge isn't clipped by the layer bounds when alpha != 1.
    // `needsOffscreenAlphaCompositing` opts back into the standard View behavior.
    override fun hasOverlappingRendering(): Boolean = needsOffscreenAlphaCompositing

    companion object {
      var resolveOutValue = TypedValue()
      var touchResponder: ButtonViewGroup? = null
      var soundResponder: ButtonViewGroup? = null
      val dummyClickListener = OnClickListener { }
      val dummyLongClickListener = OnLongClickListener { view ->
        if (view.context.isScreenReaderOn()) {
          view.performAccessibilityAction(AccessibilityNodeInfo.ACTION_LONG_CLICK, null)
        } else {
          false
        }
      }
    }
  }

  companion object {
    const val REACT_CLASS = "RNGestureHandlerButton"
  }
}
