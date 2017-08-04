package com.swmansion.gesturehandler;

import android.graphics.Matrix;
import android.graphics.PointF;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

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

  private final GestureHandler[] mGestureHandlers
          = new GestureHandler[SIMULTANEOUS_GESTURE_HANDLER_LIMIT];
  private final GestureHandler[] mAwaitingHandlers
          = new GestureHandler[SIMULTANEOUS_GESTURE_HANDLER_LIMIT];
  private final GestureHandler[] mPreparedHandlers
          = new GestureHandler[SIMULTANEOUS_GESTURE_HANDLER_LIMIT];
  private final GestureHandler[] mHandlersToCancel
          = new GestureHandler[SIMULTANEOUS_GESTURE_HANDLER_LIMIT];
  private int mGestureHandlersCount = 0;
  private int mAwaitingHandlersCount = 0;

  private boolean mIsHandlingTouch = false;
  private int mHandlingChangeSemaphore = 0;
  private boolean mFinishedHandlersCleanupScheduled = false;


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
    mIsHandlingTouch = true;
    int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_DOWN) {
      extractGestureHandlers(event);
    } else if (action == MotionEvent.ACTION_CANCEL) {
      cancelAll();
    }
    deliverEventToGestureHandlers(event);
    mIsHandlingTouch = false;
    if (mFinishedHandlersCleanupScheduled && mHandlingChangeSemaphore == 0) {
      cleanupFinishedHandlers();
    }
    return true;
  }

  private void scheduleFinishedHandlersCleanup() {
    if (mIsHandlingTouch || mHandlingChangeSemaphore != 0) {
      mFinishedHandlersCleanupScheduled = true;
    } else {
      cleanupFinishedHandlers();
    }
  }

  private void cleanupFinishedHandlers() {
    for (int i = mGestureHandlersCount - 1; i >= 0; i--) {
      GestureHandler handler = mGestureHandlers[i];
      if (isFinished(handler.getState()) && !isAwaiting(handler)) {
        mGestureHandlers[i] = mGestureHandlers[mGestureHandlersCount - 1];
        mGestureHandlers[mGestureHandlersCount - 1] = null;
        mGestureHandlersCount--;
        handler.reset();
        handler.mIsActive = false;
        handler.mIsAwaiting = false;
      }
    }
    mFinishedHandlersCleanupScheduled = false;
  }

  private boolean hasOtherHandlerToWaitFor(GestureHandler handler) {
    for (int i = 0; i < mGestureHandlersCount; i++) {
      GestureHandler otherHandler = mGestureHandlers[i];
      if (!isFinished(otherHandler.getState())
              && shouldHandlerWaitForOther(handler, otherHandler)) {
        return true;
      }
    }
    return false;
  }

  private void tryActivate(GestureHandler handler) {
    // see if there is anyone else who we need to wait for
    if (hasOtherHandlerToWaitFor(handler)) {
      addAwaitingHandler(handler);
    } else {
      // we can activate handler right away
      makeActive(handler);
      removeFromAwaitingHandlers(handler);
    }
  }

  /*package*/ void onHandlerStateChange(GestureHandler handler, int newState, int prevState) {
    mHandlingChangeSemaphore += 1;
    if (isFinished(newState) && !handler.mIsAwaiting) {
      removeFromAwaitingHandlers(handler);
    }
    if (newState == GestureHandler.STATE_CANCELLED || newState == GestureHandler.STATE_FAILED) {
      // if there were handlers awaiting completion of this handler, we can trigger active state
      for (int i = 0; i < mAwaitingHandlersCount; i++) {
        GestureHandler otherHandler = mAwaitingHandlers[i];
        if (shouldHandlerWaitForOther(otherHandler, handler)) {
          tryActivate(otherHandler);
        }
      }
    }
    if (newState == GestureHandler.STATE_ACTIVE) {
      tryActivate(handler);
    } else if (prevState == GestureHandler.STATE_ACTIVE || prevState == GestureHandler.STATE_END) {
      if (handler.mIsActive) {
        handler.dispatchStateChange(newState, prevState);
      }
    } else {
      handler.dispatchStateChange(newState, prevState);
    }
    mHandlingChangeSemaphore -= 1;
    scheduleFinishedHandlersCleanup();
  }

  private void makeActive(GestureHandler handler) {
    int currentState = handler.getState();

    handler.mIsAwaiting = false;
    handler.mIsActive = true;

    int toCancelCount = 0;
    // Cancel all handlers that are required to be cancel upon current handler's activation
    for (int i = 0; i < mGestureHandlersCount; i++) {
      GestureHandler otherHandler = mGestureHandlers[i];
      if (shouldHandlerBeCancelledBy(otherHandler, handler)) {
        mHandlersToCancel[toCancelCount++] = otherHandler;
      }
    }

    for (int i = toCancelCount - 1; i >= 0; i--) {
      mHandlersToCancel[i].cancel();
    }

    // Clear all awaiting handlers waiting for the current handler to fail
    for (int i = mAwaitingHandlersCount - 1; i >= 0; i--) {
      GestureHandler otherHandler = mAwaitingHandlers[i];
      if (shouldHandlerBeCancelledBy(otherHandler, handler)) {
        mAwaitingHandlers[i] = mAwaitingHandlers[mAwaitingHandlersCount - 1];
        mAwaitingHandlers[mAwaitingHandlersCount - 1] = null;
        mAwaitingHandlersCount--;
        otherHandler.cancel();
      }
    }

    // Dispatch state change event if handler is no longer in the active state we should also
    // trigger END state change and UNDETERMINED state change if necessary
    handler.dispatchStateChange(GestureHandler.STATE_ACTIVE, GestureHandler.STATE_BEGAN);
    if (currentState != GestureHandler.STATE_ACTIVE) {
      handler.dispatchStateChange(GestureHandler.STATE_END, GestureHandler.STATE_ACTIVE);
      if (currentState != GestureHandler.STATE_END) {
        handler.dispatchStateChange(GestureHandler.STATE_UNDETERMINED, GestureHandler.STATE_END);
      }
    }
  }

  public void deliverEventToGestureHandlers(MotionEvent event) {
    // Copy handlers to "prepared handlers" array, because the list of active handlers can change
    // as a result of state updates
    int handlersCount = mGestureHandlersCount;
    for (int i = 0; i < handlersCount; i++) {
      mPreparedHandlers[i] = mGestureHandlers[i];
    }
    for (int i = 0; i < handlersCount; i++) {
      deliverEventToGestureHandler(mPreparedHandlers[i], event);
    }
  }

  public void cancelAll() {
    for (int i = mAwaitingHandlersCount - 1; i >= 0; i--) {
      mAwaitingHandlers[i].cancel();
    }
    // Copy handlers to "prepared handlers" array, because the list of active handlers can change
    // as a result of state updates
    int handlersCount = mGestureHandlersCount;
    for (int i = 0; i < handlersCount; i++) {
      mPreparedHandlers[i] = mGestureHandlers[i];
    }
    for (int i = handlersCount - 1; i >= 0; i--) {
      mPreparedHandlers[i].cancel();
    }
  }

  private void deliverEventToGestureHandler(GestureHandler handler, MotionEvent event) {
    if (!handler.wantEvents()) {
      return;
    }
    if (handler.mIsAwaiting && event.getActionMasked() == MotionEvent.ACTION_MOVE) {
      return;
    }
    float[] coords = sTempCoords;
    extractCoordsForView(handler.getView(), event, coords);
    float oldX = event.getX();
    float oldY = event.getY();
    event.setLocation(coords[0], coords[1]);
    handler.handle(event);
    if (handler.mIsActive) {
      handler.dispatchTouchEvent(event);
    }
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

  private void addAwaitingHandler(GestureHandler handler) {
    for (int i = 0; i < mAwaitingHandlersCount; i++) {
      if (mAwaitingHandlers[i] == handler) {
        return;
      }
    }
    if (mAwaitingHandlersCount >= mAwaitingHandlers.length) {
      throw new IllegalStateException("Too many recognizers");
    }
    mAwaitingHandlers[mAwaitingHandlersCount++] = handler;
    handler.mIsAwaiting = true;
  }

  private boolean isAwaiting(GestureHandler handler) {
    for (int i = 0; i < mAwaitingHandlersCount; i++) {
      if (handler == mAwaitingHandlers[i]) {
        return true;
      }
    }
    return false;
  }

  private void removeFromAwaitingHandlers(GestureHandler handler) {
    for (int i = mAwaitingHandlersCount - 1; i >= 0; i--) {
      if (mAwaitingHandlers[i] == handler) {
        mAwaitingHandlers[i] = mAwaitingHandlers[mAwaitingHandlersCount - 1];
        mAwaitingHandlers[mAwaitingHandlersCount - 1] = null;
        mAwaitingHandlersCount--;
        return;
      }
    }
    handler.mIsAwaiting = false;
  }

  private void recordGestureHandler(GestureHandler handler, View view) {
    for (int i = 0; i < mGestureHandlersCount; i++) {
      if (mGestureHandlers[i] == handler) {
        return;
      }
    }
    if (mGestureHandlersCount >= mGestureHandlers.length) {
      throw new IllegalStateException("Too many recognizers");
    }
    mGestureHandlers[mGestureHandlersCount++] = handler;
    handler.mIsActive = false;
    handler.mIsAwaiting = false;
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

  private boolean extractGestureHandlers(MotionEvent event) {
    sTempCoords[0] = event.getX();
    sTempCoords[1] = event.getY();
    traverseWithPointerEvents(mWrapperView, sTempCoords);
    return extractGestureHandlers(mWrapperView, sTempCoords);
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
      if (view instanceof ViewGroup) {
        extractGestureHandlers((ViewGroup) view, coords);
      }
      recordHandlerIfNotPresent(view, coords);
      return;
    } else {
      throw new IllegalArgumentException(
              "Unknown pointer event type: " + pointerEvents.toString());
    }
  }

  private boolean isTransformedTouchPointInView(
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

    boolean isWithinBounds = false;
    ArrayList<GestureHandler> handlers = mHandlerRegistry.getHandlersForView(child);
    if (handlers != null) {
      for (int i = 0, size = handlers.size(); !isWithinBounds && i < size ; i++) {
        isWithinBounds = handlers.get(i).isWithinBounds(child, localX, localY);
      }
    }
    if (!isWithinBounds) {
      isWithinBounds = localX >= 0 && localX <= child.getWidth() && localY >= 0
              && localY < child.getHeight();
    }
    return isWithinBounds;
  }

  private static boolean shouldHandlerWaitForOther(GestureHandler handler, GestureHandler other) {
    return handler != other && (handler.shouldWaitForHandlerFailure(other)
            || other.shouldRequireToWaitForFailure(handler));
  }

  private static boolean canRunSimultaneously(GestureHandler a, GestureHandler b) {
    return a == b || a.shouldRecognizeSimultaneously(b) || b.shouldRecognizeSimultaneously(a);
  }

  private static boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler other) {
    if (handler != other && !other.shouldRecognizeSimultaneously(handler)) {// !canRunSimultaneously(handler, other)) {
      return true;
    } else if (handler != other &&
            (handler.mIsAwaiting || handler.getState() == GestureHandler.STATE_ACTIVE)) {
      return handler.shouldBeCancelledBy(other);
    }
    return false;
  }

  private static boolean isFinished(int state) {
    return state == GestureHandler.STATE_CANCELLED || state == GestureHandler.STATE_FAILED
            || state == GestureHandler.STATE_END;
  }
}
