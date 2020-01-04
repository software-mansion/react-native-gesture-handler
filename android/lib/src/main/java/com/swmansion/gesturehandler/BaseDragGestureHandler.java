package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class BaseDragGestureHandler<T> extends GestureHandler<BaseDragGestureHandler<T>> implements View.OnDragListener {

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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return View.DRAG_FLAG_GLOBAL | View.DRAG_FLAG_GLOBAL_URI_READ | View.DRAG_FLAG_GLOBAL_URI_WRITE;
        }
        return 0;
    }

    private static boolean isDragEvent(DragEvent event) {
        Log.d("DragDrop", "isDragEvent: " + event.getClipDescription());
        return event.getClipDescription() != null && event.getClipDescription().hasMimeType(DRAG_MIME_TYPE);
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
    private int mDragTarget = -1;
    private int mDropTarget = -1;
    private boolean mAttachedListener = false;

    public BaseDragGestureHandler() {
        super();
        setShouldCancelWhenOutside(false);
    }

    public ArrayList<Integer> getType() {
        return mDTypes;
    }

    public void setType(ArrayList<Integer> types) {
        mDTypes.clear();
        if (types != null) {
            mDTypes.addAll(types);
        }
    }

    public T getData() {
        return mData;
    }

    public void setData(DataResolver<T> dataResolver) {
        mDataResolver = dataResolver;
    }

    public int getDragState() {
        return mDragState;
    }

    public int getDragTarget() {
        return getView().getId();
    }

    public int getDropTarget() {
        return mDropTarget;
    }

    private ClipData createClipData() {
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DRAG_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPE, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, getView().getContext().getPackageName());
        if (mDataResolver != null) {
            intent.putExtra(KEY_DATA, mDataResolver.toString());
        }
        return new ClipData(DRAG_EVENT_NAME, DRAG_EVENT_MIME_TYPES, new ClipData.Item(intent));
    }

    private void handleExtraData(DragEvent event) {
        if (event.getClipData() == null) {
            return;
        }
        Intent dataIntent = event.getClipData().getItemAt(0).getIntent();
        int tag = getView().getId();
        int action = event.getAction();
        if (action == DragEvent.ACTION_DRAG_ENTERED && tag != dataIntent.getIntExtra(KEY_DRAG_TARGET, -1)) {
            dataIntent.putExtra(KEY_DROP_TARGET, tag);
            mData = mDataResolver.fromString(dataIntent.getStringExtra(KEY_DATA));
        } else if (action == DragEvent.ACTION_DRAG_EXITED || action == DragEvent.ACTION_DRAG_ENDED) {
            dataIntent.removeExtra(KEY_DROP_TARGET);
        }
    }

    protected boolean isSameType(DragEvent event) {
        if (isDragEvent(event)) {
            ArrayList<Integer> types = event
                    .getClipData()
                    .getItemAt(0)
                    .getIntent()
                    .getIntegerArrayListExtra(KEY_TYPE);

            for (int t: types) {
                if (mDTypes.contains(t)) {
                    return true;
                }
            }
        }

        return false;
    }

    private class SyncedDragShadowBuilder extends View.DragShadowBuilder {
        @Override
        public void onDrawShadow(Canvas canvas) {
            BaseDragGestureHandler.this.getView().draw(canvas);
        }
    }

    final void startDragging() {
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(getView());
        int flags = getFlags();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            getView().startDragAndDrop(data, shadowBuilder, null, flags);
        } else {
            getView().startDrag(data, shadowBuilder, null, flags);
        }
    }

    @Override
    public boolean onDrag(@Nullable View v, DragEvent event) {
        /*
        if (!isSameType(event)) {
            fail();
            return false;
        }


         */

        mDragState = extractDragState(event.getAction());
        handleExtraData(event);

        mDropTarget = v != null ? v.getId() : -1;
        if (v != null) {
            v.setBackgroundColor(Color.BLUE);
            v.invalidate();
        }

        if (mDragState == STATE_START) {
            activate();
        } else if (mDragState == STATE_END || mDragState == STATE_DROP) {
            moveToState(mDragState);
            end();
            minorReset();
        } else if (getState() != mDragState) {
            //moveToState(mDragState);
        }

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
        }
    }

    private void minorReset() {
        mDragTarget = -1;
        mDropTarget = -1;
    }

    @Override
    protected void onReset() {
        minorReset();
        mAttachedListener = false;
    }
}
