package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.graphics.Canvas;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_EVENT_NAME;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DRAG_TARGET;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_TYPE;

public class DragGestureHandler<T> extends DragDropGestureHandler<T, DragGestureHandler<T>> {

    private ArrayList<DropGestureHandler<T>> mDropHandlers = new ArrayList<>();
    private @Nullable DropGestureHandler<T> mDropHandler = null;
    private @Nullable DropGestureHandler<T> mLastDropHandler = null;
    private int mDragAction;
    private boolean mIsDragging = false;

    public DragGestureHandler(Context context) {
        super(context);
    }

    public DropGestureHandler<T> getDropHandler() {
        return mDropHandler;
    }

    public DropGestureHandler<T> getLastDropHandler() {
        return mLastDropHandler;
    }

    public ArrayList<DropGestureHandler<T>> getDropHandlers() {
        return mDropHandlers;
    }

    boolean addDropHandler(@NonNull DropGestureHandler<T> handler) {
        if (!mDropHandlers.contains(handler)) {
            mDropHandlers.add(0, handler);
            return true;
        }
        return false;
    }

    void setDropHandler(@Nullable DropGestureHandler<T> handler) {
        if (handler == mDropHandler) {
            return;
        }
        mLastDropHandler = mDropHandler;
        mDropHandler = handler;
        if (handler != null) {
            addDropHandler(handler);
        }
    }

    @Override
    public int getDragTarget() {
        return getView() != null ? getView().getId() : View.NO_ID;
    }

    @Override
    public int getDropTarget() {
        DropGestureHandler handler = mDragAction == DragEvent.ACTION_DRAG_EXITED ? mLastDropHandler : mDropHandler;
        return handler != null && handler.getView() != null ? handler.getView().getId() : View.NO_ID;
    }

    @Override
    public int getDragAction() {
        return mDragAction;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DropGestureHandler;
    }

    private ClipData createClipData() {
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DRAG_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPE, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, getView().getContext().getPackageName());
        if (mDataResolver != null) {
            intent.putExtra(KEY_DATA, mDataResolver.toString());
        }
        StringBuilder str = new StringBuilder(DRAG_MIME_TYPE + ":");
        for (int t: mDTypes) {
            str.append(t);
            str.append(",");
        }

        return new ClipData(
                DRAG_EVENT_NAME,
                new String[] {
                        ClipDescription.MIMETYPE_TEXT_INTENT,
                        str.toString()
                },
                new ClipData.Item(intent)
        );
    }

    private void startDragging() {
        mOrchestrator.mIsDragging = true;
        mIsDragging = true;
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(getView());
        //View.DragShadowBuilder shadowBuilder = new SyncedDragShadowBuilder(getView());
        int flags = DragGestureUtils.getFlags();
        getView().startDrag(data, shadowBuilder, null, flags);
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        super.onHandle(event);
        if (getState() == STATE_ACTIVE && !mOrchestrator.mIsDragging) {
            startDragging();
        }
    }

    @Override
    protected void onHandle(DragEvent event) {
        mDragAction = event.getAction();
        super.onHandle(event);
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), event.getResult(),
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mIsDragging = false;
        mDropHandlers.clear();
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        //// TODO: 15/02/2020 reset mDropHandler mLastDropHandler ?
        mDropHandler = null;
        mLastDropHandler = null;
    }

    private static class SyncedDragShadowBuilder extends View.DragShadowBuilder {
        private View mView;
        SyncedDragShadowBuilder(View view) {
            mView = view;
        }

        @Override
        public void onDrawShadow(Canvas canvas) {
            mView.draw(canvas);
        }
    }
}
