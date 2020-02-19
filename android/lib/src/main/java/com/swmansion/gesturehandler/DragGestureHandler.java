package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Point;
import android.os.Build;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;

import java.lang.ref.WeakReference;
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
    private @Nullable View mShadowBuilderView;
    private boolean mShadowEnabled = true;
    private float mOriginalElevation;

    public DragGestureHandler(Context context) {
        super(context);
    }

    public DragGestureHandler<T> setShadowBuilderView(@Nullable View view) {
        mShadowBuilderView = view;
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

    public ArrayList<DropGestureHandler<T>> getDropHandlers() {
        return mDropHandlers;
    }

    @Override
    public T getData() {
        return mDataResolver != null ? mDataResolver.data() : null;
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
        return mDropHandler != null && mDropHandler.getView() != null ? mDropHandler.getView().getId() : View.NO_ID;
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
                        str.toString()
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
            //View.DragShadowBuilder = new SyncedDragShadowBuilder(getView());
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
        mDropHandlers.clear();
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mDropHandler = null;
        mLastDropHandler = null;
    }

    private static class SyncedDragShadowBuilder extends View.DragShadowBuilder {
        private WeakReference<View> mView;
        SyncedDragShadowBuilder(View view) {
            //super(view);
            mView = new WeakReference<>(view);
        }

        @Override
        public void onDrawShadow(Canvas canvas) {
            final View view = mView.get();
            if (view != null) {
                view.draw(canvas);
            }
            Paint paint = new Paint();
            paint.setColor(Color.rgb((int)(Math.random()*255),(int)(Math.random()*255),(int)(Math.random()*255)));
            canvas.drawRect(0,0, 50, 50, paint);
        }

        @Override
        public void onProvideShadowMetrics(Point shadowSize, Point shadowTouchPoint) {
            final View view = mView.get();
            shadowSize.set(view.getWidth(), view.getHeight());
            shadowTouchPoint.set(shadowSize.x / 2, shadowSize.y / 2);
        }
    }
}
