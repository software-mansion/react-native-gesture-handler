package com.swmansion.gesturehandler;

import android.util.Log;
import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends DragDropGestureHandler<T> {

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

    public void setDragHandler(@Nullable DragGestureHandler<T> dragHandler) {
        mDragHandler = dragHandler;
    }

    public boolean isActive() {
        return mIsActiveDropHandler;
    }

/*
    private void handleExtraData(DragEvent source, DragEvent dest) {
        if (source.getClipData() == null || getView() == null) {
            return;
        }
        Intent dataIntent = source.getClipData().getItemAt(0).getIntent();
        int tag = getView().getId();
        int action = source.getAction();
        if (action == DragEvent.ACTION_DRAG_ENTERED && tag != dataIntent.getIntExtra(KEY_DRAG_TARGET, View.NO_ID)) {
            dataIntent.putExtra(KEY_DROP_TARGET, tag);
            mData = mDataResolver.fromString(dataIntent.getStringExtra(KEY_DATA));
        } else if (action == DragEvent.ACTION_DRAG_EXITED || action == DragEvent.ACTION_DRAG_ENDED) {
            dataIntent.removeExtra(KEY_DROP_TARGET);
        }
        dest.getClipData().p
    }

 */
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
