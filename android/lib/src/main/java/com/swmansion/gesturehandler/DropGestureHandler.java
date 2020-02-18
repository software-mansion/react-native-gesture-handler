package com.swmansion.gesturehandler;

import android.content.Context;
import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends DragDropGestureHandler<T, DropGestureHandler<T>> {

    private @Nullable DragGestureHandler<T> mDragHandler;
    private int mDragAction;
    private boolean mResult;
    private boolean mPointerState = false;
    private boolean mShouldCancelNext = false;
    private boolean mAwaitingCancellation = false;

    private static boolean isProgressEvent(DragEvent event) {
        int action = event.getAction();
        return action != DragEvent.ACTION_DRAG_STARTED && action != DragEvent.ACTION_DRAG_ENDED
                && action != DragEvent.ACTION_DRAG_EXITED;
    }

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

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DragGestureHandler;
    }

    @Override
    protected boolean shouldActivate() {
        return super.shouldActivate() && mDragHandler != null && mDragHandler.getDropHandler() == this;
    }

    void tryCancel() {
        if (mShouldCancelNext) {
            cancel();
        }
    }

    /**
     * @param event receives an event with {@link DragGestureHandler} {@link DragEvent} action
     */
    @Override
    protected void onHandle(DragEvent event) {
        if (!mOrchestrator.mIsDragging) {
            fail();
            return;
        } else if (mShouldCancelNext) {
            return;
        }

        int action = event.getAction();
        boolean pointerIsInside = isWithinBounds();

        if (isProgressEvent(event)) {
            if (action == DragEvent.ACTION_DROP) {
                if (mIsActive) {
                    mDragAction = DragEvent.ACTION_DROP;
                    mResult = true;
                } else {
                    mDragAction = DragEvent.ACTION_DRAG_ENDED;
                }
            } else if (pointerIsInside && !mPointerState) {
                mDragAction = DragEvent.ACTION_DRAG_ENTERED;
            } else if (!pointerIsInside) {
                mDragAction = DragEvent.ACTION_DRAG_EXITED;
            } else {
                mDragAction = DragEvent.ACTION_DRAG_LOCATION;
            }
        } else {
            mDragAction = action;
        }

        mPointerState = pointerIsInside;

        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.onHandle(ev);
        DragGestureUtils.recycle(ev);

        if (mDragAction == DragEvent.ACTION_DRAG_EXITED) {
            mShouldCancelNext = true;
        }
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
        DragGestureUtils.recycle(ev);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDragHandler = null;
        mPointerState = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mResult = false;
        mShouldCancelNext = false;
        mAwaitingCancellation = false;
    }
}
