package com.swmansion.gesturehandler;

import android.content.Context;
import android.view.DragEvent;
import android.view.MotionEvent;

import androidx.annotation.Nullable;

import com.swmansion.gesturehandler.DragGestureUtils.DataResolver;

import java.util.ArrayList;

import static com.swmansion.gesturehandler.DragGestureUtils.DRAG_MIME_TYPE;

@SuppressWarnings("unchecked cast")
public abstract class DragDropGestureHandler<T extends DataResolver, S extends DragDropGestureHandler<T, S>> extends PanGestureHandler<S> {

    final ArrayList<Integer> mDTypes = new ArrayList<>();
    T mDataResolver;
    private final Context mContext;

    DragDropGestureHandler(Context context) {
        super(context);
        mContext = context;
        super.setShouldCancelWhenOutside(false);
    }

    public Context getContext() {
        return mContext;
    }

    // to operate as expected DragDropGestureHandler must not cancel when outside so we override this permanently
    @Override
    public final S setShouldCancelWhenOutside(boolean shouldCancelWhenOutside) {
        return (S) this;
    }

    public ArrayList<Integer> getTypes() {
        return mDTypes;
    }

    public S setTypes(ArrayList<Integer> types) {
        mDTypes.clear();
        if (types != null) {
            mDTypes.addAll(types);
        }
        return (S) this;
    }

    public T getDataResolver() {
        return mDataResolver;
    }

    public S setDataResolver(T dataResolver) {
        mDataResolver = dataResolver;
        return (S) this;
    }

    public abstract int getDragTarget();
    public abstract @Nullable int[] getDragTargets();
    public abstract int getDropTarget();
    public abstract int getDragAction();

    boolean shouldHandleEvent(DragEvent event) {
        if (mDTypes.size() == 0) {
            return true;
        } else if (event.getClipDescription() != null) {
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

                    if (types.size() > 0) {
                        for (int t: types) {
                            if (mDTypes.contains(t)) {
                                return true;
                            }
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    @Override
    protected void onHandle(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_UP) {
            // we don't want PanGestureHandler to handle state decision making for up event
            if (!mOrchestrator.mIsDragging) {
                cancel();
            }
        } else {
            super.onHandle(event);
        }
    }

    @Override
    protected void onHandle(DragEvent event) {
        // PanGestureHandler is in charge of moving to BEGIN/ACTIVE state
        int action = event.getAction();
        if (action == DragEvent.ACTION_DRAG_ENDED && getState() == STATE_ACTIVE) {
            end();
        } else if (action == DragEvent.ACTION_DRAG_ENDED) {
            fail();
        }
    }

}
