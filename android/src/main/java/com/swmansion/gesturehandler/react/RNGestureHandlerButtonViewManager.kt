package com.swmansion.gesturehandler.react

import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.Drawable
import android.graphics.drawable.LayerDrawable
import android.graphics.drawable.PaintDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.util.TypedValue
import android.view.MotionEvent
import android.view.View.OnClickListener
import android.view.ViewGroup
import com.facebook.react.bridge.SoftAssertions
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewProps
import com.facebook.react.uimanager.annotations.ReactProp
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager.ButtonViewGroup

class RNGestureHandlerButtonViewManager : ViewGroupManager<ButtonViewGroup>() {
  override fun getName(): String {
    return "RNGestureHandlerButton"
  }

  public override fun createViewInstance(context: ThemedReactContext): ButtonViewGroup {
    return ButtonViewGroup(context)
  }

  @TargetApi(Build.VERSION_CODES.M)
  @ReactProp(name = "foreground")
  fun setForeground(view: ButtonViewGroup, useDrawableOnForeground: Boolean) {
    view.setUseDrawableOnForeground(useDrawableOnForeground)
  }

  @ReactProp(name = "borderless")
  fun setBorderless(view: ButtonViewGroup, useBorderlessDrawable: Boolean) {
    view.setUseBorderlessDrawable(useBorderlessDrawable)
  }

  @ReactProp(name = "enabled")
  fun setEnabled(view: ButtonViewGroup, enabled: Boolean) {
    view.isEnabled = enabled
  }

  @ReactProp(name = ViewProps.BORDER_RADIUS)
  override fun setBorderRadius(view: ButtonViewGroup, borderRadius: Float) {
    view.setBorderRadius(borderRadius)
  }

  @ReactProp(name = "rippleColor")
  fun setRippleColor(view: ButtonViewGroup, rippleColor: Int?) {
    view.setRippleColor(rippleColor)
  }

  @ReactProp(name = "rippleRadius")
  fun setRippleRadius(view: ButtonViewGroup, rippleRadius: Int?) {
    view.setRippleRadius(rippleRadius)
  }

  override fun onAfterUpdateTransaction(view: ButtonViewGroup) {
    view.updateBackground()
  }

  class ButtonViewGroup(context: Context?) : ViewGroup(context) {
    var mBackgroundColor = Color.TRANSPARENT

    // Using object because of handling null representing no value set.
    var mRippleColor: Int? = null
    var mRippleRadius: Int? = null
    var mUseForeground = false
    var mUseBorderless = false
    var mBorderRadius = 0f
    var mNeedBackgroundUpdate = false
    var mLastEventTime: Long = 0
    
    init {
      // we attach empty click listener to trigger tap sounds (see View#performClick())
      setOnClickListener(sDummyClickListener)
      isClickable = true
      isFocusable = true
      mNeedBackgroundUpdate = true
    }

    override fun setBackgroundColor(color: Int) {
      mBackgroundColor = color
      mNeedBackgroundUpdate = true
    }

    fun setRippleColor(color: Int?) {
      mRippleColor = color
      mNeedBackgroundUpdate = true
    }

    fun setRippleRadius(radius: Int?) {
      mRippleRadius = radius
      mNeedBackgroundUpdate = true
    }

    fun setBorderRadius(borderRadius: Float) {
      mBorderRadius = borderRadius * resources.displayMetrics.density
      mNeedBackgroundUpdate = true
    }

    private fun applyRippleEffectWhenNeeded(selectable: Drawable): Drawable {
      if (mRippleColor != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && selectable is RippleDrawable) {
        val states = arrayOf(intArrayOf(android.R.attr.state_enabled))
        val colors = intArrayOf(mRippleColor!!)
        val colorStateList = ColorStateList(states, colors)
        selectable.setColor(colorStateList)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && mRippleRadius != null && selectable is RippleDrawable) {
        selectable.radius = PixelUtil.toPixelFromDIP(mRippleRadius!!.toFloat()).toInt()
      }
      return selectable
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
     * To mitigate this behavior we use mLastEventTime variable to check that we already handled
     * the event in [.onInterceptTouchEvent]. We assume here that different events
     * will have different event times.
     *
     * Reference:
     * [com.swmansion.gesturehandler.NativeViewGestureHandler.onHandle]  */
    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
      val eventTime = event.eventTime
      if (mLastEventTime != eventTime || mLastEventTime == 0L) {
        mLastEventTime = eventTime
        return super.onTouchEvent(event)
      }
      return false
    }

    fun updateBackground() {
      if (!mNeedBackgroundUpdate) {
        return
      }
      mNeedBackgroundUpdate = false
      if (mBackgroundColor == Color.TRANSPARENT) {
        // reset background
        background = null
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        // reset foreground
        foreground = null
      }
      if (mUseForeground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        foreground = applyRippleEffectWhenNeeded(createSelectableDrawable())
        if (mBackgroundColor != Color.TRANSPARENT) {
          setBackgroundColor(mBackgroundColor)
        }
      } else if (mBackgroundColor == Color.TRANSPARENT && mRippleColor == null) {
        background = createSelectableDrawable()
      } else {
        val colorDrawable = PaintDrawable(mBackgroundColor)
        val selectable = createSelectableDrawable()
        if (mBorderRadius != 0f) {
          // Radius-connected lines below ought to be considered
          // as a temporary solution. It do not allow to set
          // different radius on each corner. However, I suppose it's fairly
          // fine for button-related use cases.
          // Therefore it might be used as long as:
          // 1. ReactViewManager is not a generic class with a possibility to handle another ViewGroup
          // 2. There's no way to force native behavior of ReactViewGroup's superclass's onTouchEvent
          colorDrawable.setCornerRadius(mBorderRadius)
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
            && selectable is RippleDrawable) {
            val mask = PaintDrawable(Color.WHITE)
            mask.setCornerRadius(mBorderRadius)
            selectable.setDrawableByLayerId(android.R.id.mask, mask)
          }
        }
        applyRippleEffectWhenNeeded(selectable)
        val layerDrawable = LayerDrawable(arrayOf(colorDrawable, selectable))
        background = layerDrawable
      }
    }

    fun setUseDrawableOnForeground(useForeground: Boolean) {
      mUseForeground = useForeground
      mNeedBackgroundUpdate = true
    }

    fun setUseBorderlessDrawable(useBorderless: Boolean) {
      mUseBorderless = useBorderless
    }

    private fun createSelectableDrawable(): Drawable {
      val version = Build.VERSION.SDK_INT
      val identifier = if (mUseBorderless && version >= 21) SELECTABLE_ITEM_BACKGROUND_BORDERLESS else SELECTABLE_ITEM_BACKGROUND
      val attrID = getAttrId(context, identifier)
      context.theme.resolveAttribute(attrID, sResolveOutValue, true)
      return if (version >= 21) {
        resources.getDrawable(sResolveOutValue.resourceId, context.theme)
      } else {
        resources.getDrawable(sResolveOutValue.resourceId)
      }
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
      // No-op
    }

    override fun drawableHotspotChanged(x: Float, y: Float) {
      if (sResponder == null || sResponder === this) {
        super.drawableHotspotChanged(x, y)
      }
    }

    override fun setPressed(pressed: Boolean) {
      if (pressed && sResponder == null) {
        // first button to be pressed grabs button responder
        sResponder = this
      }
      if (!pressed || sResponder === this) {
        // we set pressed state only for current responder
        super.setPressed(pressed)
      }
      if (!pressed && sResponder === this) {
        // if the responder is no longer pressed we release button responder
        sResponder = null
      }
    }

    override fun dispatchDrawableHotspotChanged(x: Float, y: Float) {
      // by default viewgroup would pass hotspot change events
    }

    companion object {
      var sResolveOutValue = TypedValue()
      var sResponder: ButtonViewGroup? = null
      var sDummyClickListener = OnClickListener { }
      const val SELECTABLE_ITEM_BACKGROUND = "selectableItemBackground"
      const val SELECTABLE_ITEM_BACKGROUND_BORDERLESS = "selectableItemBackgroundBorderless"
      @TargetApi(Build.VERSION_CODES.LOLLIPOP)
      private fun getAttrId(context: Context, attr: String): Int {
        SoftAssertions.assertNotNull(attr)
        return if (SELECTABLE_ITEM_BACKGROUND == attr) {
          R.attr.selectableItemBackground
        } else if (SELECTABLE_ITEM_BACKGROUND_BORDERLESS == attr) {
          R.attr.selectableItemBackgroundBorderless
        } else {
          context.resources.getIdentifier(attr, "attr", "android")
        }
      }
    }
  }
}