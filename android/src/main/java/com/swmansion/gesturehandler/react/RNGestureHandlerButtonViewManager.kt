package com.swmansion.gesturehandler.react

import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.content.Context
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
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.DynamicFromObject
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.LengthPercentage
import com.facebook.react.uimanager.LengthPercentageType
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.uimanager.common.ViewUtil
import com.facebook.react.uimanager.style.BorderRadiusProp
import com.facebook.react.viewmanagers.RNGestureHandlerButtonManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonManagerInterface
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.NativeViewGestureHandler
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager.ButtonViewGroup

@ReactModule(name = RNGestureHandlerButtonViewManager.REACT_CLASS)
class RNGestureHandlerButtonViewManager : ViewGroupManager<ButtonViewGroup>(), RNGestureHandlerButtonManagerInterface<ButtonViewGroup> {
  private val mDelegate: ViewManagerDelegate<ButtonViewGroup> =
    RNGestureHandlerButtonManagerDelegate(this)

  private fun borderRadiusFromDynamic(view: ButtonViewGroup, value: Dynamic): LengthPercentage? {
    var borderRadius = LengthPercentage.setFromDynamic(DynamicFromObject(value))

    if (ViewUtil.getUIManagerType(view) != UIManagerType.FABRIC &&
      borderRadius != null &&
      borderRadius.type == LengthPercentageType.PERCENT
    ) {
      borderRadius = null
    }

    return borderRadius
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
    view.backgroundColor = backgroundColor
  }

  @ReactProp(name = "borderless")
  override fun setBorderless(view: ButtonViewGroup, useBorderlessDrawable: Boolean) {
    view.useBorderlessDrawable = useBorderlessDrawable
  }

  @ReactProp(name = "enabled")
  override fun setEnabled(view: ButtonViewGroup, enabled: Boolean) {
    view.isEnabled = enabled
  }

  @ReactProp(name = "borderRadius")
  override fun setBorderRadius(view: ButtonViewGroup, borderRadius: Dynamic) {
    view.setBorderRadius(BorderRadiusProp.BORDER_RADIUS, borderRadiusFromDynamic(view, borderRadius))
  }

  @ReactProp(name = "borderTopLeftRadius")
  override fun setBorderTopLeftRadius(view: ButtonViewGroup, borderTopLeftRadius: Dynamic) {
    view.setBorderRadius(BorderRadiusProp.BORDER_TOP_LEFT_RADIUS, borderRadiusFromDynamic(view, borderTopLeftRadius))
  }

  @ReactProp(name = "borderTopRightRadius")
  override fun setBorderTopRightRadius(view: ButtonViewGroup, borderTopRightRadius: Dynamic) {
    view.setBorderRadius(BorderRadiusProp.BORDER_TOP_RIGHT_RADIUS, borderRadiusFromDynamic(view, borderTopRightRadius))
  }

  @ReactProp(name = "borderBottomLeftRadius")
  override fun setBorderBottomLeftRadius(view: ButtonViewGroup, borderBottomLeftRadius: Dynamic) {
    view.setBorderRadius(BorderRadiusProp.BORDER_BOTTOM_LEFT_RADIUS, borderRadiusFromDynamic(view, borderBottomLeftRadius))
  }

  @ReactProp(name = "borderBottomRightRadius")
  override fun setBorderBottomRightRadius(view: ButtonViewGroup, borderBottomRightRadius: Dynamic) {
    view.setBorderRadius(BorderRadiusProp.BORDER_BOTTOM_RIGHT_RADIUS, borderRadiusFromDynamic(view, borderBottomRightRadius))
  }

  @ReactProp(name = "borderWidth")
  override fun setBorderWidth(view: ButtonViewGroup, borderWidth: Float) {
    view.setBorderWidth(SIDE_ALL, PixelUtil.toPixelFromDIP(borderWidth))
  }

  @ReactProp(name = "borderLeftWidth")
  override fun setBorderLeftWidth(view: ButtonViewGroup, borderLeftWidth: Float) {
    view.setBorderWidth(SIDE_LEFT, PixelUtil.toPixelFromDIP(borderLeftWidth))
  }

  @ReactProp(name = "borderRightWidth")
  override fun setBorderRightWidth(view: ButtonViewGroup, borderRightWidth: Float) {
    view.setBorderWidth(SIDE_RIGHT, PixelUtil.toPixelFromDIP(borderRightWidth))
  }

  @ReactProp(name = "borderTopWidth")
  override fun setBorderTopWidth(view: ButtonViewGroup, borderTopWidth: Float) {
    view.setBorderWidth(SIDE_TOP, PixelUtil.toPixelFromDIP(borderTopWidth))
  }

  @ReactProp(name = "borderBottomWidth")
  override fun setBorderBottomWidth(view: ButtonViewGroup, borderBottomWidth: Float) {
    view.setBorderWidth(SIDE_BOTTOM, PixelUtil.toPixelFromDIP(borderBottomWidth))
  }

  @ReactProp(name = "borderStartWidth")
  override fun setBorderStartWidth(view: ButtonViewGroup, borderStartWidth: Float) {
    // todo: make this dependant on the RTL setting
    view.setBorderWidth(SIDE_LEFT, PixelUtil.toPixelFromDIP(borderStartWidth))
  }

  @ReactProp(name = "borderEndWidth")
  override fun setBorderEndWidth(view: ButtonViewGroup, borderEndWidth: Float) {
    view.setBorderWidth(SIDE_RIGHT, PixelUtil.toPixelFromDIP(borderEndWidth))
  }

  @ReactProp(name = "borderColor")
  override fun setBorderColor(view: ButtonViewGroup, borderColor: Int?) {
    view.setBorderColor(SIDE_ALL, borderColor)
  }

  @ReactProp(name = "borderLeftColor")
  override fun setBorderLeftColor(view: ButtonViewGroup, borderLeftColor: Int?) {
    view.setBorderColor(SIDE_LEFT, borderLeftColor)
  }

  @ReactProp(name = "borderRightColor")
  override fun setBorderRightColor(view: ButtonViewGroup, borderRightColor: Int?) {
    view.setBorderColor(SIDE_RIGHT, borderRightColor)
  }

  @ReactProp(name = "borderTopColor")
  override fun setBorderTopColor(view: ButtonViewGroup, borderTopColor: Int?) {
    view.setBorderColor(SIDE_TOP, borderTopColor)
  }

  @ReactProp(name = "borderBottomColor")
  override fun setBorderBottomColor(view: ButtonViewGroup, borderBottomColor: Int?) {
    view.setBorderColor(SIDE_BOTTOM, borderBottomColor)
  }

  @ReactProp(name = "borderStartColor")
  override fun setBorderStartColor(view: ButtonViewGroup, borderStartColor: Int?) {
    // todo: make this dependant on the RTL setting
    view.setBorderColor(SIDE_LEFT, borderStartColor)
  }

  @ReactProp(name = "borderEndColor")
  override fun setBorderEndColor(view: ButtonViewGroup, borderEndColor: Int?) {
    view.setBorderColor(SIDE_RIGHT, borderEndColor)
  }

  @ReactProp(name = "borderStyle")
  override fun setBorderStyle(view: ButtonViewGroup, borderStyle: String?) {
    view.setBorderStyle(borderStyle)
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

  override fun getDelegate(): ViewManagerDelegate<ButtonViewGroup> {
    return mDelegate
  }

  class ButtonViewGroup(context: Context?) :
    ReactViewGroup(context),
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

    var exclusive = true

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

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
      if (super.onInterceptTouchEvent(ev)) {
        return true
      }
      // We call `onTouchEvent` and wait until button changes state to `pressed`, if it's pressed
      // we return true so that the gesture handler can activate.
      onTouchEvent(ev)
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

//    fun updateBackground() {
//      if (!needBackgroundUpdate) {
//        return
//      }
//      needBackgroundUpdate = false
//
//      val selectable = createSelectableDrawable()
//
//      if (selectable is RippleDrawable) {
//        val mask = PaintDrawable(Color.WHITE)
//        mask.setCornerRadii(buildBorderRadii())
//        selectable.setDrawableByLayerId(android.R.id.mask, mask)
//      }
//    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
      // No-op
    }

    override fun drawableHotspotChanged(x: Float, y: Float) {
      if (touchResponder == null || touchResponder === this) {
        super.drawableHotspotChanged(x, y)
      }
    }

    override fun canBegin(event: MotionEvent): Boolean {
      if (event.action == MotionEvent.ACTION_CANCEL || event.action == MotionEvent.ACTION_UP || event.actionMasked == MotionEvent.ACTION_POINTER_UP) {
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
      // there is a possibility of this method being called before NativeViewGestureHandler has
      // opportunity to call canStart, in that case we need to grab responder in case the gesture
      // will activate
      // when canStart is called eventually, tryGrabbingResponder will return true if the button
      // already is a responder
      if (pressed) {
        if (tryGrabbingResponder()) {
          soundResponder = this
        }
      }
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
    const val SIDE_ALL = 0
    const val SIDE_LEFT = 1
    const val SIDE_RIGHT = 2
    const val SIDE_TOP = 3
    const val SIDE_BOTTOM = 4
  }
}
