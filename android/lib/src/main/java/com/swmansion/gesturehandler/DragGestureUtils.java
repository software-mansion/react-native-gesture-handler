package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Intent;
import android.graphics.PointF;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.SystemClock;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragGestureUtils {

    public static final String DRAG_EVENT_NAME = "GESTURE_HANDLER_DRAG_EVENT";
    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";

    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceApp";
    public static final String KEY_DRAG_TARGET = "dragTarget";
    public static final String KEY_DROP_TARGET = "dropTarget";
    public static final String KEY_TYPE = "type";

    static int getFlags() {
        /*
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return View.DRAG_FLAG_GLOBAL | View.DRAG_FLAG_GLOBAL_URI_READ | View.DRAG_FLAG_GLOBAL_URI_WRITE;
        }

         */
        return 0;
    }

    static DragEvent obtain(int action, float x, float y, boolean result,
                            @Nullable ClipData clipData, @Nullable ClipDescription clipDescription) {
        int flags = Parcelable.PARCELABLE_WRITE_RETURN_VALUE;
        Parcel parcel = Parcel.obtain();
        parcel.setDataPosition(0);
        parcel.writeInt(action);
        parcel.writeFloat(x);
        parcel.writeFloat(y);
        parcel.writeInt(result ? 1 : 0);
        if (clipData == null) {
            parcel.writeInt(0);
        } else {
            parcel.writeInt(1);
            clipData.writeToParcel(parcel, flags);
        }
        if (clipDescription == null) {
            parcel.writeInt(0);
        } else {
            parcel.writeInt(1);
            clipDescription.writeToParcel(parcel, flags);
        }
        parcel.setDataPosition(0);
        return DragEvent.CREATOR.createFromParcel(parcel);
    }

    static PointF traverseDragEventPointer(DragEvent event, View root, View view) {
        PointF localPoint = new PointF(event.getX(), event.getY());
        ArrayList<ViewParent> tree = new ArrayList<>();
        if (!(view == null || view == root)) {
            @Nullable ViewParent parent = view.getParent();
            tree.add(parent);
            while (parent != null && parent != root) {
                parent = parent.getParent();
                tree.add(parent);
            }
            for (int i = tree.size() - 1; i > 0; i--) {
                GestureHandlerOrchestrator.transformTouchPointToViewCoords(
                        localPoint.x, localPoint.y,(ViewGroup) tree.get(i), (View) tree.get(i - 1), localPoint);
            }
        }

        return localPoint;
    }

    public static class DerivedMotionEvent {
        private long downTime;
        private int mAction;
        private MotionEvent motionEvent;

        public static int getAction(int dragAction) {
            if (dragAction == DragEvent.ACTION_DRAG_STARTED) {
                return MotionEvent.ACTION_DOWN;
            } else if (dragAction == DragEvent.ACTION_DRAG_ENDED || dragAction == DragEvent.ACTION_DROP) {
                return MotionEvent.ACTION_UP;
            } else {
                return MotionEvent.ACTION_MOVE;
            }
        }

        public static void adapt(MotionEvent motionEvent, DragEvent dragEvent) {
            adapt(motionEvent, dragEvent.getAction(), dragEvent.getX(), dragEvent.getY());
        }

        public static void adapt(MotionEvent motionEvent, int dragAction, float x, float y) {
            motionEvent.setAction(getAction(dragAction));
            motionEvent.setLocation(x, y);
        }

        public MotionEvent obtain(DragEvent event) {
            return obtain(event.getAction(), event.getX(), event.getY());
        }

        public MotionEvent obtain(int dragAction, float x, float y) {
            if (dragAction == DragEvent.ACTION_DRAG_STARTED) {
                downTime = SystemClock.uptimeMillis();
            }
            mAction = getAction(dragAction);
            return MotionEvent.obtain(downTime, SystemClock.uptimeMillis(), mAction, x, y, 0);
        }
    }

    public interface DataResolver<T> {
        String toString();
        T fromString(String source);
        T data();
    }


}
