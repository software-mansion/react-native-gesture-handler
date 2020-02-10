package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Intent;
import android.graphics.Canvas;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragDropGestureHandler<T> extends GestureHandler<DragDropGestureHandler<T>> implements View.OnDragListener {

    public interface DataResolver<T> {
        String toString();
        T fromString(String source);
        T data();
    }

    public static final String DRAG_EVENT_NAME = "GESTURE_HANDLER_DRAG_EVENT";
    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";
    private static final String[] DRAG_EVENT_MIME_TYPES = new String[] {
            ClipDescription.MIMETYPE_TEXT_INTENT,
            DRAG_MIME_TYPE
    };

    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceApp";
    public static final String KEY_DRAG_TARGET = "dragTarget";
    public static final String KEY_DROP_TARGET = "dropTarget";
    public static final String KEY_TYPE = "type";

    public static final int STATE_NS = 10;
    public static final int STATE_START = 0;
    public static final int STATE_DRAG = 1;
    public static final int STATE_ENTER = 2;
    public static final int STATE_EXIT = 3;
    public static final int STATE_DROP = 4;
    public static final int STATE_END = 5;


    protected static int getFlags() {
        /*
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return View.DRAG_FLAG_GLOBAL | View.DRAG_FLAG_GLOBAL_URI_READ | View.DRAG_FLAG_GLOBAL_URI_WRITE;
        }

         */
        return 0;
    }

    public static boolean shouldHandleEvent(DragEvent event) {
        if (event.getClipDescription() != null) {
            for (int i = 0; i < event.getClipDescription().getMimeTypeCount(); i++) {
                if (event.getClipDescription().getMimeType(i).equals(DRAG_MIME_TYPE)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static int extractDragTarget(DragEvent event) {
        if (event.getClipData() == null) {
            return View.NO_ID;
        } else {
            return event
                    .getClipData()
                    .getItemAt(0)
                    .getIntent()
                    .getIntExtra(KEY_DRAG_TARGET, View.NO_ID);
        }
    }

    private static int extractRawDragState(int dragEventAction) {
        switch (dragEventAction) {
            case DragEvent.ACTION_DRAG_STARTED:
                return STATE_START;
            case DragEvent.ACTION_DROP:
                return STATE_DROP;
            case DragEvent.ACTION_DRAG_ENDED:
                return STATE_END;
            case DragEvent.ACTION_DRAG_ENTERED:
                return STATE_ENTER;
            case DragEvent.ACTION_DRAG_EXITED:
                return STATE_EXIT;
                default:
                    return STATE_DRAG;
        }
    }

    private static int extractDragState(int dragEventAction) {
        return extractRawDragState(dragEventAction) + STATE_NS;
    }

    private final ArrayList<Integer> mDTypes = new ArrayList<>();
    private T mData;
    private DataResolver<T> mDataResolver;
    private int mDragState = DragEvent.ACTION_DRAG_ENDED;
    private boolean mAttachedListener = false;
    private View mTarget;

    public DragDropGestureHandler() {
        super();
    }

    public ArrayList<Integer> getType() {
        return mDTypes;
    }

    public DragDropGestureHandler<T> setType(ArrayList<Integer> types) {
        mDTypes.clear();
        if (types != null) {
            mDTypes.addAll(types);
        }
        return this;
    }

    public T getData() {
        return mData;
    }

    public DragDropGestureHandler<T> setData(DataResolver<T> dataResolver) {
        mDataResolver = dataResolver;
        return this;
    }

    public int getDragState() {
        return mDragState;
    }

    public int getDragTarget() {
        return getView().getId();
    }

    public int getDropTarget() {
        return -1;
    }

    public View getTarget() {
        return mTarget;
    }

    public void setTarget(View view) {
        mTarget = view;
        //mTarget.setOnDragListener(this);
        //mAttachedListener = true;
    }

    private ClipData createClipData() {
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DROP_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPE, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, getView().getContext().getPackageName());
        if (mDataResolver != null) {
            intent.putExtra(KEY_DATA, mDataResolver.toString());
        }
        return new ClipData(DRAG_EVENT_NAME, DRAG_EVENT_MIME_TYPES, new ClipData.Item(intent));
    }

    private void handleExtraData(DragEvent event) {
        if (event.getClipData() == null || getView() == null) {
            return;
        }
        Intent dataIntent = event.getClipData().getItemAt(0).getIntent();
        int tag = getView().getId();
        int action = event.getAction();
        if (action == DragEvent.ACTION_DRAG_ENTERED && tag != dataIntent.getIntExtra(KEY_DRAG_TARGET, View.NO_ID)) {
            dataIntent.putExtra(KEY_DROP_TARGET, tag);
            mData = mDataResolver.fromString(dataIntent.getStringExtra(KEY_DATA));
        } else if (action == DragEvent.ACTION_DRAG_EXITED || action == DragEvent.ACTION_DRAG_ENDED) {
            dataIntent.removeExtra(KEY_DROP_TARGET);
        }
    }

    protected boolean isSameType(DragEvent event) {
        return true;
        /*
        Log.d("DragDrop", "isSameType: "+ shouldHandleEvent(event) + "  " + event);

        if (shouldHandleEvent(event)) {
            ArrayList<Integer> types = event
                    .getClipData()
                    .getItemAt(0)
                    .getIntent()
                    .getIntegerArrayListExtra(KEY_TYPE);
            Log.d("DragDrop", "isSameType: " + types + " " + mDTypes);
            for (int t: types) {
                if (mDTypes.contains(t)) {
                    return true;
                }
            }
        }

        return false;

         */
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

    final void startDragging() {
        mOrchestrator.mIsDragging = true;
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(getView());
        //View.DragShadowBuilder shadowBuilder = new SyncedDragShadowBuilder(getView());
        int flags = getFlags();
        getView().startDrag(data, shadowBuilder, null, flags);
        /*
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            getView().startDragAndDrop(data, shadowBuilder, null, flags);
        } else {
            getView().startDrag(data, shadowBuilder, null, flags);
        }

         */
    }

    @Override
    public boolean onDrag(@Nullable View v, DragEvent event) {
        Log.d("Drag", "onDrag: handling drag event for "+v);
        if (!isSameType(event)) {
            fail();
            return false;
        }

        mDragState = extractDragState(event.getAction());
        handleExtraData(event);

        return true;
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        if (!mAttachedListener) {
            mAttachedListener = true;
            getView().setOnDragListener(this);
            setTarget(getView());
            begin();
        }
    }

    @Override
    protected void onHandle(DragEvent event) {
        onDrag(getView(), event);
    }

    @Override
    protected void onReset() {
        mAttachedListener = false;
    }

}
