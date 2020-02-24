package com.swmansion.gesturehandler.example;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.widget.FrameLayout;

import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;

public class GHRootView extends FrameLayout {

    private GestureHandlerOrchestrator mOrchestrator;

    private boolean mShouldIntercept = false;
    private boolean mPassingTouch = false;
    private RootViewGestureHandler mRootViewGestureHandler;

    public GHRootView(Context context) {
        super(context);
    }

    public GHRootView(Context context, AttributeSet attrs) {
        super(context, attrs, 0);
    }

    public GHRootView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr, 0);
    }

    public GHRootView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public void init(GestureHandlerOrchestrator orchestrator, GestureHandlerRegistryImpl registry) {
        mOrchestrator = orchestrator;
        mRootViewGestureHandler = new RootViewGestureHandler();
        registry.registerHandlerForView(this, mRootViewGestureHandler);
        setOnDragListener(new OnDragListener() {
            @Override
            public boolean onDrag(View v, DragEvent event) {
                mPassingTouch = true;
                mOrchestrator.onDragEvent(event);
                mPassingTouch = false;
                return true;
            }
        });
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        return mOrchestrator.onTouchEvent(ev) || super.onInterceptTouchEvent(ev);
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
        // if `requestDisallow` has been called as a result of a normal gesture handling process or
        // as a result of one of the gesture handlers activating
        mPassingTouch = true;
        mOrchestrator.onTouchEvent(ev);
        mPassingTouch = false;

        return mShouldIntercept || super.dispatchTouchEvent(ev);
    }

    @Override
    public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
        // If this method gets called it means that some native view is attempting to grab lock for
        // touch event delivery. In that case we cancel all gesture recognizers
        if (mOrchestrator != null && !mPassingTouch) {
            // if we are in the process of delivering touch events via GH orchestrator, we don't want to
            // treat it as a native gesture capturing the lock
            mRootViewGestureHandler.tryCancelAllHandlers();
        }
        super.requestDisallowInterceptTouchEvent(disallowIntercept);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return mOrchestrator.onTouchEvent(event) || super.onTouchEvent(event);
    }

    class RootViewGestureHandler extends GestureHandler {
        @Override
        protected void onHandle(MotionEvent event) {
            int currentState = getState();
            if (currentState == STATE_UNDETERMINED) {
                begin();
                mShouldIntercept = false;
            }
            if (event.getActionMasked() == MotionEvent.ACTION_UP) {
                end();
            }
        }

        @Override
        protected void onHandle(DragEvent event) {
            if (event.getAction() == DragEvent.ACTION_DRAG_ENDED) {
                end();
            }
        }

        @Override
        protected void onCancel() {
            mShouldIntercept = true;
        }

        private void tryCancelAllHandlers() {
            // In order to cancel handlers we activate handler that is hooked to the root view
            if (getState() == GestureHandler.STATE_BEGAN) {
                // Try activate main JS handler
                activate();
                end();
            }
        }
    }
}
