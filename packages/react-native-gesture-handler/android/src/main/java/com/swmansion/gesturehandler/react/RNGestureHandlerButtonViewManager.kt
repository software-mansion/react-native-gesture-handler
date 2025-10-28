package com.swmansion.gesturehandler.react

import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.PathEffect
import android.graphics.drawable.Drawable
import android.graphics.drawable.LayerDrawable
import android.graphics.drawable.PaintDrawable
import android.graphics.drawable.RippleDrawable
import android.graphics.drawable.ShapeDrawable
import android.graphics.drawable.shapes.RectShape
import android.os.Build
import android.util.TypedValue
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.View.OnClickListener
import android.view.ViewGroup
import android.view.ViewParent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.core.view.children
import com.facebook.react.R
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
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
    view.setBackgroundColor(backgroundColor)
  }

  @ReactProp(name = "borderless")
  override fun setBorderless(view: ButtonViewGroup, useBorderlessDrawable: Boolean) {
    view.useBorderlessDrawable = useBorderlessDrawable
  }

  @ReactProp(name = "enabled")
  override fun setEnabled(view: ButtonViewGroup, enabled: Boolean) {
    view.isEnabled = enabled
  }

  @ReactProp(name = ViewProps.BORDER_RADIUS)
  override fun setBorderRadius(view: ButtonViewGroup, borderRadius: Float) {
    view.borderRadius = borderRadius
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ButtonViewGroup, borderTopLeftRadius: Float) {
    view.borderTopLeftRadius = borderTopLeftRadius
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ButtonViewGroup, borderTopRightRadius: Float) {
    view.borderTopRightRadius = borderTopRightRadius
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ButtonViewGroup, borderBottomLeftRadius: Float) {
    view.borderBottomLeftRadius = borderBottomLeftRadius
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ButtonViewGroup, borderBottomRightRadius: Float) {
    view.borderBottomRightRadius = borderBottomRightRadius
  }

  @ReactProp(name = "borderWidth")
  override fun setBorderWidth(view: ButtonViewGroup, borderWidth: Float) {
    view.borderWidth = borderWidth
  }

  @ReactProp(name = "borderColor")
  override fun setBorderColor(view: ButtonViewGroup, borderColor: Int?) {
    view.borderColor = borderColor
  }

  @ReactProp(name = "borderStyle")
  override fun setBorderStyle(view: ButtonViewGroup, borderStyle: String?) {
    view.borderStyle = borderStyle
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

  override fun onAfterUpdateTransaction(view: ButtonViewGroup) {
    super.onAfterUpdateTransaction(view)

    view.updateBackground()
  }

  override fun getDelegate(): ViewManagerDelegate<ButtonViewGroup>? = mDelegate

  class ButtonViewGroup(context: Context?) :
    ViewGroup(context),
    NativeViewGestureHandler.NativeViewGestureHandlerHook {
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
    var borderRadius = 0f
      set(radius) = withBackgroundUpdate {
        field = radius * resources.displayMetrics.density
      }
    var borderTopLeftRadius = 0f
      set(radius) = withBackgroundUpdate {
        field = radius * resources.displayMetrics.density
      }
    var borderTopRightRadius = 0f
      set(radius) = withBackgroundUpdate {
        field = radius * resources.displayMetrics.density
      }
    var borderBottomLeftRadius = 0f
      set(radius) = withBackgroundUpdate {
        field = radius * resources.displayMetrics.density
      }
    var borderBottomRightRadius = 0f
      set(radius) = withBackgroundUpdate {
        field = radius * resources.displayMetrics.density
      }
    var borderWidth = 0f
      set(width) = withBackgroundUpdate {
        field = width * resources.displayMetrics.density
      }
    var borderColor: Int? = null
      set(color) = withBackgroundUpdate {
        field = color
      }
    var borderStyle: String? = "solid"
      set(style) = withBackgroundUpdate {
        field = style
      }

    private val hasBorderRadii: Boolean
      get() = borderRadius != 0f ||
        borderTopLeftRadius != 0f ||
        borderTopRightRadius != 0f ||
        borderBottomLeftRadius != 0f ||
        borderBottomRightRadius != 0f

    var exclusive = true

    private var buttonBackgroundColor = Color.TRANSPARENT
    private var needBackgroundUpdate = false
    private var lastEventTime = -1L
    private var lastAction = -1
    private var receivedKeyEvent = false

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

    private fun buildBorderRadii(): FloatArray {
      // duplicate radius for each corner, as setCornerRadii expects X radius and Y radius for each
      return floatArrayOf(
        borderTopLeftRadius,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        borderBottomLeftRadius,
      )
        .map { if (it != 0f) it else borderRadius }
        .toFloatArray()
    }

    private fun buildBorderStyle(): PathEffect? = when (borderStyle) {
      "dotted" -> DashPathEffect(floatArrayOf(borderWidth, borderWidth, borderWidth, borderWidth), 0f)
      "dashed" -> DashPathEffect(floatArrayOf(borderWidth * 3, borderWidth * 3, borderWidth * 3, borderWidth * 3), 0f)
      else -> null
    }

    override fun setBackgroundColor(color: Int) = withBackgroundUpdate {
      buttonBackgroundColor = color
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

    private fun updateBackgroundColor(backgroundColor: Int, borderDrawable: Drawable, selectable: Drawable?) {
      val colorDrawable = PaintDrawable(backgroundColor)

      if (hasBorderRadii) {
        colorDrawable.setCornerRadii(buildBorderRadii())
      }

      val layerDrawable = LayerDrawable(
        if (selectable != null) {
          arrayOf(colorDrawable, selectable, borderDrawable)
        } else {
          arrayOf(colorDrawable, borderDrawable)
        },
      )
      background = layerDrawable
    }

    fun updateBackground() {
      if (!needBackgroundUpdate) {
        return
      }
      needBackgroundUpdate = false

      if (buttonBackgroundColor == Color.TRANSPARENT) {
        // reset background
        background = null
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        // reset foreground
        foreground = null
      }

      val selectable = createSelectableDrawable()
      val borderDrawable = createBorderDrawable()

      if (hasBorderRadii && selectable is RippleDrawable) {
        val mask = PaintDrawable(Color.WHITE)
        mask.setCornerRadii(buildBorderRadii())
        selectable.setDrawableByLayerId(android.R.id.mask, mask)
      }

      if (useDrawableOnForeground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        foreground = selectable
        if (buttonBackgroundColor != Color.TRANSPARENT) {
          updateBackgroundColor(buttonBackgroundColor, borderDrawable, null)
        }
      } else if (buttonBackgroundColor == Color.TRANSPARENT && rippleColor == null) {
        background = LayerDrawable(arrayOf(selectable, borderDrawable))
      } else {
        updateBackgroundColor(buttonBackgroundColor, borderDrawable, selectable)
      }
    }

    private fun createBorderDrawable(): Drawable {
      val borderDrawable = PaintDrawable(Color.TRANSPARENT)

      if (hasBorderRadii) {
        borderDrawable.setCornerRadii(buildBorderRadii())
      }

      if (borderWidth > 0f) {
        borderDrawable.paint.apply {
          style = Paint.Style.STROKE
          strokeWidth = borderWidth
          color = borderColor ?: Color.BLACK
          pathEffect = buildBorderStyle()
        }
      }

      return borderDrawable
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

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
      // No-op
    }

    override fun drawableHotspotChanged(x: Float, y: Float) {
      if (touchResponder == null || touchResponder === this) {
        super.drawableHotspotChanged(x, y)
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
          findGestureHandlerRootView()?.activateNativeHandlers(this)
        } else if (receivedKeyEvent) {
          findGestureHandlerRootView()?.activateNativeHandlers(this)
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

    private fun findGestureHandlerRootView(): RNGestureHandlerRootView? {
      var parent: ViewParent? = this.parent
      var gestureHandlerRootView: RNGestureHandlerRootView? = null

      while (parent != null) {
        if (parent is RNGestureHandlerRootView) {
          gestureHandlerRootView = parent
        }
        parent = parent.parent
      }

      return gestureHandlerRootView
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
