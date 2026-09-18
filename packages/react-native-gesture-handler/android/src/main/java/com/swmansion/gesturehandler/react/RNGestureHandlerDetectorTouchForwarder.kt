package com.swmansion.gesturehandler.react

import android.graphics.PointF
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.facebook.react.touch.OnInterceptTouchEventListener
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandlerOrchestrator
import java.util.WeakHashMap

/**
 * PoC for #4529. Android's ViewGroup only offers a touch to a child whose bounds contain it, so
 * content moved outside a detector's frame by a transform never receives native touches. This
 * hooks the detector's parent: on ACTION_DOWN it checks, from the live view matrices, whether a
 * detector's transformed content contains the point although the detector's bounds don't, and if
 * so intercepts the touch and forwards it to that detector for the whole gesture. Nothing runs per
 * frame and UI-thread-only transforms are covered.
 *
 * Intercepting is needed because RN's `ReactViewGroup.onTouchEvent` consumes every touch, so a
 * sibling under the moved content would swallow it before an `OnTouchListener` runs. RN installs
 * its `JSResponderHandler` in the intercept slot at view creation; there is no accessor for it, so
 * the PoC chains to it via reflection. `TouchDelegate` is not an option: `ReactViewGroup` never
 * calls `super.onTouchEvent`, so a delegate is never consulted.
 */
class RNGestureHandlerDetectorTouchForwarder private constructor(private val parent: ViewGroup) :
  View.OnTouchListener,
  OnInterceptTouchEventListener {
  private val detectors = mutableListOf<RNGestureHandlerDetectorView>()
  private var target: RNGestureHandlerDetectorView? = null
  private var chainedInterceptListener: OnInterceptTouchEventListener? = null

  override fun onInterceptTouchEvent(view: ViewGroup, event: MotionEvent): Boolean {
    if (event.actionMasked == MotionEvent.ACTION_DOWN) {
      target = findTarget(event.x, event.y)
      if (target != null) {
        return true
      }
    }
    return chainedInterceptListener?.onInterceptTouchEvent(view, event) ?: false
  }

  override fun onTouch(view: View, event: MotionEvent): Boolean {
    val detector = target ?: return false

    val forwarded = MotionEvent.obtain(event)
    forwarded.offsetLocation(
      (parent.scrollX - detector.left).toFloat(),
      (parent.scrollY - detector.top).toFloat(),
    )
    val handled = detector.dispatchTouchEvent(forwarded)
    forwarded.recycle()

    val action = event.actionMasked
    if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
      target = null
    }
    return handled
  }

  private fun findTarget(x: Float, y: Float): RNGestureHandlerDetectorView? {
    // Topmost detector first.
    for (detector in detectors.asReversed()) {
      if (detector.parent !== parent || detector.visibility != View.VISIBLE) {
        continue
      }

      val local = PointF()
      GestureHandlerOrchestrator.transformPointToChildViewCoords(x, y, parent, detector, local)
      // Inside the detector's own bounds the regular dispatch handles it.
      if (contains(detector, local)) {
        continue
      }
      if (!containsTransformedChild(detector, local)) {
        continue
      }
      // A sibling drawn above the detector that contains the point keeps priority.
      if (isCoveredByLaterSibling(detector, x, y)) {
        continue
      }
      return detector
    }
    return null
  }

  private fun containsTransformedChild(detector: RNGestureHandlerDetectorView, local: PointF): Boolean {
    for (i in 0 until detector.childCount) {
      val child = detector.getChildAt(i)
      val childPoint = PointF()
      GestureHandlerOrchestrator.transformPointToChildViewCoords(local.x, local.y, detector, child, childPoint)
      if (contains(child, childPoint)) {
        return true
      }
    }
    return false
  }

  // PoC: child index as drawing order; zIndex/elevation reordering is not considered.
  private fun isCoveredByLaterSibling(detector: View, x: Float, y: Float): Boolean {
    val index = parent.indexOfChild(detector)
    for (i in index + 1 until parent.childCount) {
      val sibling = parent.getChildAt(i)
      if (sibling.visibility != View.VISIBLE) {
        continue
      }
      val point = PointF()
      GestureHandlerOrchestrator.transformPointToChildViewCoords(x, y, parent, sibling, point)
      if (contains(sibling, point)) {
        return true
      }
    }
    return false
  }

  private fun contains(view: View, point: PointF) =
    point.x in 0f..view.width.toFloat() && point.y in 0f..view.height.toFloat()

  private fun install() {
    parent.setOnTouchListener(this)
    if (parent is ReactViewGroup) {
      chainedInterceptListener = readInterceptListener(parent)
      parent.setOnInterceptTouchEventListener(this)
    }
  }

  private fun uninstall() {
    parent.setOnTouchListener(null)
    if (parent is ReactViewGroup) {
      chainedInterceptListener?.let { parent.setOnInterceptTouchEventListener(it) }
      chainedInterceptListener = null
    }
  }

  companion object {
    private val forwarders = WeakHashMap<ViewGroup, RNGestureHandlerDetectorTouchForwarder>()

    // PoC only: RN keeps the JSResponderHandler in a private field with no getter.
    private val interceptListenerField =
      runCatching {
        ReactViewGroup::class.java.getDeclaredField("onInterceptTouchEventListener").apply { isAccessible = true }
      }.getOrNull()

    private fun readInterceptListener(view: ReactViewGroup): OnInterceptTouchEventListener? =
      interceptListenerField?.get(view) as? OnInterceptTouchEventListener

    fun register(detector: RNGestureHandlerDetectorView) {
      val parent = detector.parent as? ViewGroup ?: return
      val forwarder =
        forwarders.getOrPut(parent) {
          RNGestureHandlerDetectorTouchForwarder(parent).also { it.install() }
        }
      if (detector !in forwarder.detectors) {
        forwarder.detectors.add(detector)
      }
    }

    fun unregister(detector: RNGestureHandlerDetectorView) {
      val parent = detector.parent as? ViewGroup ?: return
      val forwarder = forwarders[parent] ?: return
      forwarder.detectors.remove(detector)
      if (forwarder.target === detector) {
        forwarder.target = null
      }
      if (forwarder.detectors.isEmpty()) {
        forwarder.uninstall()
        forwarders.remove(parent)
      }
    }
  }
}
