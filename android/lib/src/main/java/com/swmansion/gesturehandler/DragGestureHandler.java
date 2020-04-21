package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
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

import com.swmansion.gesturehandler.DragGestureUtils.DataResolver;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_EVENT_NAME;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_COPY;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_MOVE;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_MOVE_RESTORE;
import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MODE_NONE;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DRAG_TARGET;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_TYPES;

public class DragGestureHandler<T, S> extends DragDropGestureHandler<DataResolver<T, S>, DragGestureHandler<T, S>>
        implements ViewTreeObserver.OnDrawListener {

    private @Nullable DropGestureHandler<T, S> mDropHandler = null;
    private @Nullable DropGestureHandler<T, S> mLastDropHandler = null;
    private final ArrayList<DragGestureHandler> mActiveDragHandlers = new ArrayList<>();
    private View[] mDragTargets;
    private int[] mDragTargetTags;

    private int mDragAction;
    private boolean mIsDragging = false;
    private boolean mIsJoining = false;
    private @Nullable DragGestureHandler mDragMaster;
    private @Nullable View mShadowBuilderView;
    private boolean mShadowEnabled = true;
    private int mDragMode = DRAG_MODE_MOVE;
    private MultiDragShadowBuilder.Config mShadowConfig;
    private boolean mResult = false;
    private float mOriginalElevation;
    private String mSourceAppID;
    private final View.DragShadowBuilder mInvisibleShadow = new View.DragShadowBuilder() {
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
        mShadowConfig = new MultiDragShadowBuilder.Config();
    }

    private void scheduleShadowListenerTask(final View view, final boolean action) {
        ViewTreeObserver treeObserver = view.getViewTreeObserver();
        try {
            if (action) {
                treeObserver.addOnDrawListener(this);
            } else {
                treeObserver.removeOnDrawListener(this);
            }
        } catch (Throwable throwable) {
            /**
             * {@link ViewTreeObserver#addOnDrawListener(ViewTreeObserver.OnDrawListener)} throws when view is drawing
             * so we try again
             */
            throwable.printStackTrace();
            view.post(new Runnable() {
                @Override
                public void run() {
                    scheduleShadowListenerTask(view, action);
                }
            });
        }
    }

    public DragGestureHandler<T, S> setShadowBuilderView(@Nullable final View view) {
        View prevShadowBuilderView = mShadowBuilderView;
        mShadowBuilderView = view;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && view != prevShadowBuilderView) {
            if (prevShadowBuilderView != null) {
                scheduleShadowListenerTask(prevShadowBuilderView, false);
            }
            if (view != null) {
                scheduleShadowListenerTask(view, true);
            }
            updateDragShadow();
        }
        return this;
    }

    public DragGestureHandler<T, S> setShadowConfig(MultiDragShadowBuilder.Config config) {
        mShadowConfig = config;
        return this;
    }

    DragGestureHandler<T, S> setEnableShadow(boolean enable) {
        mShadowEnabled = enable;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            updateDragShadow();
        }
        return this;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public void onDraw() {
        if (mShadowEnabled) {
            updateDragShadow();
        }
    }

    public int getDragMode() {
        return mDragMode;
    }

    public DragGestureHandler<T, S> setDragMode(int mode) {
        setEnableShadow(mode != DRAG_MODE_NONE);
        if (mIsDragging && mShadowEnabled) {
            if (mode == DRAG_MODE_MOVE || mode == DRAG_MODE_MOVE_RESTORE) {
                setViewVisibility(false);
            } else if (mode == DRAG_MODE_COPY) {
                setViewVisibility(true);
            }
        }
        mDragMode = mode;
        return this;
    }

    public DropGestureHandler<T, S> getDropHandler() {
        return mDropHandler;
    }

    public DropGestureHandler<T, S> getLastDropHandler() {
        return mLastDropHandler;
    }

    void setDropHandler(@Nullable DropGestureHandler<T, S> handler) {
        for (int i = 1; i < mActiveDragHandlers.size(); i++) {
            mActiveDragHandlers.get(i).setDropHandler(handler);
        }
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

    @Nullable
    @Override
    public int[] getDragTargets() {
        return mDragTargetTags;
    }

    public View[] getViews() {
        return mDragTargets;
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

    public String getSourceAppID() {
        return mSourceAppID;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DropGestureHandler ||
                (mIsJoining && mDragMaster != null && mDragMaster.mActiveDragHandlers.contains(handler));
    }

    private void prepareJoiningHandlers() {
        mActiveDragHandlers.clear();
        mActiveDragHandlers.add(this);
        if (mInteractionController != null) {
            GestureHandler handler;
            DragGestureHandler dragHandler;
            int[] mSimultaneousDragHandlers = mInteractionController.getSimultaneousRelations(this);
            if (mSimultaneousDragHandlers != null && mSimultaneousDragHandlers.length > 0) {
                for (int handlerTag : mSimultaneousDragHandlers) {
                    handler = mOrchestrator.getHandler(handlerTag);
                    if (handler instanceof DragGestureHandler && handler != this && !mActiveDragHandlers.contains(handler)) {
                        dragHandler = (DragGestureHandler) handler;
                        mActiveDragHandlers.add(dragHandler);
                        dragHandler.mIsJoining = true;
                        dragHandler.mDragMaster = this;
                    }
                }
            }
        }
    }

    ClipData createClipData() {
        String packageName = getView().getContext().getPackageName();
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DRAG_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPES, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, packageName);
        if (mDataResolver != null) {
            intent.putExtra(KEY_DATA, mDataResolver.stringify(mActiveDragHandlers.toArray(new DragGestureHandler[0])));
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

    private void runOnUiThread(Runnable runnable) {
        mDataResolver.getActivity().runOnUiThread(runnable);
    }

    private void setElevation() {
        final View[] views = mDragTargets;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                for (View view: views) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        mOriginalElevation = view.getElevation();
                        view.setElevation(Float.MAX_VALUE);
                    } else {
                        mOriginalElevation = ViewCompat.getElevation(view);
                        ViewCompat.setElevation(view, Integer.MAX_VALUE);
                    }
                }
            }
        });
    }

    private void resetElevation() {
        final View[] views = mDragTargets;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                for (View view: views) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        view.setElevation(mOriginalElevation);
                    } else {
                        ViewCompat.setElevation(view, mOriginalElevation);
                    }
                }
            }
        });
    }

    @UiThread
    public void setVisibility(View view, boolean visible) {
        view.setVisibility(visible ? View.VISIBLE : View.INVISIBLE);
    }

    private void setViewVisibility(final boolean visible) {
        final View[] views = mDragTargets;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                for (View view: views) {
                    setVisibility(view, visible);
                }
                mIsInvisible = !visible;
            }
        });
    }

    private View.DragShadowBuilder createDragShadow() {
        View.DragShadowBuilder shadowBuilder;
        if (mShadowEnabled || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && mDataResolver.getActivity().isInMultiWindowMode())) {
            shadowBuilder = new MultiDragShadowBuilder(mActiveDragHandlers, mShadowConfig);
            if (!mShadowEnabled) {
                Log.i(getDebugTag(),
                        "[GESTURE HANDLER] Overriding configuration: drag shadow must be enabled in multi window mode");
                mDidWarn = true;
                mDragMode = DRAG_MODE_MOVE;
            }
            mLastShadowVisible = true;
        } else {
            shadowBuilder = mInvisibleShadow;
            setElevation();
            mLastShadowVisible = false;
        }
        return shadowBuilder;
    }

    private void startDragging() {
        prepareJoiningHandlers();
        mOrchestrator.startDragging(mActiveDragHandlers);
        mIsDragging = true;
        mDragTargetTags = new int[mActiveDragHandlers.size()];
        mDragTargets = new View[mActiveDragHandlers.size()];
        for (int i = 0; i < mActiveDragHandlers.size(); i++) {
            DragGestureHandler handler = mActiveDragHandlers.get(i);
            mDragTargets[i] = handler.getView();
            mDragTargetTags[i] = handler.getView().getId();
        }
        ClipData data = createClipData();
        int flags = DragGestureUtils.getFlags();
        View.DragShadowBuilder shadowBuilder = createDragShadow();
        View view = getView();
        try {
            view.startDrag(data, shadowBuilder, null, flags);
        } catch (Throwable throwable) {
            resetElevation();
            view.startDrag(data, new View.DragShadowBuilder(getView()), null, flags);
            mLastShadowVisible = true;
            Log.e(
                    getDebugTag(),
                    String.format(
                            "[GESTURE HANDLER] Failed to start dragging with DragShadow %s of view %s, defaulting",
                            shadowBuilder,
                            mShadowBuilderView),
                    throwable);
        }
        if ((mDragMode == DRAG_MODE_MOVE || mDragMode == DRAG_MODE_MOVE_RESTORE) && mLastShadowVisible) {
            setViewVisibility(false);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void updateDragShadow() {
        if (mIsJoining && mDragMaster != null) {
            mDragMaster.updateDragShadow();
            return;
        }
        if (!mIsDragging) {
            return;
        }
        View.DragShadowBuilder shadowBuilder;
        boolean nextShadowVisible;
        if (mShadowEnabled || (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && mDataResolver.getActivity().isInMultiWindowMode())) {
            shadowBuilder = new MultiDragShadowBuilder(mActiveDragHandlers, mShadowConfig);
            nextShadowVisible = true;
            if (!mShadowEnabled && !mDidWarn) {
                Log.i(getDebugTag(),
                        "[GESTURE HANDLER] Overriding configuration: drag shadow must be enabled in multi window mode");
                mDidWarn = true;
                mDragMode = DRAG_MODE_MOVE;
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
        }
        super.onHandle(event);
        if (mDragAction == DragEvent.ACTION_DRAG_ENDED) {
            mIsDragging = false;
            mIsJoining = false;
        }
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
    }

    /**
     * Subclasses should override this method to handle the {@link DragGestureHandler} UI
     */
    public void onDrop() {
        if (mDragMode == DRAG_MODE_MOVE_RESTORE) {
            setViewVisibility(true);
        }
    }

    @Override
    protected void onStateChange(int newState, int previousState) {
        if (GestureHandlerOrchestrator.isFinished(newState) && mIsDragging) {
            if (!mShadowEnabled) {
                resetElevation();
            }
            if (mResult) {
                onDrop();
            } else if (mIsInvisible && (mDragMode == DRAG_MODE_MOVE || mDragMode == DRAG_MODE_MOVE_RESTORE)) {
                setViewVisibility(true);
            }
        }
        super.onStateChange(newState, previousState);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mIsDragging = false;
        mIsJoining = false;
        mDragMaster = null;
        mResult = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mDropHandler = null;
        mLastDropHandler = null;
        mActiveDragHandlers.clear();
        mDragTargets = null;
        mDragTargetTags = null;
        mSourceAppID = null;
        mIsInvisible = false;
        mDidWarn = false;
    }

    @SuppressWarnings({"unused", "WeakerAccess"})
    public static class MultiDragShadowBuilder extends View.DragShadowBuilder {

        private View[] mViews;
        private final Paint mPaint = new Paint();
        private final Canvas mTempCanvas = new Canvas();
        private Config mConfig;
        
        public static class Config {
            public boolean multiShadowEnabled = true;
            public boolean isRTL = false;
            public Point margin = new Point(25, 25);
            public Point offset = new Point(0, 0);
            public float minAlpha = 0.3f;
            public float maxAlpha = 0.9f;
        } 

        public MultiDragShadowBuilder(View[] views, Config config) {
           init(views, config);
        }

        public MultiDragShadowBuilder(List<DragGestureHandler> handlers, Config config) {
            ArrayList<View> views = new ArrayList<>();
            DragGestureHandler handler;
            View view;
            int size = 0;
            for (int i = 0; i < handlers.size(); i++) {
                handler = handlers.get(i);
                view = handler.mShadowBuilderView != null ? handler.mShadowBuilderView : handler.getView();
                // The first view, the master of the drag gesture, should be drawn at the top of the shadow stack
                // the rest should be drawn from bottom top top so we reverse the order accordingly
                if (i == 0) {
                    views.add(view);
                } else {
                    views.add(1, view);
                }

            }
            init(views.toArray(new View[0]), config);
        }

        private void init(View[] views, Config config) {
            mViews = views;
            setConfig(config);
        }

        private View viewAt(int i) {
            return mViews[i];
        }

        public void setConfig(Config config) {
            mConfig = config;
            mConfig.minAlpha = Math.max(config.minAlpha, 0);
            mConfig.maxAlpha = Math.min(config.maxAlpha, 1);
        }

        private boolean shouldRenderMultipleShadows() {
            return mConfig.multiShadowEnabled && mViews.length > 1;
        }

        private Point getSize() {
            int w = 0;
            int h = 0;
            int j;
            View view;
            if (shouldRenderMultipleShadows()) {
                for (int i = 0; i < mViews.length; i++) {
                    j = mViews.length - 1 - i;
                    view = viewAt(i);
                    w = Math.max(view.getWidth() + j * mConfig.margin.x, w);
                    h = Math.max(view.getHeight() + j * mConfig.margin.y, h);
                }
            } else {
                view = viewAt(0);
                w = view.getWidth();
                h = view.getHeight();
            }
            w += Math.abs(mConfig.offset.x);
            h += Math.abs(mConfig.offset.y);
            return new Point(w, h);
        }

        private void draw(Canvas canvas, int i) {
            float d = !shouldRenderMultipleShadows() ? 0 : (mConfig.minAlpha - mConfig.maxAlpha) / (mViews.length - 1);
            View view = viewAt(i);
            if (view.getWidth() == 0 && view.getHeight() == 0) {
                return;
            }
            Bitmap canvasBitmap = Bitmap.createBitmap(view.getWidth(), view.getWidth(), Bitmap.Config.ARGB_8888);
            mTempCanvas.setBitmap(canvasBitmap);
            view.draw(mTempCanvas);
            mPaint.setAlpha((int) ((mConfig.maxAlpha + d * i) * 255));
            canvas.drawBitmap(canvasBitmap, 0, 0, mPaint);
            canvasBitmap.recycle();
        }

        @Override
        public void onDrawShadow(Canvas canvas) {
            canvas.save();
            int shadowCount = !shouldRenderMultipleShadows() ? 1 : mViews.length;
            if (shadowCount == 1) {
                canvas.translate(Math.abs(mConfig.offset.x), Math.abs(mConfig.offset.y));
                draw(canvas, 0);
            } else if (mConfig.isRTL) {
                canvas.translate(-Math.abs(mConfig.offset.x), Math.abs(mConfig.offset.y));
                canvas.translate(getSize().x, 0);
                int j;
                for (int i = shadowCount - 1; i >=0; i--) {
                    j = shadowCount - 1 - i;
                    canvas.save();
                    canvas.translate(-viewAt(i).getWidth() - mConfig.margin.x * j, mConfig.margin.y * j);
                    draw(canvas, i);
                    canvas.restore();
                }
            } else {
                canvas.translate(Math.abs(mConfig.offset.x), Math.abs(mConfig.offset.y));
                for (int i = shadowCount - 1; i >= 0; i--) {
                    if (i != shadowCount - 1) {
                        canvas.translate(mConfig.margin.x, mConfig.margin.y);
                    }
                    draw(canvas, i);
                }
            }
            canvas.restore();
        }

        @Override
        public void onProvideShadowMetrics(Point outShadowSize, Point outShadowTouchPoint) {
            Point size = getSize();
            outShadowSize.set(size.x, size.y);
            View firstView = viewAt(0);
            if (shouldRenderMultipleShadows()) {
                Point margin = new Point(
                        mConfig.margin.x * (mViews.length - 1),
                        mConfig.margin.y * (mViews.length - 1));
                if (mConfig.isRTL) {
                    outShadowTouchPoint.set(
                            size.x - firstView.getWidth() / 2 - margin.x,
                            firstView.getHeight() / 2 + margin.y);
                    outShadowTouchPoint.offset(
                            -Math.max(mConfig.offset.x, 0) * 2,
                            Math.abs(Math.min(mConfig.offset.y, 0)) * 2);
                } else {
                    outShadowTouchPoint.set(
                            firstView.getWidth() / 2 + margin.x,
                            firstView.getHeight() / 2 + margin.y);
                    outShadowTouchPoint.offset(
                            Math.abs(Math.min(mConfig.offset.x, 0)) * 2,
                            Math.abs(Math.min(mConfig.offset.y, 0)) * 2);
                }
            } else {
                outShadowTouchPoint.set(
                        firstView.getWidth() / 2,
                        firstView.getHeight() / 2);
                outShadowTouchPoint.offset(
                        Math.abs(Math.min(mConfig.offset.x, 0)) * 2,
                        Math.abs(Math.min(mConfig.offset.y, 0)) * 2);
            }
            super.onProvideShadowMetrics(outShadowSize, outShadowTouchPoint);
        }
    }

}
