package com.swmansion.gesturehandler;

import android.content.ClipData;
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
    static ClipData clipData() {
        Intent intent = new Intent(Intent.ACTION_RUN);
        ArrayList<Integer> types = new ArrayList<>();
        types.add(0);
        types.add(1);
        intent.putIntegerArrayListExtra(DragDropGestureHandler.KEY_TYPE, types);
        intent.putExtra(DragDropGestureHandler.KEY_SOURCE_APP, "hello");
        return new ClipData(DragDropGestureHandler.DRAG_EVENT_NAME, DragDropGestureHandler.DRAG_EVENT_MIME_TYPES, new ClipData.Item(intent));
    }

    static DragEvent obtain(DragEvent event, int action, float x, float y, boolean result) {
        Parcel parcel = Parcel.obtain();
        event.writeToParcel(parcel, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
        parcel.appendFrom(parcel, 0, parcel.dataSize());
        parcel.setDataPosition(0);
        parcel.writeInt(action);
        parcel.writeFloat(x);
        parcel.writeFloat(y);
        parcel.writeInt(result ? 1 : 0);
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



}
