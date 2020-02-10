package com.swmansion.gesturehandler;

import android.graphics.PointF;
import android.os.Parcel;
import android.os.Parcelable;
import android.view.DragEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragGestureUtils {
    static DragEvent obtain(DragEvent event, int action, float x, float y) {
        Parcel parcel = Parcel.obtain();
        event.writeToParcel(parcel, Parcelable.PARCELABLE_WRITE_RETURN_VALUE);
        parcel.setDataPosition(0);
        parcel.writeInt(action);
        parcel.writeFloat(x);
        parcel.writeFloat(y);
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
            for (int i = tree.size() - 1; i >= 0; i--) {
                GestureHandlerOrchestrator.transformTouchPointToViewCoords(
                        localPoint.x, localPoint.y,(ViewGroup) tree.get(i), (View) tree.get(i - 1), localPoint);
            }
        }

        return localPoint;
    }
}
