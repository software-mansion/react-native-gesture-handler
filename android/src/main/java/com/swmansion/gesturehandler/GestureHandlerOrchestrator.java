package com.swmansion.gesturehandler;

import android.graphics.Matrix;
import android.graphics.PointF;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import java.util.ArrayList;

public class GestureHandlerOrchestrator {

  // The limit doesn't necessarily need to exists, it was just simpler to implement it that way
  // it is also more allocation-wise efficient to have a fixed limit
  private static final int SIMULTANEOUS_GESTURE_HANDLER_LIMIT = 20;

  private static final PointF sTempPoint = new PointF();
  private static final float[] sMatrixTransformCoords = new float[2];
  private static final Matrix sInverseMatrix = new Matrix();
  private static final float[] sTempCoords = new float[2];

  private final ViewGroup mWrapperView;
  private final GestureHandlerRegistry mHandlerRegistry;
  private final GestureHandler[] mGestureHandlers = new GestureHandler[SIMULTANEOUS_GESTURE_HANDLER_LIMIT];
  private int mGestureHandlersCount = 0;

  private boolean mAcceptNewHandlers = true;

  public GestureHandlerOrchestrator(ViewGroup wrapperView) {
    this(wrapperView, new GestureHandlerRegistryImpl());
  }

  public GestureHandlerOrchestrator(ViewGroup wrapperView, GestureHandlerRegistry registry) {
    mWrapperView = wrapperView;
    mHandlerRegistry = registry;
  }

  /**
   * Should be called from the view wrapper
   */
  public boolean onTouchEvent(MotionEvent event) {
    deliverEventToGestureHandlers(event);

    if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      reset();
    }

    return true;
  }

  private void reset() {
    for (int i = 0; i < mGestureHandlersCount; i++) {
      mGestureHandlers[i].reset();
    }
    mGestureHandlersCount = 0;
    mAcceptNewHandlers = true;
  }

  public void cancelOtherGestureHandlers(GestureHandler handler) {
    for (int i = 0; i < mGestureHandlersCount; i++) {
      GestureHandler other = mGestureHandlers[i];
      if (other != handler) {
        other.cancel();
      }
    }
    mAcceptNewHandlers = false;
  }

  public void deliverEventToGestureHandlers(MotionEvent event) {
    sTempCoords[0] = event.getX();
    sTempCoords[1] = event.getY();
    extractGestureHandlers(mWrapperView, sTempCoords);

    for (int i = 0; i < mGestureHandlersCount; i++) {
      deliverEventToGestureHandler(mGestureHandlers[i], event);
    }
  }

  private void deliverEventToGestureHandler(GestureHandler handler, MotionEvent event) {
    if (!handler.wantEvents()) {
      return;
    }
    float[] coords = sTempCoords;
    extractCoordsForView(handler.getView(), event, coords);
    float oldX = event.getX();
    float oldY = event.getY();
    event.setLocation(coords[0], coords[1]);
    handler.handle(event);
    event.setLocation(oldX, oldY);
  }

  private void extractCoordsForView(View view, MotionEvent event, float[] outputCoords) {
    if (view == mWrapperView) {
      outputCoords[0] = event.getX();
      outputCoords[1] = event.getY();
      return;
    }
    if (view == null || !(view.getParent() instanceof ViewGroup)) {
      throw new IllegalArgumentException("Parent is null? View is no longer in the tree");
    }
    ViewGroup parent = (ViewGroup) view.getParent();
    extractCoordsForView(parent, event, outputCoords);
    PointF childPoint = sTempPoint;
    isTransformedTouchPointInView(outputCoords[0], outputCoords[1], parent, view, childPoint);
    outputCoords[0] = childPoint.x;
    outputCoords[1] = childPoint.y;
  }

  private void recordGestureHandler(GestureHandler handler, View view) {
    if (!mAcceptNewHandlers) {
      return;
    }
    for (int i = 0; i < mGestureHandlersCount; i++) {
      if (mGestureHandlers[i] == handler) {
        return;
      }
    }
    if (mGestureHandlersCount >= mGestureHandlers.length) {
      throw new IllegalStateException("Too many recognizers");
    }
    mGestureHandlers[mGestureHandlersCount++] = handler;
    handler.prepare(view, this);
  }

  private void recordHandlerIfNotPresent(View view, float[] coords) {
    ArrayList<GestureHandler> handlers = mHandlerRegistry.getHandlersForView(view);
    if (handlers != null) {
      for (int i = 0, size = handlers.size(); i < size; i++) {
        recordGestureHandler(handlers.get(i), view);
      }
    }
  }

  private boolean extractGestureHandlers(ViewGroup viewGroup, float[] coords) {
    int childrenCount = viewGroup.getChildCount();
    boolean result = false;
    for (int i = childrenCount - 1; i >= 0; i--) {
      View child = viewGroup.getChildAt(i);
      PointF childPoint = sTempPoint;
      if (isTransformedTouchPointInView(coords[0], coords[1], viewGroup, child, childPoint)) {
        float restoreX = coords[0];
        float restoreY = coords[1];
        coords[0] = childPoint.x;
        coords[1] = childPoint.y;
        traverseWithPointerEvents(child, coords);
        coords[0] = restoreX;
        coords[1] = restoreY;
        result = true;
      }
    }
    return result;
  }

  private void traverseWithPointerEvents(View view, float coords[]) {
    PointerEvents pointerEvents = PointerEvents.AUTO;
    if (pointerEvents == PointerEvents.NONE) {
      // This view and its children can't be the target
      return;

    } else if (pointerEvents == PointerEvents.BOX_ONLY) {
      // This view is the target, its children don't matter
      recordHandlerIfNotPresent(view, coords);
      return;
    } else if (pointerEvents == PointerEvents.BOX_NONE) {
      // This view can't be the target, but its children might
      if (view instanceof ViewGroup) {
        extractGestureHandlers((ViewGroup) view, coords);
      }
      return;

    } else if (pointerEvents == PointerEvents.AUTO) {
      // Either this view or one of its children is the target
      recordHandlerIfNotPresent(view, coords);
      if (view instanceof ViewGroup) {
        extractGestureHandlers((ViewGroup) view, coords);
      }
      return;

    } else {
      throw new IllegalArgumentException(
              "Unknown pointer event type: " + pointerEvents.toString());
    }
  }

  private static boolean isTransformedTouchPointInView(
          float x,
          float y,
          ViewGroup parent,
          View child,
          PointF outLocalPoint) {
    float localX = x + parent.getScrollX() - child.getLeft();
    float localY = y + parent.getScrollY() - child.getTop();
    Matrix matrix = child.getMatrix();
    if (!matrix.isIdentity()) {
      float[] localXY = sMatrixTransformCoords;
      localXY[0] = localX;
      localXY[1] = localY;
      Matrix inverseMatrix = sInverseMatrix;
      matrix.invert(inverseMatrix);
      inverseMatrix.mapPoints(localXY);
      localX = localXY[0];
      localY = localXY[1];
    }
    outLocalPoint.set(localX, localY);
    if ((localX >= 0 && localX < (child.getRight() - child.getLeft()))
            && (localY >= 0 && localY < (child.getBottom() - child.getTop()))) {
      return true;
    }

    return false;
  }
}
