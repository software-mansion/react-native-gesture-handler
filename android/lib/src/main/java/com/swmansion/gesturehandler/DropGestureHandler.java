package com.swmansion.gesturehandler;

import android.util.Log;
import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends DragDropGestureHandler<T> {

    private @Nullable DragGestureHandler<T> mDragHandler;
    private int mDragAction;
    private boolean mPointerState = false;

    public DropGestureHandler() {
        super();
        setShouldCancelWhenOutside(false);
    }

    public void setDragHandler(@Nullable DragGestureHandler<T> dragHandler) {
        mDragHandler = dragHandler;
    }

    @Override
    protected void onHandle(DragEvent event) {
        int action = event.getAction();
        boolean pointerIsInside = isWithinBounds();
        boolean stateChange = pointerIsInside != mPointerState;

        mDragAction = action;
        if (action != DragEvent.ACTION_DRAG_STARTED && action != DragEvent.ACTION_DRAG_ENDED) {
            if (stateChange && pointerIsInside) {
                mDragAction = DragEvent.ACTION_DRAG_ENTERED;
            } else if (stateChange) {
                mDragAction = DragEvent.ACTION_DRAG_EXITED;
            } else if (pointerIsInside && action != DragEvent.ACTION_DROP) {
                mDragAction = DragEvent.ACTION_DRAG_LOCATION;
            }
        }

        mPointerState = pointerIsInside;

        DragEvent ev = DragGestureUtils.obtain(event, mDragAction, getX(), getY(), action == DragEvent.ACTION_DROP && pointerIsInside);
        super.onHandle(ev);
        Log.d("Drop", "onHandle: " + stateToString(getState()) + "  " + event);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDragHandler = null;
        mPointerState = false;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || (mDragHandler != null && handler == mDragHandler);
    }

    @Override
    public String toString() {
        return "DropGestureHandler:" + isWithinBounds() +  getView();
    }
}
