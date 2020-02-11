package com.swmansion.gesturehandler.example;

import android.content.Context;
import android.util.AttributeSet;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.widget.FrameLayout;

import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;

public class GHRootView extends FrameLayout {

    private GestureHandlerOrchestrator mOrchestrator;

    private boolean mShouldIntercept = false;
    private boolean mPassingTouch = false;

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
        registry.registerHandlerForView(this, new RootViewGestureHandler());
        //registry.registerHandlerForView(this, new DropGestureHandler());
    }

    @Override
    public boolean dispatchDragEvent(DragEvent event) {
        return mOrchestrator.onDragEvent(event);
    }

    @Override
    public boolean onDragEvent(DragEvent event) {
        return mOrchestrator.onDragEvent(event);
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        return mOrchestrator.onTouchEvent(ev);
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
        // if `requestDisallow` has been called as a result of a normal gesture handling process or
        // as a result of one of the gesture handlers activating
        mPassingTouch = true;
        mOrchestrator.onTouchEvent(ev);
        mPassingTouch = false;

        return mShouldIntercept;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return mOrchestrator.onTouchEvent(event);
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
        protected void onCancel() {
            mShouldIntercept = true;
/*
            long time = SystemClock.uptimeMillis();
            MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
            event.setAction(MotionEvent.ACTION_CANCEL);
            mOrchestrator.onTouchEvent(event);
*/
        }

    }
}
