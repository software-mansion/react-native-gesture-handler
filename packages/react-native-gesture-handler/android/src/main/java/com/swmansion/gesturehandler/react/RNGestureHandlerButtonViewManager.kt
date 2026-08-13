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
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.BackgroundStyleApplicator
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.ReactPointerEventsView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
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
import com.swmansion.gesturehandler.react.events.RNGestureHandlerButtonEvent

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

  override fun onDropViewInstance(view: ButtonViewGroup) {
    dropManagedHandler(view)

    // The view may end up recycled, and props matching their default aren't re-applied on the next
    // mount — leaving the cached values behind would configure (or even create) a handler for the
    // next button from the previous one's props.
    view.pendingHandlerTag = null
    view.managedHandlerCancelOnLeave = null
    view.managedHandlerTestID = null
    view.managedHandlerHitSlop = null
    view.moduleId = null
    view.resetHoverState()
    // Has to come last — every setter above flags the view as needing a managed handler update.
    view.managedHandlerNeedsUpdate = false

    super.onDropViewInstance(view)
  }

  @ReactProp(name = "handlerTag")
  override fun setHandlerTag(view: ButtonViewGroup, handlerTag: Double) {
    view.pendingHandlerTag = handlerTag
  }

  @ReactProp(name = "cancelOnLeave")
  override fun setCancelOnLeave(view: ButtonViewGroup, cancelOnLeave: Boolean) {
    view.managedHandlerCancelOnLeave = cancelOnLeave
  }

  @ReactProp(name = "gestureTestID")
  override fun setGestureTestID(view: ButtonViewGroup, gestureTestID: String?) {
    view.managedHandlerTestID = gestureTestID
  }

  @ReactProp(name = "gestureHitSlop")
  override fun setGestureHitSlop(view: ButtonViewGroup, gestureHitSlop: ReadableMap?) {
    view.managedHandlerHitSlop = gestureHitSlop?.let { parseHitSlop(it) }
  }

  private fun parseHitSlop(hitSlop: ReadableMap): NativeViewGestureHandler.HitSlop {
    fun edge(key: String) = if (hitSlop.hasKey(key)) {
      PixelUtil.toPixelFromDIP(hitSlop.getDouble(key))
    } else {
      GestureHandler.HIT_SLOP_NONE
    }

    return NativeViewGestureHandler.HitSlop(
      left = edge("left"),
      top = edge("top"),
      right = edge("right"),
      bottom = edge("bottom"),
    )
  }

  @ReactProp(name = "hasLongPressHandler")
  override fun setHasLongPressHandler(view: ButtonViewGroup, hasLongPressHandler: Boolean) {
    view.hasLongPressHandler = hasLongPressHandler
  }

  // Cached like the other managed-handler props — prop order isn't guaranteed, so the module is
  // resolved from the id only once the transaction ends, in `updateManagedHandler`.
  @ReactProp(name = "moduleId")
  override fun setModuleId(view: ButtonViewGroup, moduleId: Int) {
    view.moduleId = moduleId
  }

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

  /**
   * Creates, reconfigures or drops the [NativeViewGestureHandler] the button manages, based on the
   * props cached on the view. Runs once per prop transaction rather than from the individual prop
   * setters: each of those would otherwise repeat the module lookup, build a config map and look
   * the handler up in the registry, and since prop order isn't guaranteed, `handlerTag` may be
   * applied after the props that configure the handler.
   */
  private fun updateManagedHandler(view: ButtonViewGroup) {
    val moduleId = view.moduleId ?: return
    if (!view.managedHandlerNeedsUpdate) {
      return
    }

    view.managedHandlerNeedsUpdate = false

    // Handler tags start at 1, so anything below that means the prop was either never set or reset
    // to its default because it got removed.
    val handlerTag = view.pendingHandlerTag?.toInt()?.takeIf { it > 0 }

    if (handlerTag == null) {
      dropManagedHandler(view)
      return
    }

    val module = RNGestureHandlerModule.getModule(moduleId) ?: return
    val isNewHandler = handlerTag != view.managedHandlerTag

    if (isNewHandler) {
      dropManagedHandler(view)

      // Created with an empty config — the full configuration is applied below, directly on the
      // handler, so it never has to be packed into a map.
      module.createGestureHandler("NativeViewGestureHandler", handlerTag.toDouble(), Arguments.createMap())
    }

    val handler = RNGestureHandlerModule.registries[moduleId]?.getHandler(handlerTag)

    (handler as? NativeViewGestureHandler)?.updateConfig(buildManagedHandlerConfig(view))

    if (isNewHandler) {
      // Attached only after the handler is configured — setting `enabled` to `false` on an already
      // attached handler cancels it, which for a button mounted as disabled would dispatch a
      // pointless cancel event right after mount.
      module.attachGestureHandler(handlerTag.toDouble(), view.id.toDouble(), GestureHandler.ACTION_TYPE_NONE.toDouble())

      view.managedHandlerTag = handlerTag
    }
  }

  private fun dropManagedHandler(view: ButtonViewGroup) {
    val tag = view.managedHandlerTag ?: return
    // Cleared even if the drop below doesn't go through — the view must not keep a dangling tag.
    view.managedHandlerTag = null

    val moduleId = view.moduleId ?: return
    RNGestureHandlerModule.getModule(moduleId)?.dropGestureHandler(tag.toDouble())
  }

  private fun buildManagedHandlerConfig(view: ButtonViewGroup) = NativeViewGestureHandler.Config(
    enabled = view.isEnabled,
    shouldCancelWhenOutside = view.managedHandlerCancelOnLeave ?: true,
    // The config is absolute, so passing the cached values through applies removed props
    // (null here) as a reset on the handler.
    hitSlop = view.managedHandlerHitSlop,
    testID = view.managedHandlerTestID,
    shouldActivateOnStart = false,
    disallowInterruption = true,
    yieldsToContinuousGestures = true,
  )

  override fun onAfterUpdateTransaction(view: ButtonViewGroup) {
    super.onAfterUpdateTransaction(view)

    updateManagedHandler(view)
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

    var managedHandlerTag: Int? = null

    var pendingHandlerTag: Double? = null
      set(tag) = withManagedHandlerUpdate {
        field = tag
      }
    var managedHandlerCancelOnLeave: Boolean? = null
      set(cancelOnLeave) = withManagedHandlerUpdate {
        field = cancelOnLeave
      }
    var managedHandlerTestID: String? = null
      set(testID) = withManagedHandlerUpdate {
        field = testID
      }
    var managedHandlerHitSlop: NativeViewGestureHandler.HitSlop? = null
      set(hitSlop) = withManagedHandlerUpdate {
        field = hitSlop
      }
    var moduleId: Int? = null
      set(moduleId) = withManagedHandlerUpdate {
        field = moduleId
      }
    var managedHandlerNeedsUpdate = false

    var exclusive = true
    var hasLongPressHandler = false
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
      set(value) = withBackgroundUpdate {
        field = value
      }
    var underlayColor: Int? = null
      set(color) = withBackgroundUpdate {
        field = color
      }
    var activeUnderlayOpacity: Float = 0f
      set(value) = withBackgroundUpdate {
        field = value
      }
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
    private var pendingLongPress: Runnable? = null
    private var pendingHoverOut: Choreographer.FrameCallback? = null
    private var isPointerInsideBounds = false
    private var isHovered = false

    // Whether a hover was active at press-start. A hovering pointer fires
    // ACTION_HOVER_ENTER first, so isHovered is already true at DOWN.
    private var hoverActiveAtPressStart = false

    // Hover events outlive the MotionEvent behind them (the deferred hover-out,
    // and `enabled` flipping while hovered), so the position is copied out.
    private var lastHoverSample: HoverSample? = null

    // Content view's screen position, resolved once per hover session the way
    // GestureHandler.prepare resolves it once per gesture.
    private val hoverWindowOffset = IntArray(2)

    // The hover state JS was last told about, which drifts from [effectiveHover]
    // on purpose — see [dispatchHoverEventIfNeeded] and [onDetachedFromWindow].
    private var hoverReported = false

    private val effectiveHover get() = isHovered && isEnabled

    private val restingOpacity get() = if (effectiveHover) hoverOpacity else defaultOpacity
    private val restingScale get() = if (effectiveHover) hoverScale else defaultScale
    private val restingUnderlayOpacity get() = if (effectiveHover) hoverUnderlayOpacity else defaultUnderlayOpacity

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

    private inline fun withManagedHandlerUpdate(block: () -> Unit) {
      block()
      managedHandlerNeedsUpdate = true
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

    private var longPressDetected = false

    // Cannot rely on isPointerInsideBounds because it's set to false during motion event processing
    // which happens before the final state change is handled (state change is triggered by the motion
    // event).
    private var lastEventWasInside = false

    override fun onHandlerUpdate(handler: NativeViewGestureHandler) {
      if (managedHandlerTag == null || handler.isWithinBounds == lastEventWasInside) {
        return
      }

      if (handler.isWithinBounds) {
        dispatchJSEvent(EventType.PressIn, handler)
      } else {
        dispatchJSEvent(EventType.PressOut, handler)

        pendingLongPress?.let {
          this.handler?.removeCallbacks(it)
          pendingLongPress = null
        }
      }
    }

    override fun onHandlerStateChange(handler: NativeViewGestureHandler, newState: Int, prevState: Int) {
      if (managedHandlerTag == null) {
        return
      }

      // Capture local copy, since lastEventWasInside can change during this method
      // Specifically PressOut -> Press scenario on STATE_END
      val localLastEventWasInside = lastEventWasInside

      if (newState == GestureHandler.STATE_BEGAN) {
        dispatchJSEvent(EventType.PressIn, handler)
        longPressDetected = false

        if (hasLongPressHandler && longPressDuration >= 0) {
          val runnable = Runnable {
            pendingLongPress = null
            longPressDetected = true
            dispatchJSEvent(EventType.LongPress, handler)
          }
          pendingLongPress = runnable
          this.handler?.postDelayed(runnable, longPressDuration.toLong())
        }
      }

      if (newState == GestureHandler.STATE_END ||
        newState == GestureHandler.STATE_FAILED ||
        newState == GestureHandler.STATE_CANCELLED
      ) {
        if (localLastEventWasInside) {
          dispatchJSEvent(EventType.PressOut, handler)
        }

        pendingLongPress?.let {
          this.handler?.removeCallbacks(it)
          pendingLongPress = null
        }
      }

      if (newState == GestureHandler.STATE_END && !longPressDetected && localLastEventWasInside) {
        dispatchJSEvent(EventType.Press, handler)
      }

      if (newState == GestureHandler.STATE_END ||
        newState == GestureHandler.STATE_FAILED ||
        newState == GestureHandler.STATE_CANCELLED
      ) {
        dispatchJSEvent(EventType.InteractionFinished, handler)
      }
    }

    private fun dispatchJSEvent(type: EventType, handler: NativeViewGestureHandler) {
      val reactContext = context as? ReactContext ?: return
      // TODO: deprecated, but its replacement is unavailable before RN 0.85 — drop when possible
      val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, this.id) ?: return
      eventDispatcher.dispatchEvent(RNGestureHandlerButtonEvent.obtain(this, handler, type))

      if (type == EventType.PressIn) {
        lastEventWasInside = true
      } else if (type == EventType.PressOut) {
        lastEventWasInside = false
      }
    }

    override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
      super.requestDisallowInterceptTouchEvent(disallowIntercept)
      if (!disallowIntercept) {
        return
      }

      val moduleId = moduleId ?: return
      val managedHandlerTag = managedHandlerTag ?: return

      val orchestrator =
        RNGestureHandlerRootView.findGestureHandlerRootView(this)?.orchestrator ?: return
      val handler = RNGestureHandlerModule.registries[moduleId]?.getHandler(managedHandlerTag) ?: return

      if (!orchestrator.isHandlingTouch && handler.view != null) {
        handler.cancel()
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
        // the touch stream — only ever to maintain one that was already open.
        when (event.actionMasked) {
          MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> hoverActiveAtPressStart = isHovered
          MotionEvent.ACTION_MOVE,
          MotionEvent.ACTION_UP,
          MotionEvent.ACTION_POINTER_UP,
          -> {
            if (hoverActiveAtPressStart) {
              // A touch event describes the pressing pointer, which on a dual-input
              // device isn't the hovering one — a finger drag says nothing about a
              // mouse or stylus hovering in its own event stream. Only the pointer
              // that opened the hover may maintain it.
              val pointerType = event.getPointerType()

              if (pointerType == lastHoverSample?.pointerType) {
                isHovered = isWithinBounds(event)
                lastHoverSample = hoverSampleFrom(event, pointerType)
                dispatchHoverEventIfNeeded()
              }
            }
          }
          // A cancel takes the gesture away from the button for good, and the hover
          // stream isn't guaranteed to speak again — hover targets were dropped at
          // press-start, so a pointer that ends up anywhere else sends this view
          // nothing. The hover has to be closed here or it stays open forever; a
          // pointer that is still hovering re-opens it on the next hover-in.
          MotionEvent.ACTION_CANCEL -> {
            if (hoverActiveAtPressStart && event.getPointerType() == lastHoverSample?.pointerType) {
              isHovered = false
              recordHoverSample(event)
              dispatchHoverEventIfNeeded()
            }

            hoverActiveAtPressStart = false
          }
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
        MotionEvent.ACTION_HOVER_ENTER -> onHoverIn(event)
        MotionEvent.ACTION_HOVER_EXIT -> onHoverOut(event)
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

      if (effectiveHover) {
        animateTo(hoverOpacity, hoverScale, hoverUnderlayOpacity, hoverAnimationInDuration.toLong())
      } else {
        animateTo(defaultOpacity, defaultScale, defaultUnderlayOpacity, hoverAnimationOutDuration.toLong())
      }
    }

    private fun onHoverIn(event: MotionEvent) {
      cancelPendingHoverOut()

      if (isHovered) {
        return
      }

      isHovered = true
      // Ahead of the first sample — hoverSampleFrom converts with this offset.
      captureHoverWindowOffset()
      recordHoverSample(event)
      dispatchHoverEventIfNeeded()
      animateHoverState()
    }

    private fun onHoverOut(event: MotionEvent) {
      if (isPressed) {
        isHovered = false
        // The hover is genuinely over, so stop deriving it — otherwise the next
        // ACTION_MOVE re-opens it for the pressing pointer.
        hoverActiveAtPressStart = false
        recordHoverSample(event)
        dispatchHoverEventIfNeeded()
        return
      }

      cancelPendingHoverOut()

      // Hover-out arrives just before a press-down, so defer a frame to let a
      // following press-in cancel it and keep the hover state through the press.
      // The JS event goes out from the callback too, so a cancelled hover-out
      // never reaches JS.
      val sample = hoverSampleFrom(event, event.getPointerType())
      val callback = Choreographer.FrameCallback {
        pendingHoverOut = null
        isHovered = false
        lastHoverSample = sample
        dispatchHoverEventIfNeeded()
        animateHoverState()
      }

      pendingHoverOut = callback
      Choreographer.getInstance().postFrameCallback(callback)
    }

    private fun cancelPendingHoverOut() {
      pendingHoverOut?.let { Choreographer.getInstance().removeFrameCallback(it) }
      pendingHoverOut = null
    }

    private fun hoverSampleFrom(event: MotionEvent, pointerType: Int) = HoverSample(
      x = event.x,
      y = event.y,
      absoluteX = event.rawX - hoverWindowOffset[0],
      absoluteY = event.rawY - hoverWindowOffset[1],
      pointerType = pointerType,
      pointerInside = isPointerInside(event.x, event.y),
    )

    // Asked of the handler so `pointerInside` means the same hitSlop-expanded
    // rect press events report it from. A sample taken without a handler is
    // never dispatched, so the fallback is arbitrary.
    private fun isPointerInside(x: Float, y: Float): Boolean {
      val moduleId = moduleId ?: return false
      val handlerTag = managedHandlerTag ?: return false
      val handler = RNGestureHandlerModule.registries[moduleId]?.getHandler(handlerTag) ?: return false

      return handler.isWithinBounds(this, x, y)
    }

    // No content view leaves screen coordinates as the best available answer,
    // the same fallback GestureHandler.prepare takes.
    private fun captureHoverWindowOffset() {
      val content = context.findActivity()?.findViewById<View>(android.R.id.content)
      if (content != null) {
        content.getLocationOnScreen(hoverWindowOffset)
      } else {
        hoverWindowOffset[0] = 0
        hoverWindowOffset[1] = 0
      }
    }

    private fun recordHoverSample(event: MotionEvent) {
      lastHoverSample = hoverSampleFrom(event, event.getPointerType())
    }

    fun resetHoverState() {
      isHovered = false
      hoverReported = false
      hoverActiveAtPressStart = false
      lastHoverSample = null
    }

    /**
     * Emits the balancing hover event whenever [hoverReported] drifts from
     * [effectiveHover]. Sharing that property with the hover visual is what
     * keeps callbacks and appearance in step, so disabling a hovered button
     * reports a hover-out and re-enabling it reports a hover-in.
     */
    private fun dispatchHoverEventIfNeeded() {
      // Only the v3 managed button listens for hover events. Checked before
      // `hoverReported` is touched, so a tag attached midway through a hover
      // can't leave it claiming a hover-in JS never received.
      if (managedHandlerTag == null) {
        return
      }

      val effective = effectiveHover

      if (effective == hoverReported) {
        return
      }

      hoverReported = effective
      dispatchHoverEvent(if (effective) EventType.HoverIn else EventType.HoverOut)
    }

    private fun dispatchHoverEvent(type: EventType) {
      val sample = lastHoverSample ?: return
      val reactContext = context as? ReactContext ?: return
      // TODO: deprecated, but its replacement is unavailable before RN 0.85 — drop when possible
      val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, this.id) ?: return

      eventDispatcher.dispatchEvent(RNGestureHandlerButtonEvent.obtain(this, sample, type))
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

    private fun createUnderlayDrawable(): PaintDrawable? {
      val isColorTransparent = underlayColor?.let { Color.alpha(it) == 0 } == true
      val hasVisibleOpacity = defaultUnderlayOpacity != 0f ||
        activeUnderlayOpacity != 0f ||
        hoverUnderlayOpacity != 0f
      if (isColorTransparent || !hasVisibleOpacity) {
        return null
      }

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
      underlay?.callback = this

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
      pendingPressOut?.let { handler?.removeCallbacks(it) }
      pendingPressOut = null
      pendingLongPress?.let { handler?.removeCallbacks(it) }
      pendingLongPress = null
      cancelPendingHoverOut()
      currentAnimator?.cancel()
      currentAnimator = null
      // `hoverReported` is deliberately left alone: Fabric reparents by removing
      // and re-inserting, so detaching is not proof the pointer left. A genuine
      // teardown clears it in `onDropViewInstance` instead.
      isHovered = false
      applyStartAnimationState()

      if (touchResponder === this) {
        touchResponder = null
      }
      if (soundResponder === this) {
        soundResponder = null
      }

      super.onDetachedFromWindow()
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

      if (!changed) {
        return
      }

      // The managed handler mirrors the button's enabled state.
      managedHandlerNeedsUpdate = true

      dispatchHoverEventIfNeeded()

      if (isHovered) {
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

    override fun shouldDelayChildPressedState(): Boolean = false

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

    /**
     * Snapshot of the hovering pointer, in pixels (events convert to DIP).
     * [x]/[y] are relative to the button, [absoluteX]/[absoluteY] to the window
     * as it sat when the hover session opened — a window moved mid-hover leaves
     * them stale until the pointer leaves and comes back.
     */
    data class HoverSample(
      val x: Float,
      val y: Float,
      val absoluteX: Float,
      val absoluteY: Float,
      val pointerType: Int,
      val pointerInside: Boolean,
    )

    enum class EventType {
      Press,
      PressIn,
      PressOut,
      LongPress,
      HoverIn,
      HoverOut,
      InteractionFinished,
    }
  }

  companion object {
    const val REACT_CLASS = "RNGestureHandlerButton"
  }
}
