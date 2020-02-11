package com.swmansion.gesturehandler;

import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public abstract class DragDropGestureHandler<T> extends GestureHandler<DragDropGestureHandler<T>> implements View.OnDragListener {

    public interface DataResolver<T> {
        String toString();
        T fromString(String source);
        T data();
    }

    public static final String DRAG_EVENT_NAME = "GESTURE_HANDLER_DRAG_EVENT";
    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";

    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceApp";
    public static final String KEY_DRAG_TARGET = "dragTarget";
    public static final String KEY_DROP_TARGET = "dropTarget";
    public static final String KEY_TYPE = "type";

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

    final ArrayList<Integer> mDTypes = new ArrayList<>();
    T mData;
    DataResolver<T> mDataResolver;
    private boolean mAttachedListener = false;

    public DragDropGestureHandler() {
        super();
        setShouldCancelWhenOutside(false);
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

    public abstract int getDragTarget();
    public abstract int getDropTarget();


    public boolean shouldHandleEvent(DragEvent event) {
        if (event.getClipDescription() != null) {
            String desc;
            for (int i = 0; i < event.getClipDescription().getMimeTypeCount(); i++) {
                desc = event.getClipDescription().getMimeType(i);
                if (desc.contains(DRAG_MIME_TYPE)) {
                    int pos = DRAG_MIME_TYPE.length() + 1;
                    char c;
                    StringBuilder builder = new StringBuilder();
                    ArrayList<Integer> types = new ArrayList<>();
                    while (pos < desc.length()) {
                        c = desc.charAt(pos);
                        if (c != ',') {
                            builder.append(c);
                        } else {
                            types.add(Integer.valueOf(builder.toString()));
                            builder.setLength(0);
                        }
                        pos++;
                    }

                    if (types.size() > 0 && mDTypes.size() > 0) {
                        for (int t: types) {
                            if (mDTypes.contains(t)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    private void attachListener() {
        if (!mAttachedListener) {
            mAttachedListener = true;
            getView().setOnDragListener(this);
            begin();
        }
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        attachListener();
    }

    @Override
    protected void onHandle(DragEvent event) {
        attachListener();
        onDrag(getView(), event);
    }

    @Override
    public boolean onDrag(@Nullable View v, DragEvent event) {
        if (!shouldHandleEvent(event)) {
            if (getState() == STATE_ACTIVE) {
                cancel();
            } else {
                fail();
            }
            return false;
        }

        int action = event.getAction();
        if (action == DragEvent.ACTION_DRAG_STARTED || getState() == STATE_BEGAN) {
            activate();
        } else if (action == DragEvent.ACTION_DRAG_ENDED || action == DragEvent.ACTION_DROP) {
            end();
        }

        return true;
    }

    @Override
    protected void onReset() {
        mAttachedListener = false;
    }

}
