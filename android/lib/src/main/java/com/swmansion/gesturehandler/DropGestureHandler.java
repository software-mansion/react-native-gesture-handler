package com.swmansion.gesturehandler;

import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends DragDropGestureHandler<T, DropGestureHandler<T>> {

    private @Nullable DragGestureHandler<T> mDragHandler;
    private int mDragAction;
    private boolean mResult;
    private boolean mPointerState = false;
    private boolean mIsActiveDropHandler;

    @Override
    public int getDragTarget() {
        return mDragHandler != null && mDragHandler.getView() != null ? mDragHandler.getView().getId() : View.NO_ID;
    }

    @Override
    public int getDropTarget() {
        return getView() != null ? getView().getId() : View.NO_ID;
    }

    @Override
    public int getDragAction() {
        return mDragAction;
    }

    public void setDragHandler(@Nullable DragGestureHandler<T> dragHandler) {
        mDragHandler = dragHandler;
    }

    public boolean isActiveDropZone() {
        return mIsActiveDropHandler;
    }

    @Override
    protected void onHandle(DragEvent event) {
        int action = event.getAction();
        boolean pointerIsInside = isWithinBounds();
        boolean stateChange = pointerIsInside != mPointerState;

        mDragAction = action;
        mIsActiveDropHandler = true;
        if (action != DragEvent.ACTION_DRAG_STARTED && action != DragEvent.ACTION_DRAG_ENDED) {
            if (stateChange && pointerIsInside) {
                mDragAction = DragEvent.ACTION_DRAG_ENTERED;
            } else if (stateChange) {
                mDragAction = DragEvent.ACTION_DRAG_EXITED;
            } else if (pointerIsInside && action != DragEvent.ACTION_DROP) {
                mDragAction = DragEvent.ACTION_DRAG_LOCATION;
            } else if (!pointerIsInside) {
                mIsActiveDropHandler = false;
            }
        }
        mPointerState = pointerIsInside;

        mResult = action == DragEvent.ACTION_DROP && pointerIsInside;

        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.onHandle(ev);
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        if (mIsActiveDropHandler) {
            DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                    event.getClipData(), event.getClipDescription());
            super.dispatchDragEvent(ev);
        }
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDragHandler = null;
        mPointerState = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mResult = false;
    }
}
