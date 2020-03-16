package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.graphics.Point;
import android.os.Build;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.annotation.UiThread;
import androidx.core.view.ViewCompat;

import java.util.ArrayList;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_EVENT_NAME;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_COPY;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_MOVE;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DRAG_TARGET;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_TYPES;

public class DragGestureHandler<T> extends DragDropGestureHandler<T, DragGestureHandler<T>>
        implements ViewTreeObserver.OnDrawListener, ViewTreeObserver.OnGlobalLayoutListener {

    private @Nullable DropGestureHandler<T> mDropHandler = null;
    private @Nullable DropGestureHandler<T> mLastDropHandler = null;
    private int mDragAction;
    private boolean mIsDragging = false;
    private @Nullable View mShadowBuilderView;
    private boolean mShadowEnabled = true;
    private int mDragMode = DRAG_MODE_MOVE;
    private boolean mResult = false;
    private float mOriginalElevation;
    private String mSourceAppID;
    private final ArrayList<View> mViewsAwaitingCleanup = new ArrayList<>();
    private View.DragShadowBuilder mInvisibleShadow = new View.DragShadowBuilder() {
        @Override
        public void onProvideShadowMetrics(Point outShadowSize, Point outShadowTouchPoint) {
            View v = DragGestureHandler.this.getView();
            outShadowSize.set(v.getWidth(), v.getHeight());
            outShadowTouchPoint.set(outShadowSize.x / 2, outShadowSize.y / 2);
        }
    };
    private boolean mIsInvisible = false;
    private boolean mLastShadowVisible;
    private boolean mDidWarn = false;
    private static final String DEBUG_TAG = "GestureHandler";
    public String getDebugTag() {
        return DEBUG_TAG;
    }

    public DragGestureHandler(Context context) {
        super(context);
    }

    public DragGestureHandler<T> setShadowBuilderView(@Nullable final View view) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && view != mShadowBuilderView) {
            if (mShadowBuilderView != null) {
                mViewsAwaitingCleanup.add(mShadowBuilderView);
            }
            if (view != null) {
                ViewTreeObserver treeObserver = view.getViewTreeObserver();
                treeObserver.addOnDrawListener(this);
                treeObserver.addOnGlobalLayoutListener(this);
            }
            updateDragShadow();
        }
        mShadowBuilderView = view;
        return this;
    }

    public DragGestureHandler<T> setEnableShadow(boolean enable) {
        mShadowEnabled = enable;
        if (mIsDragging && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            updateDragShadow();
        }
        return this;
    }

    public DragGestureHandler<T> setDragMode(int mode) {
        if (mIsDragging && mShadowEnabled) {
            if (mode == DRAG_MODE_MOVE) {
                setViewVisibility(false);
            } else if (mode == DRAG_MODE_COPY) {
                setViewVisibility(true);
            }
        }
        mDragMode = mode;
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

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public void onDraw() {
        if (mShadowEnabled) {
            updateDragShadow();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public void onGlobalLayout() {
        ViewTreeObserver treeObserver;
        for (View view: mViewsAwaitingCleanup) {
            treeObserver = view.getViewTreeObserver();
            treeObserver.removeOnDrawListener(this);
            treeObserver.removeOnGlobalLayoutListener(this);
        }
        mViewsAwaitingCleanup.clear();
    }

    private void runOnUiThread(Runnable runnable) {
        mDataResolver.getActivity().runOnUiThread(runnable);
    }

    private void setElevation() {
        final View view = getView();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mOriginalElevation = view.getElevation();
                    view.setElevation(Float.MAX_VALUE);
                } else {
                    mOriginalElevation = ViewCompat.getElevation(view);
                    ViewCompat.setElevation(view, Integer.MAX_VALUE);
                }
            }
        });
    }

    private void resetElevation() {
        final View view = getView();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    view.setElevation(mOriginalElevation);
                } else {
                    ViewCompat.setElevation(view, mOriginalElevation);
                }
            }
        });
    }

    @UiThread
    public void setVisibility(View view, boolean visible) {
        view.setVisibility(visible ? View.VISIBLE : View.GONE);
    }

    private void setViewVisibility(final boolean visible) {
        final View view = getView();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                setVisibility(view, visible);
                mIsInvisible = !visible;
            }
        });
    }

    /**
     * Fired only when {@link DragGestureHandler#mDragMode} is set to {@link DragGestureUtils#DRAG_MODE_MOVE}
     */
    public void onDrop() { }

    private void startDragging() {
        mOrchestrator.mIsDragging = true;
        mIsDragging = true;
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder;
        if (mShadowEnabled || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && mDataResolver.getActivity().isInMultiWindowMode())) {
            shadowBuilder = new View.DragShadowBuilder(
                    mShadowBuilderView != null ?
                            mShadowBuilderView :
                            getView());
            if (!mShadowEnabled) {
                Log.i(getDebugTag(),
                        "[GESTURE HANDLER] Overriding configuration: drag shadow must be enabled in multi window mode");
                mDidWarn = true;
            }
            mLastShadowVisible = true;
        } else {
            shadowBuilder = mInvisibleShadow;
            setElevation();
            mLastShadowVisible = false;
        }
        int flags = DragGestureUtils.getFlags();
        try {
            getView().startDrag(data, shadowBuilder, null, flags);
        } catch (Throwable throwable) {
            resetElevation();
            getView().startDrag(data, new View.DragShadowBuilder(getView()), null, flags);
            mLastShadowVisible = true;
            Log.e(
                    getDebugTag(),
                    String.format(
                            "[GESTURE HANDLER] Failed to start dragging with DragShadow %s of view %s, defaulting",
                            shadowBuilder,
                            mShadowBuilderView),
                    throwable);
        }
        if (mDragMode == DRAG_MODE_MOVE && mLastShadowVisible) {
            setViewVisibility(false);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void updateDragShadow() {
        if (!mIsDragging) {
            return;
        }
        View.DragShadowBuilder shadowBuilder;
        boolean nextShadowVisible;
        if (mShadowEnabled || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && mDataResolver.getActivity().isInMultiWindowMode())) {
            shadowBuilder = new View.DragShadowBuilder(
                    mShadowBuilderView != null ?
                            mShadowBuilderView :
                            getView());
            nextShadowVisible = true;
            if (!mShadowEnabled && !mDidWarn) {
                Log.i(getDebugTag(),
                        "[GESTURE HANDLER] Overriding configuration: drag shadow must be enabled in multi window mode");
                mDidWarn = true;
            }
        } else {
            shadowBuilder = mInvisibleShadow;
            nextShadowVisible = false;
        }
        boolean hasChanged = !(!mLastShadowVisible && !nextShadowVisible);
        if (hasChanged) {
            try {
                getView().updateDragShadow(shadowBuilder);
                mLastShadowVisible = nextShadowVisible;
            } catch (Throwable throwable) {
                Log.e(getDebugTag(), "[GESTURE HANDLER] error while trying to update drag shadow", throwable);
            }
        }
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
        if (mSourceAppID == null) {
            mSourceAppID = DragGestureUtils.getEventPackageName(event);
        }
        if (mDragAction == DragEvent.ACTION_DROP) {
            mResult = true;
        } else if (mDragAction == DragEvent.ACTION_DRAG_ENDED) {
            mIsDragging = false;
        }
        super.onHandle(event);
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
    }

    @Override
    protected void onStateChange(int newState, int previousState) {
        if (GestureHandlerOrchestrator.isFinished(newState)) {
            if (!mShadowEnabled) {
                resetElevation();
            }
            if (mDragMode == DRAG_MODE_MOVE) {
                if (mResult) {
                    onDrop();
                } else if (mIsInvisible) {
                    setViewVisibility(true);
                }
            }
        }
        super.onStateChange(newState, previousState);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mIsDragging = false;
        mResult = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mDropHandler = null;
        mLastDropHandler = null;
        mSourceAppID = null;
        mIsInvisible = false;
        mDidWarn = false;
    }

}
