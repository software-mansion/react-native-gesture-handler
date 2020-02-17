package com.swmansion.gesturehandler;

import android.content.Context;
import android.util.Log;
import android.view.DragEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends DragDropGestureHandler<T, DropGestureHandler<T>> {

    private @Nullable DragGestureHandler<T> mDragHandler;
    private int mDragAction;
    private boolean mResult;
    private boolean mPointerState = false;
    private boolean mBlockUntilNextDragExit = false;

    public DropGestureHandler(Context context) {
        super(context);
    }

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

    public @Nullable DragGestureHandler<T> getDragHandler() {
        return mDragHandler;
    }

    public void setDragHandler(@Nullable DragGestureHandler<T> dragHandler) {
        mDragHandler = dragHandler;
    }

    public int getDropActivationIndex() {
        return mDragHandler != null ? mDragHandler.getDropHandlers().indexOf(this) : -1;
    }

    void block() {
        if (getState() == STATE_BEGAN || getState() == STATE_ACTIVE) {
            cancel();
            mBlockUntilNextDragExit = true;
        }
    }

    void release() {
        if (mBlockUntilNextDragExit) {
            mBlockUntilNextDragExit = false;
        }
    }

    @Override
    public boolean wantEvents() {
        return super.wantEvents() && !mBlockUntilNextDragExit;
    }

    /**
     * @param event receives an event with {@link DragGestureHandler} {@link DragEvent} action
     */
    @Override
    protected void onHandle(DragEvent event) {
        int action = event.getAction();
        boolean pointerIsInside = isWithinBounds();
        boolean stateChange = pointerIsInside != mPointerState || (action == DragEvent.ACTION_DRAG_EXITED && mPointerState);
        mDragAction = action;
        mPointerState = pointerIsInside;
        boolean progressEvent = action != DragEvent.ACTION_DRAG_STARTED && action != DragEvent.ACTION_DRAG_ENDED
                && action != DragEvent.ACTION_DRAG_EXITED;
/*
        if (mBlockUntilNextDragExit && action == DragEvent.ACTION_DRAG_ENTERED) {
            stateChange = true;
            mBlockUntilNextDragExit = false;
        }
        if (mBlockUntilNextDragExit && action == DragEvent.ACTION_DRAG_LOCATION) {
            return;
        }

 */
        if (progressEvent) {
            if (stateChange && pointerIsInside) {
                mDragAction = DragEvent.ACTION_DRAG_ENTERED;
            } else if (stateChange) {
                mDragAction = DragEvent.ACTION_DRAG_EXITED;
            } else if (pointerIsInside && action != DragEvent.ACTION_DROP) {
                mDragAction = DragEvent.ACTION_DRAG_LOCATION;
            }
        }

        mResult = action == DragEvent.ACTION_DROP && pointerIsInside;
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.onHandle(ev);
        if ((!pointerIsInside && mIsActive && progressEvent) || action == DragEvent.ACTION_DRAG_EXITED) {
            cancel();
        }
        DragGestureUtils.recycle(ev);
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
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
