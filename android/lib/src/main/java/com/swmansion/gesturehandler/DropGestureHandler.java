package com.swmansion.gesturehandler;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.view.DragAndDropPermissionsCompat;

import com.swmansion.gesturehandler.DragGestureUtils.DataResolver;

import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;

public class DropGestureHandler<T, S> extends DragDropGestureHandler<DataResolver<T, S>, DropGestureHandler<T, S>> {

    private @Nullable DragGestureHandler<T, S> mDragHandler;
    private int mDragAction;
    private boolean mResult;
    private String mLastEventData;
    private String mLastSourceAppID;

    public DropGestureHandler(Context context) {
        super(context);
    }

    public S getData() {
        if (mLastEventData != null && mDataResolver != null) {
            return mDataResolver.parse(mLastEventData);
        } else {
            return null;
        }
    }

    @Override
    public int getDragTarget() {
        return mDragHandler != null && mDragHandler.getView() != null ?
                mDragHandler.getView().getId() : 
                View.NO_ID;
    }

    @Nullable
    @Override
    public int[] getDragTargets() {
        return mDragHandler != null ? mDragHandler.getDragTargets() : null;
    }

    @Override
    public int getDropTarget() {
        return getView() != null ? getView().getId() : View.NO_ID;
    }

    @Override
    public int getDragAction() {
        return mDragAction;
    }

    public @Nullable DragGestureHandler<T, S> getDragHandler() {
        return mDragHandler;
    }

    public @Nullable String getLastSourceAppID() {
        return mLastSourceAppID;
    }

    void setDragHandler(@Nullable DragGestureHandler<T, S> dragHandler) {
        mDragHandler = dragHandler;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DragGestureHandler;
    }

    @Override
    protected boolean shouldActivate() {
        // activate only when is the top most drop handler on screen
        return mDropActivationIndex == 0 && super.shouldActivate();
    }

    /**
     * @param event receives an event with {@link DragGestureHandler} {@link DragEvent} action
     */
    @Override
    protected void onHandle(DragEvent event) {
        if (!mOrchestrator.mIsDragging || !shouldHandleEvent(event)) {
            fail();
            return;
        }
        int action = event.getAction();
        if (action == DragEvent.ACTION_DROP) {
            if (getState() == STATE_ACTIVE) {
                mDragAction = DragEvent.ACTION_DROP;
                mResult = true;
                DragAndDropPermissionsCompat dropPermissions = null;
                if (mDataResolver != null && mDataResolver.getActivity() != null) {
                    dropPermissions = ActivityCompat
                            .requestDragAndDropPermissions(mDataResolver.getActivity(), event);
                }
                Intent intent = event.getClipData()
                        .getItemAt(0)
                        .getIntent();
                mLastEventData = intent.getStringExtra(KEY_DATA);
                mLastSourceAppID = intent.getStringExtra(KEY_SOURCE_APP);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && dropPermissions != null) {
                    dropPermissions.release();
                }
            } else {
                mDragAction = DragEvent.ACTION_DRAG_ENDED;
            }
        } else {
            mDragAction = action;
        }

        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.onHandle(ev);
        DragGestureUtils.recycle(ev);

        if (mDragAction == DragEvent.ACTION_DRAG_EXITED) {
            cancel();
        } else if (!isWithinBounds()) {
            int state = getState();
            if (state == STATE_ACTIVE) {
                cancel();
            } else if (state == STATE_BEGAN) {
                fail();
            }
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
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mResult = false;
        mLastEventData = null;
        mLastSourceAppID = null;
    }

}
