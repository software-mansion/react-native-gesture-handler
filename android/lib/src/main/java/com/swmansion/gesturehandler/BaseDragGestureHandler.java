package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.view.DragEvent;
import android.view.View;

import java.util.ArrayList;

public class BaseDragGestureHandler<T> extends GestureHandler<BaseDragGestureHandler<T>> implements View.OnDragListener {

    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";
    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceApp";
    public static final String KEY_DRAG_TARGET = "dragTarget";
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
        return event.getClipDescription().filterMimeTypes(DRAG_MIME_TYPE).length > 0;
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
    private int mDragState = DragEvent.ACTION_DRAG_ENDED;
    private int mDragTarget = -1;
    private int mDropTarget = -1;

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

    public void setData(T data) {
        mData = data;
    }

    protected ClipData createClipData() {
        Intent intent = new Intent(Intent.ACTION_RUN);
        intent.putExtra(KEY_DRAG_TARGET, getView().getId());
        intent.putIntegerArrayListExtra(KEY_TYPE, mDTypes);
        intent.putExtra(KEY_SOURCE_APP, getView().getContext().getPackageName());
        if (mData != null) {
            intent.putExtra(KEY_DATA, mData.toString());
        }
        String[] mimeTypes = new String[2];
        mimeTypes[0] = ClipDescription.MIMETYPE_TEXT_INTENT;
        mimeTypes[1] = DRAG_MIME_TYPE;
        return new ClipData(DRAG_MIME_TYPE, mimeTypes, new ClipData.Item(intent));
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

    public int getDragState() {
        return mDragState;
    }

    public int getDragTarget() {
        return mDragTarget;
    }

    public int getDropTarget() {
        return mDropTarget;
    }


    @Override
    public boolean onDrag(View v, DragEvent event) {
        boolean shouldHandleEvent = isSameType(event);
        if (!shouldHandleEvent) {
            fail();
            return false;
        }

        mDragState = extractDragState(event.getAction());
        mDragTarget = v.getId();
        int viewTag = getView().getId();
        mDropTarget = mDragTarget == viewTag ? -1 : viewTag;

        Log.d("DragDrop", "onDrag: " + event);
        if (mDragState == STATE_START) {
            activate();
        } else if (mDragState == STATE_END || mDragState == STATE_DROP) {
            moveToState(mDragState);
            end();
            mDragTarget = -1;
            mDropTarget = -1;
        } else if (getState() != mDragState) {
            moveToState(mDragState);
        }

        return true;
    }


}
