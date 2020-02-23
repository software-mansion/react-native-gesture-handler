package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_EVENT_NAME;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DRAG_TARGET;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_TYPES;

public class DragGestureHandler<T> extends DragDropGestureHandler<T, DragGestureHandler<T>> {

    private @Nullable DropGestureHandler<T> mDropHandler = null;
    private @Nullable DropGestureHandler<T> mLastDropHandler = null;
    private int mDragAction;
    private boolean mIsDragging = false;
    private @Nullable View mShadowBuilderView;
    private boolean mShadowEnabled = true;
    private float mOriginalElevation;
    private String mSourceAppID;

    public DragGestureHandler(Context context) {
        super(context);
    }

    public DragGestureHandler<T> setShadowBuilderView(@Nullable View view) {
        mShadowBuilderView = view;
        if (mIsDragging && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(
                    mShadowBuilderView != null ?
                            mShadowBuilderView :
                            getView());
            getView().updateDragShadow(shadowBuilder);
        }
        return this;
    }

    public DragGestureHandler<T> setEnableShadow(boolean enable) {
        mShadowEnabled = enable;
        return this;
    }

    public DropGestureHandler<T> getDropHandler() {
        return mDropHandler;
    }

    public DropGestureHandler<T> getLastDropHandler() {
        return mLastDropHandler;
    }

    @Override
    public T getData() {
        return mDataResolver != null ? mDataResolver.data() : null;
    }

    void setDropHandler(@Nullable DropGestureHandler<T> handler) {
        if (handler == mDropHandler) {
            return;
        }
        mLastDropHandler = mDropHandler;
        mDropHandler = handler;
    }

    @Override
    public int getDragTarget() {
        return getView() != null ? getView().getId() : View.NO_ID;
    }

    @Override
    public int getDropTarget() {
        if (mDropHandler != null && mDropHandler.getView() != null) {
            return mDropHandler.getView().getId();
        } else if (mSourceAppID != null && !mSourceAppID.equals(getContext().getPackageName())) {
            return 0;
        } else {
            return View.NO_ID;
        }
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
        String packageName = getView().getContext().getPackageName();
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DRAG_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPES, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, packageName);
        if (mDataResolver != null) {
            intent.putExtra(KEY_DATA, mDataResolver.stringify());
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
                        str.toString(),
                        String.format("%s:%s", KEY_SOURCE_APP, packageName)
                },
                new ClipData.Item(intent)
        );
    }

    private void setElevation() {
        View view = getView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mOriginalElevation = view.getElevation();
            view.setElevation(Float.MAX_VALUE);
        } else {
            mOriginalElevation = ViewCompat.getElevation(view);
            ViewCompat.setElevation(view, Integer.MAX_VALUE);
        }
    }

    private void resetElevation() {
        View view = getView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            view.setElevation(mOriginalElevation);
        } else {
            ViewCompat.setElevation(view, mOriginalElevation);
        }
    }

    private void startDragging() {
        mOrchestrator.mIsDragging = true;
        mIsDragging = true;
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder;
        if (mShadowEnabled) {
            shadowBuilder = new View.DragShadowBuilder(
                    mShadowBuilderView != null ?
                            mShadowBuilderView :
                            getView());
        } else {
            shadowBuilder = new View.DragShadowBuilder(null);
            setElevation();
        }
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
        if (mDragAction == DragEvent.ACTION_DRAG_STARTED) {
            mSourceAppID = DragGestureUtils.getEventPackageName(event);
        }
        super.onHandle(event);
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), event.getResult(),
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
    }

    @Override
    protected void onStateChange(int newState, int previousState) {
        if (GestureHandlerOrchestrator.isFinished(newState) && !mShadowEnabled) {
           resetElevation();
        }
        super.onStateChange(newState, previousState);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mIsDragging = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mDropHandler = null;
        mLastDropHandler = null;
        mSourceAppID = null;
    }

}
