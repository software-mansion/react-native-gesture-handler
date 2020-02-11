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

    static DragEvent obtain(DragEvent event) {
        int flags = Parcelable.PARCELABLE_WRITE_RETURN_VALUE;
        Parcel parcel = Parcel.obtain();
        event.writeToParcel(parcel, flags);
        return DragEvent.CREATOR.createFromParcel(parcel);
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

    static class DerivedMotionEvent {
        private long downTime;
        private int mAction;

        MotionEvent obtain(DragEvent event) {
            int dAction = event.getAction();
            if (event.getAction() == DragEvent.ACTION_DRAG_STARTED) {
                downTime = SystemClock.uptimeMillis();
                mAction = MotionEvent.ACTION_DOWN;
            } else if (dAction == DragEvent.ACTION_DRAG_ENDED || dAction == DragEvent.ACTION_DROP) {
                mAction = MotionEvent.ACTION_UP;
            } else {
                mAction = MotionEvent.ACTION_MOVE;
            }
            return MotionEvent.obtain(downTime, SystemClock.uptimeMillis(), mAction, event.getX(), event.getY(), 0);
        }
    }

    public interface DataResolver<T> {
        String toString();
        T fromString(String source);
        T data();
    }


}
