package com.swmansion.gesturehandler;

import android.content.Context;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;

import java.util.ArrayList;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;

public abstract class DragDropGestureHandler<T, C extends DragDropGestureHandler> extends PanGestureHandler<C> {

    final ArrayList<Integer> mDTypes = new ArrayList<>();
    private T mData;
    DragGestureUtils.DataResolver<T> mDataResolver;

    public DragDropGestureHandler(Context context) {
        super(context);
        super.setShouldCancelWhenOutside(false);
    }

    public ArrayList<Integer> getType() {
        return mDTypes;
    }

    public C setType(ArrayList<Integer> types) {
        mDTypes.clear();
        if (types != null) {
            mDTypes.addAll(types);
        }
        return (C) this;
    }

    public T getData() {
        return mData;
    }

    public C setData(DragGestureUtils.DataResolver<T> dataResolver) {
        mDataResolver = dataResolver;
        return (C) this;
    }

    public abstract int getDragTarget();
    public abstract int getDropTarget();
    public abstract int getDragAction();


    private boolean shouldHandleEvent(DragEvent event) {
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

    @Override
    protected void onHandle(MotionEvent event) {
        if (mOrchestrator.mIsDragging && (event.getAction() == MotionEvent.ACTION_UP || event.getAction() == MotionEvent.ACTION_POINTER_UP)) {
            MotionEvent ev = MotionEvent.obtain(event);
            ev.setAction(MotionEvent.ACTION_MOVE);
            super.onHandle(ev);
            ev.recycle();
        } else {
            super.onHandle(event);
        }
    }

    @Override
    protected void onHandle(DragEvent event) {
        if (!shouldHandleEvent(event)) {
            if (getState() == STATE_ACTIVE) {
                cancel();
            } else {
                fail();
            }
        }

        int action = event.getAction();
        if (action == DragEvent.ACTION_DRAG_STARTED || getState() == STATE_BEGAN) {
            activate();
        } else if (action == DragEvent.ACTION_DRAG_ENDED) {
            end();
        }
    }

    @Override
    public C setShouldCancelWhenOutside(boolean shouldCancelWhenOutside) {
        return (C) this;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DragDropGestureHandler;
    }

}
