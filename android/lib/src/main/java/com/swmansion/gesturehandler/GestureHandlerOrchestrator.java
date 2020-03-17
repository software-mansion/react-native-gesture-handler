package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.graphics.Matrix;
import android.graphics.PointF;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

public class GestureHandlerOrchestrator {

  // The limit doesn't necessarily need to exists, it was just simpler to implement it that way
  // it is also more allocation-wise efficient to have a fixed limit
  private static final int SIMULTANEOUS_GESTURE_HANDLER_LIMIT = 20;
  // Be default fully transparent views can receive touch
  private static final float DEFAULT_MIN_ALPHA_FOR_TRAVERSAL = 0f;

  private static final PointF sTempPoint = new PointF();
  private static final float[] sMatrixTransformCoords = new float[2];
  private static final Matrix sInverseMatrix = new Matrix();
  private static final float[] sTempCoords = new float[2];

  private static final Comparator<GestureHandler> sHandlersComparator =
          new Comparator<GestureHandler>() {
            @Override
            public int compare(GestureHandler a, GestureHandler b) {
              if (a.mIsActive && b.mIsActive || a.mIsAwaiting && b.mIsAwaiting) {
                // both A and B are either active or awaiting activation, in which case we prefer one that
                // has activated (or turned into "awaiting" state) earlier
                return Integer.signum(b.mActivationIndex - a.mActivationIndex);
              } else if (a.mIsActive) {
                return -1; // only A is active
              } else if (b.mIsActive) {
                return 1; // only B is active
              } else if (a.mIsAwaiting) {
                return -1; // only A is awaiting, B is inactive
              } else if (b.mIsAwaiting) {
                return 1; // only B is awaiting, A is inactive
              }
              return 0; // both A and B are inactive, stable order matters
            }
          };

  private static final Comparator<GestureHandler> sDragDropHandlersComparator =
          new Comparator<GestureHandler>() {
            @Override
            public int compare(GestureHandler a, GestureHandler b) {
              if (a instanceof DropGestureHandler && b instanceof DropGestureHandler) {
                // we need the exact opposite of sHandlersComparator
                int order = sHandlersComparator.compare(a, b);
                return order == 0 ? -1: -order;
              } else if (a instanceof DropGestureHandler && b instanceof DragGestureHandler) {
                return -1;
              } else if (a instanceof DragGestureHandler && b instanceof DropGestureHandler) {
                return 1;
              } else {
                return sHandlersComparator.compare(a, b);
              }
            }
          };

  private static final GestureHandlerAssertions sAssertHandler = new GestureHandlerAssertions() {
    @Override
    public boolean assertTrue(GestureHandler handler) {
      return true;
    }
  };

  private static final GestureHandlerAssertions sAssertDropHandler = new GestureHandlerAssertions() {
    @Override
    public boolean assertTrue(GestureHandler handler) {
      return handler instanceof DropGestureHandler;
    }
  };

  private final ViewGroup mWrapperView;
  private final GestureHandlerRegistry mHandlerRegistry;
  private final ViewConfigurationHelper mViewConfigHelper;

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
  private int mActivationIndex = 0;

  private float mMinAlphaForTraversal = DEFAULT_MIN_ALPHA_FOR_TRAVERSAL;

  boolean mIsDragging = false;
  private DragGestureUtils.DerivedMotionEvent mDerivedMotionEvent = new DragGestureUtils.DerivedMotionEvent();
  private ClipDescription mLastClipDescription;
  private ClipData mLastClipData;
  private float mLastDragX;
  private float mLastDragY;
  private ArrayList<DropGestureHandler> mDropHandlers = new ArrayList<>();
  private boolean mFlagNextDragLocationEvent;
  private boolean mNeedsToPrepareJoiningHandlers;

  public GestureHandlerOrchestrator(
          ViewGroup wrapperView,
          GestureHandlerRegistry registry,
          ViewConfigurationHelper viewConfigurationHelper) {
    mWrapperView = wrapperView;
    mHandlerRegistry = registry;
    mViewConfigHelper = viewConfigurationHelper;
  }

  /**
   * Minimum alpha (value from 0 to 1) that should be set to a view so that it can be treated as a
   * gesture target. E.g. if set to 0.1 then views that less than 10% opaque will be ignored when
   * traversing view hierarchy and looking for gesture handlers.
   */
  public void setMinimumAlphaForTraversal(float alpha) {
    mMinAlphaForTraversal = alpha;
  }

  GestureHandler getHandler(int tag) {
    return mHandlerRegistry.getHandler(tag);
  }

  /**
   * Should be called from the view wrapper
   */
  public boolean onTouchEvent(MotionEvent event) {
    mIsHandlingTouch = true;
    int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
      extractGestureHandlers(event);
    } else if (action == MotionEvent.ACTION_CANCEL) {
      if (mIsDragging) {
        // This occurs when a drag gesture starts, seizing the interaction
        event.setAction(MotionEvent.ACTION_MOVE);
      } else {
        cancelAll();
      }
    }
    deliverEventToGestureHandlers(event);
    mIsHandlingTouch = false;
    if (mFinishedHandlersCleanupScheduled && mHandlingChangeSemaphore == 0) {
      cleanupFinishedHandlers();
    }
    return true;
  }

  public boolean onDragEvent(DragEvent event) {
    int action = event.getAction();
    if (action == DragEvent.ACTION_DRAG_STARTED) {
      // make sure mDropHandlers is empty
      // crucial in case an END event was missed
      mDropHandlers.clear();
      mNeedsToPrepareJoiningHandlers = true;
      // STARTED event has unreliable x, y so we don't handle it
      return false;
    } else if (action == DragEvent.ACTION_DRAG_ENTERED) {
      // ENTERED event is fired without x, y data so we flag the next event in order to set it's action to ENTERED
      mIsDragging = true;
      mFlagNextDragLocationEvent = true;
      return true;
    } else if (mFlagNextDragLocationEvent && action == DragEvent.ACTION_DRAG_LOCATION) {
      mLastDragX = event.getX();
      mLastDragY = event.getY();
      mFlagNextDragLocationEvent = false;
      event = DragGestureUtils.obtain(DragEvent.ACTION_DRAG_ENTERED, event.getX(), event.getY(),
              event.getResult(), event.getClipData(), event.getClipDescription());
      mDerivedMotionEvent.setDownTime();
    } else if (action == DragEvent.ACTION_DRAG_EXITED) {
      event = DragGestureUtils.obtain(action, mLastDragX, mLastDragY,
              event.getResult(), event.getClipData(), event.getClipDescription());
    } else if (action == DragEvent.ACTION_DRAG_ENDED) {
      event = DragGestureUtils.obtain(DragEvent.ACTION_DRAG_ENDED, mLastDragX, mLastDragY,
              event.getResult(), mLastClipData, mLastClipDescription);
    }

    MotionEvent motionEvent = mDerivedMotionEvent.obtain(event);
    mIsHandlingTouch = true;
    if (action == DragEvent.ACTION_DRAG_LOCATION) {
      extractGestureHandlers(event);
    }
    deliverEventToGestureHandlers(motionEvent);
    deliverEventToGestureHandlers(event);
    // sometimes the system fails to fire a ENDED event after a DROP
    if (action == DragEvent.ACTION_DROP) {
      DragEvent ev = DragGestureUtils.obtain(DragEvent.ACTION_DRAG_ENDED, event.getX(), event.getY(),
              event.getResult(), event.getClipData(), event.getClipDescription());
      deliverEventToGestureHandlers(ev);
      DragGestureUtils.recycle(ev);
    }
    mIsHandlingTouch = false;
    mNeedsToPrepareJoiningHandlers = false;
    if (action == DragEvent.ACTION_DRAG_ENDED) {
      mIsDragging = false;
      mLastClipDescription = null;
      mLastClipData = null;
      mDropHandlers.clear();
      mFlagNextDragLocationEvent = false;
    } else {
      mLastClipDescription = event.getClipDescription();
      mLastClipData = event.getClipData();
      if (action == DragEvent.ACTION_DRAG_LOCATION) {
        mLastDragX = event.getX();
        mLastDragY = event.getY();
      }
    }
    motionEvent.recycle();
    if (mFinishedHandlersCleanupScheduled && mHandlingChangeSemaphore == 0) {
      cleanupFinishedHandlers();
    } else {
      cleanupFinishedDropHandlers();
    }
    if (action == DragEvent.ACTION_DRAG_EXITED) {
      // this condition is met when app is in multi window mode and the pointer has exited the root view
      // we want to keep the DragGestureHandler active if present and cancel the rest
      cleanupAwaitingHandlers();
      cleanupFinishedHandlers();
    }
    return mIsDragging;
  }

  private void scheduleFinishedHandlersCleanup() {
    if (mIsHandlingTouch || mHandlingChangeSemaphore != 0) {
      mFinishedHandlersCleanupScheduled = true;
    } else {
      cleanupFinishedHandlers();
    }
  }

  private void cleanupFinishedHandlers() {
    cleanupFinishedHandlers(sAssertHandler);
  }

  private void cleanupFinishedDropHandlers() {
    cleanupFinishedHandlers(sAssertDropHandler);
  }

  private void cleanupFinishedHandlers(GestureHandlerAssertions assertHandler) {
    boolean shouldCleanEmptyCells = false;
    for (int i = mGestureHandlersCount - 1; i >= 0; i--) {
      GestureHandler handler = mGestureHandlers[i];
      if (isFinished(handler.getState()) && !handler.mIsAwaiting && assertHandler.assertTrue(handler)) {
        mGestureHandlers[i] = null;
        shouldCleanEmptyCells = true;
        resetHandler(handler);
      }
    }
    if (shouldCleanEmptyCells) {
      int out = 0;
      for (int i = 0; i < mGestureHandlersCount; i++) {
        if (mGestureHandlers[i] != null) {
          mGestureHandlers[out++] = mGestureHandlers[i];
        }
      }
      mGestureHandlersCount = out;
    }
    mFinishedHandlersCleanupScheduled = false;
  }

  private void resetHandler(GestureHandler handler) {
    handler.reset();
    handler.mIsActive = false;
    handler.mIsAwaiting = false;
    handler.mActivationIndex = Integer.MAX_VALUE;
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
      handler.mIsAwaiting = false;
    }
  }

  private void cleanupAwaitingHandlers() {
    int out = 0;
    for (int i = 0; i < mAwaitingHandlersCount; i++) {
      if (mAwaitingHandlers[i].mIsAwaiting) {
        mAwaitingHandlers[out++] = mAwaitingHandlers[i];
      }
    }
    mAwaitingHandlersCount = out;
  }

  /*package*/ void onHandlerStateChange(GestureHandler handler, int newState, int prevState) {
    mHandlingChangeSemaphore += 1;
    if (isFinished(newState)) {
      // if there were handlers awaiting completion of this handler, we can trigger active state
      for (int i = 0; i < mAwaitingHandlersCount; i++) {
        GestureHandler otherHandler = mAwaitingHandlers[i];
        if (shouldHandlerWaitForOther(otherHandler, handler)) {
          if (newState == GestureHandler.STATE_END) {
            // gesture has ended, we need to kill the awaiting handler
            otherHandler.cancel();
            otherHandler.mIsAwaiting = false;
          } else {
            // gesture has failed recognition, we may try activating
            tryActivate(otherHandler);
          }
        }
      }
      cleanupAwaitingHandlers();
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
    handler.mActivationIndex = mActivationIndex++;

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
        otherHandler.cancel();
        otherHandler.mIsAwaiting = false;
      }
    }
    cleanupAwaitingHandlers();

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
    System.arraycopy(mGestureHandlers, 0, mPreparedHandlers, 0, handlersCount);
    // We want to deliver events to active handlers first in order of their activation (handlers
    // that activated first will first get event delivered). Otherwise we deliver events in the
    // order in which handlers has been added ("most direct" children goes first). Therefore we rely
    // on Arrays.sort providing a stable sort (as children are registered in order in which they
    // should be tested)
    Arrays.sort(mPreparedHandlers, 0, handlersCount, sHandlersComparator);
    for (int i = 0; i < handlersCount; i++) {
      deliverEventToGestureHandler(mPreparedHandlers[i], event);
    }
  }

  public void deliverEventToGestureHandlers(DragEvent event) {
    int handlersCount = mGestureHandlersCount;
    DragGestureHandler activeDragHandler = null;
    DropGestureHandler activeDropHandler = null;
    DropGestureHandler lastActiveDropHandler = null;
    DropGestureHandler handler;
    DragEvent ev;
    int action = event.getAction();
    System.arraycopy(mGestureHandlers, 0, mPreparedHandlers, 0, handlersCount);
    // we want to deliver the DragEvent to the most direct DropGestureHandlers first, regardless of their active state
    // so that we can determine which DropGestureHandler is the one that should capture the DragEvent
    Arrays.sort(mPreparedHandlers, 0, handlersCount, sDragDropHandlersComparator);
    // set activeDragHandler
    for (int i = 0; i < handlersCount; i++) {
      if (mPreparedHandlers[i] instanceof DragGestureHandler && mPreparedHandlers[i].mIsActive) {
        activeDragHandler = (DragGestureHandler) mPreparedHandlers[i];
        break;
      }
    }
    // prepare DropGestureHandlers
    for (int i = 0; i < handlersCount; i++) {
      if (mPreparedHandlers[i] instanceof DropGestureHandler) {
        handler = (DropGestureHandler) mPreparedHandlers[i];
        handler.setDragHandler(activeDragHandler);
        if (handler.mIsActive) {
          lastActiveDropHandler = handler;
        }
        handler.mIsActiveDropHandler = false;
        if (!mDropHandlers.contains(handler)) {
          mDropHandlers.add(0, handler);
        }
      }
    }
    int count = mDropHandlers.size();
    DropGestureHandler[] handlers = mDropHandlers.toArray(new DropGestureHandler[count]);
    // deliver event to DropGestureHandlers
    // try capturing the event by checking for active handlers
    for (int i = 0; i < count; i++) {
      if (handlers[i] != null) {
        handler = handlers[i];
        deliverEventToGestureHandler(handlers[i], event);
        if (handler.mIsActive || handler.getState() == GestureHandler.STATE_BEGAN) {
          activeDropHandler = handler;
          handler.mIsActiveDropHandler = true;
          if (lastActiveDropHandler != handler) {
            action = DragEvent.ACTION_DRAG_ENTERED;
            if (lastActiveDropHandler != null) {
              // fire exit event
              ev = DragGestureUtils.obtain(DragEvent.ACTION_DRAG_EXITED, event.getX(), event.getY(), event.getResult(),
                      event.getClipData(), event.getClipDescription());
              for (int j = 0; j < count; j++) {
                if (handlers[j] != handler) {
                  assert handlers[j] != null;
                  deliverEventToGestureHandler(handlers[j], ev);
                }
              }
              if (activeDragHandler != null) {
                deliverEventToGestureHandler(activeDragHandler, ev);
                deliverEventToJoiningDragHandlers(ev, activeDragHandler);
              }
              DragGestureUtils.recycle(ev);
            }
          }
          if (activeDragHandler != null) {
            activeDragHandler.setDropHandler(handler);
          }
          break;
        }
      }
    }
    // DROP action can be wrong because of the registered RootView intercepting Drag events.
    // If the origin is foreign then the action is preserved.
    if (action == DragEvent.ACTION_DROP && activeDropHandler == null) {
      action = DragEvent.ACTION_DRAG_LOCATION;
    } else if (activeDropHandler == null && lastActiveDropHandler != null) {
      action = DragEvent.ACTION_DRAG_EXITED;
    }

    ev = DragGestureUtils.obtain(action, event.getX(), event.getY(), event.getResult(),
            event.getClipData(), event.getClipDescription());
    // deliver event to DropGestureHandlers
    for (int i = 0; i < count; i++) {
      handler = handlers[i];
      if (handler != activeDropHandler && handler != null) {
        deliverEventToGestureHandler(handler, ev);
      }
    }
    // deliver event to DragGestureHandler and to other handlers so they can get cancelled
    for (int i = 0; i < handlersCount; i++) {
      if (!(mPreparedHandlers[i] instanceof DropGestureHandler)) {
        deliverEventToGestureHandler(mPreparedHandlers[i], ev);
      }
    }
    // deliver event to joining drag handlers
    deliverEventToJoiningDragHandlers(ev, activeDragHandler);

    // finalize
    // once the event has been delivered we can clear the activeDropHandler if necessary
    // and cancel exited DropGestureHandlers (this is important for DragGestureHandler event data)
    if (activeDragHandler != null && action == DragEvent.ACTION_DRAG_EXITED) {
      activeDragHandler.setDropHandler(null);
    }
    for (int i = count - 1; i >= 0; i--) {
      handler = handlers[i];
      if(handler != null) {
        handler.tryCancel();
      }
    }
    DragGestureUtils.recycle(ev);
  }

  private void deliverEventToJoiningDragHandlers(DragEvent event, DragGestureHandler eventHandler) {
    if (eventHandler != null) {
      @Nullable DragGestureHandler[] joiningDragHandlers = eventHandler.mJoiningDragHandlers;
      if (joiningDragHandlers != null && joiningDragHandlers.length > 0) {
        for (DragGestureHandler dragHandler: eventHandler.mJoiningDragHandlers) {
          if (mNeedsToPrepareJoiningHandlers) {
            prepareHandler(dragHandler, eventHandler.getView());
            dragHandler.moveToState(GestureHandler.STATE_BEGAN);
            dragHandler.moveToState(GestureHandler.STATE_ACTIVE);
          }
          deliverEventToGestureHandler(dragHandler, event);
        }
      }
    }
    mNeedsToPrepareJoiningHandlers = false;
  }

  private void cleanupJoiningDragHandlers(DragEvent event, DragGestureHandler eventHandler) {
    if (eventHandler != null) {
      @Nullable DragGestureHandler[] joiningDragHandlers = eventHandler.mJoiningDragHandlers;
      if (joiningDragHandlers != null && joiningDragHandlers.length > 0) {
        for (DragGestureHandler dragHandler: eventHandler.mJoiningDragHandlers) {
          resetHandler(dragHandler);
        }
      }
    }
    mNeedsToPrepareJoiningHandlers = false;
  }

  private void cancelAll() {
    for (int i = mAwaitingHandlersCount - 1; i >= 0; i--) {
      mAwaitingHandlers[i].cancel();
    }
    // Copy handlers to "prepared handlers" array, because the list of active handlers can change
    // as a result of state updates
    int handlersCount = mGestureHandlersCount;
    System.arraycopy(mGestureHandlers, 0, mPreparedHandlers, 0, handlersCount);
    for (int i = handlersCount - 1; i >= 0; i--) {
      mPreparedHandlers[i].cancel();
    }
  }

  private void deliverEventToGestureHandler(GestureHandler handler, MotionEvent event) {
    if (!isViewAttachedUnderWrapper(handler.getView())) {
      handler.cancel();
      return;
    }
    if (!handler.wantEvents()) {
      return;
    }
    int action = event.getActionMasked();
    if (handler.mIsAwaiting && action == MotionEvent.ACTION_MOVE) {
      return;
    }
    float[] coords = sTempCoords;
    extractCoordsForView(handler.getView(), event, coords);
    float oldX = event.getX();
    float oldY = event.getY();
    // TODO: we may conside scaling events if necessary using MotionEvent.transform
    // for now the events are only offset to the top left corner of the view but if
    // view or any ot the parents is scaled the other pointers position will not reflect
    // their actual place in the view. On the other hand not scaling seems like a better
    // approach when we want to use pointer coordinates to calculate velocity or distance
    // for pinch so I don't know yet if we should transform or not...
    event.setLocation(coords[0], coords[1]);
    handler.handle(event);
    if (handler.mIsActive) {
      handler.dispatchTouchEvent(event);
    }
    event.setLocation(oldX, oldY);
    // if event was of type UP or POINTER_UP we request handler to stop tracking now that
    // the event has been dispatched
    if ((action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) && !(mIsDragging && handler instanceof DragDropGestureHandler)) {
      int pointerId = event.getPointerId(event.getActionIndex());
      handler.stopTrackingPointer(pointerId);
    }
  }

  private void deliverEventToGestureHandler(final GestureHandler handler, DragEvent event) {
    if (!isViewAttachedUnderWrapper(handler.getView())) {
      handler.cancel();
      return;
    }
    if (!handler.wantEvents()) {
      return;
    }
    int action = event.getAction();
    float[] coords = sTempCoords;
    extractCoordsForView(handler.getView(), event, coords);
    DragEvent ev = DragGestureUtils.obtain(event.getAction(), coords[0], coords[1],
            event.getResult(), event.getClipData(), event.getClipDescription());
    handler.handle(ev);
    if (handler.mIsActive) {
      handler.dispatchDragEvent(ev);
    }

    // if event was of type UP or POINTER_UP we request handler to stop tracking now that
    // the event has been dispatched
    if (action == DragEvent.ACTION_DRAG_ENDED) {
      handler.stopTrackingPointer(0);
    }
  }


  /**
   * isViewAttachedUnderWrapper checks whether all of parents for view related to handler
   * view are attached. Since there might be an issue rarely observed when view
   * has been detached and handler's state hasn't been change to canceled, failed or
   * ended yet. Probably it's a result of some race condition and stopping delivering
   * for this handler and changing its state to failed of end appear to be good enough solution.
   */
  private boolean isViewAttachedUnderWrapper(@Nullable View view) {
    if (view == null) {
      return false;
    }
    if (view == mWrapperView) {
      return true;
    }
    @Nullable ViewParent parent = view.getParent();
    while (parent != null && parent != mWrapperView) {
      parent = parent.getParent();
    }
    return parent == mWrapperView;
  }

  private void extractCoordsForView(View view, MotionEvent event, float[] outputCoords) {
    extractCoordsForView(view, new float[]{event.getX(),event.getY()}, outputCoords);
  }

  private void extractCoordsForView(View view, DragEvent event, float[] outputCoords) {
    extractCoordsForView(view, new float[]{event.getX(),event.getY()}, outputCoords);
  }

  private void extractCoordsForView(View view, float[] inputCoords, float[] outputCoords) {
    if (view == mWrapperView) {
      System.arraycopy(inputCoords, 0, outputCoords, 0, inputCoords.length);
      return;
    }
    if (view == null || !(view.getParent() instanceof ViewGroup)) {
      throw new IllegalArgumentException("Parent is null? View is no longer in the tree");
    }
    ViewGroup parent = (ViewGroup) view.getParent();
    extractCoordsForView(parent, inputCoords, outputCoords);
    PointF childPoint = sTempPoint;
    transformTouchPointToViewCoords(outputCoords[0], outputCoords[1], parent, view, childPoint);
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
    handler.mActivationIndex = mActivationIndex++;
  }

  private void recordHandlerIfNotPresent(GestureHandler handler, View view) {
    if (mIsDragging && !(handler instanceof DropGestureHandler)) {
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
    prepareHandler(handler, view);
  }

  private void prepareHandler(GestureHandler handler, View view) {
    handler.mIsActive = false;
    handler.mIsAwaiting = false;
    handler.mActivationIndex = Integer.MAX_VALUE;
    handler.prepare(view, this);
  }

  private boolean recordViewHandlersForPointer(View view, float[] coords, int pointerId) {
    ArrayList<GestureHandler> handlers = mHandlerRegistry.getHandlersForView(view);
    boolean found = false;
    if (handlers != null) {
      for (int i = 0, size = handlers.size(); i < size; i++) {
        GestureHandler handler = handlers.get(i);
        if (handler.isEnabled() && handler.isWithinBounds(view, coords[0], coords[1])) {
          recordHandlerIfNotPresent(handler, view);
          handler.startTrackingPointer(pointerId);
          found = true;
        }
      }
    }
    return found;
  }

  private void extractGestureHandlers(MotionEvent event) {
    int actionIndex = event.getActionIndex();
    int pointerId = event.getPointerId(actionIndex);
    sTempCoords[0] = event.getX(actionIndex);
    sTempCoords[1] = event.getY(actionIndex);
    traverseWithPointerEvents(mWrapperView, sTempCoords, pointerId);
    extractGestureHandlers(mWrapperView, sTempCoords, pointerId);
  }

  private void extractGestureHandlers(DragEvent event) {
    sTempCoords[0] = event.getX();
    sTempCoords[1] = event.getY();
    traverseWithPointerEvents(mWrapperView, sTempCoords, 0);
    extractGestureHandlers(mWrapperView, sTempCoords, 0);
  }

  private boolean extractGestureHandlers(ViewGroup viewGroup, float[] coords, int pointerId) {
    int childrenCount = viewGroup.getChildCount();
    for (int i = childrenCount - 1; i >= 0; i--) {
      View child = mViewConfigHelper.getChildInDrawingOrderAtIndex(viewGroup, i);
      if (canReceiveEvents(child)) {
        PointF childPoint = sTempPoint;
        transformTouchPointToViewCoords(coords[0], coords[1], viewGroup, child, childPoint);
        float restoreX = coords[0];
        float restoreY = coords[1];
        coords[0] = childPoint.x;
        coords[1] = childPoint.y;
        boolean found = false;
        if (!isClipping(child) || isTransformedTouchPointInView(coords[0], coords[1], child)) {
          // we only consider the view if touch is inside the view bounds or if the view's children
          // can render outside of the view bounds (overflow visible)
          found = traverseWithPointerEvents(child, coords, pointerId);
        }
        coords[0] = restoreX;
        coords[1] = restoreY;
        if (found) {
          return true;
        }
      }
    }
    return false;
  }

  private static boolean shouldHandlerlessViewBecomeTouchTarget(View view, float coords[]) {
    // The following code is to match the iOS behavior where transparent parts of the views can
    // pass touch events through them allowing sibling nodes to handle them.

    // TODO: this is not an ideal solution as we only consider ViewGroups that has no background set
    // TODO: ideally we should determine the pixel color under the given coordinates and return
    // false if the color is transparent
    boolean isLeafOrTransparent = !(view instanceof ViewGroup) || view.getBackground() != null;
    return isLeafOrTransparent && isTransformedTouchPointInView(coords[0], coords[1], view);
  }

  private boolean traverseWithPointerEvents(View view, float coords[], int pointerId) {
    PointerEventsConfig pointerEvents = mViewConfigHelper.getPointerEventsConfigForView(view);
    if (pointerEvents == PointerEventsConfig.NONE) {
      // This view and its children can't be the target
      return false;
    } else if (pointerEvents == PointerEventsConfig.BOX_ONLY) {
      // This view is the target, its children don't matter
      return recordViewHandlersForPointer(view, coords, pointerId)
              || shouldHandlerlessViewBecomeTouchTarget(view, coords);
    } else if (pointerEvents == PointerEventsConfig.BOX_NONE) {
      // This view can't be the target, but its children might
      if (view instanceof ViewGroup) {
        return extractGestureHandlers((ViewGroup) view, coords, pointerId);
      }
      return false;
    } else if (pointerEvents == PointerEventsConfig.AUTO) {
      // Either this view or one of its children is the target
      boolean found = false;
      if (view instanceof ViewGroup) {
        found = extractGestureHandlers((ViewGroup) view, coords, pointerId);
      }
      return recordViewHandlersForPointer(view, coords, pointerId)
              || found || shouldHandlerlessViewBecomeTouchTarget(view, coords);
    } else {
      throw new IllegalArgumentException(
              "Unknown pointer event type: " + pointerEvents.toString());
    }
  }

  private boolean canReceiveEvents(View view) {
    return view.getVisibility() == View.VISIBLE && view.getAlpha() >= mMinAlphaForTraversal;
  }

  static void transformTouchPointToViewCoords(
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
  }

  private boolean isClipping(View view) {
    // if view is not a view group it is clipping, otherwise we check for `getClipChildren` flag to
    // be turned on and also confirm with the ViewConfigHelper implementation
    return !(view instanceof ViewGroup) || mViewConfigHelper.isViewClippingChildren((ViewGroup) view);
  }

  private static boolean isTransformedTouchPointInView(float x, float y, View child) {
    return x >= 0 && x <= child.getWidth() && y >= 0 && y < child.getHeight();
  }

  private static boolean shouldHandlerWaitForOther(GestureHandler handler, GestureHandler other) {
    return handler != other && (handler.shouldWaitForHandlerFailure(other)
            || other.shouldRequireToWaitForFailure(handler));
  }

  private static boolean canRunSimultaneously(GestureHandler a, GestureHandler b) {
    return a == b || a.shouldRecognizeSimultaneously(b) || b.shouldRecognizeSimultaneously(a);
  }

  private static boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler other) {

    if (!handler.hasCommonPointers(other)) {
      // if two handlers share no common pointer one can never trigger cancel for the other
      return false;
    }
    if (canRunSimultaneously(handler, other)) {
      // if handlers are allowed to run simultaneously, when first activates second can still remain
      // in began state
      return false;
    }
    if (handler != other &&
            (handler.mIsAwaiting || handler.getState() == GestureHandler.STATE_ACTIVE)) {
      // in every other case as long as the handler is about to be activated or already in active
      // state, we delegate the decision to the implementation of GestureHandler#shouldBeCancelledBy
      return handler.shouldBeCancelledBy(other);
    }
    return true;
  }

  static boolean isFinished(int state) {
    return state == GestureHandler.STATE_CANCELLED || state == GestureHandler.STATE_FAILED
            || state == GestureHandler.STATE_END;
  }
}
