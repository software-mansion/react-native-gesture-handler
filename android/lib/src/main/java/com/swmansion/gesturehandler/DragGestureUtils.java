package com.swmansion.gesturehandler;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipDescription;
import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.SystemClock;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

public class DragGestureUtils {

    public static final String DRAG_EVENT_NAME = "GESTURE_HANDLER_DRAG_EVENT";
    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";

    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceAppID";
    public static final String KEY_DRAG_TARGET = "dragTarget";
    public static final String KEY_DROP_TARGET = "dropTarget";
    public static final String KEY_TYPES = "types";
    public static final int DRAG_MODE_MOVE = 0;
    public static final int DRAG_MODE_COPY = 1;

    static int getFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            return View.DRAG_FLAG_GLOBAL | View.DRAG_FLAG_GLOBAL_URI_READ | View.DRAG_FLAG_GLOBAL_URI_WRITE;
        }
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

    @SuppressLint("PrivateApi")
    static void recycle(DragEvent event) {
        /*
        // commented because of warning
        try {
            Method recycle = DragEvent.class.getDeclaredMethod("recycle");
            recycle.setAccessible(true);
            recycle.invoke(event);
        } catch (Throwable e) {
            e.printStackTrace();
        }
         */
    }

    /**
     *
     * @param event
     * @return true if the {@link DragEvent} does not originate from this library
     */
    static boolean isForeignEvent(DragEvent event) {
        if (event.getClipDescription() != null) {
            String desc;
            for (int i = 0; i < event.getClipDescription().getMimeTypeCount(); i++) {
                desc = event.getClipDescription().getMimeType(i);
                if (desc.contains(DRAG_MIME_TYPE)) {
                    return false;
                }
            }
        }
        return true;
    }

    static @Nullable String getEventPackageName(DragEvent event) {
        if (event.getClipDescription() != null) {
            String desc;
            for (int i = 0; i < event.getClipDescription().getMimeTypeCount(); i++) {
                desc = event.getClipDescription().getMimeType(i);
                if (desc.contains(KEY_SOURCE_APP)) {
                    return desc.split(":")[1];
                }
            }
        }
        return null;
    }

    public static class DerivedMotionEvent {
        private long downTime;

        public void setDownTime() {
            downTime = SystemClock.uptimeMillis();
        }

        public MotionEvent obtain(DragEvent event) {
            int motionAction;
            int dragAction = event.getAction();
            if (dragAction == DragEvent.ACTION_DRAG_STARTED) {
                downTime = SystemClock.uptimeMillis();
                motionAction = MotionEvent.ACTION_MOVE;
            } else if (dragAction == DragEvent.ACTION_DRAG_ENDED || dragAction == DragEvent.ACTION_DROP) {
                motionAction = MotionEvent.ACTION_UP;
            } else {
                motionAction = MotionEvent.ACTION_MOVE;
            }

            return MotionEvent.obtain(
                    downTime,
                    SystemClock.uptimeMillis(),
                    motionAction,
                    event.getX(),
                    event.getY(),
                    0);
        }
    }

    public interface DataResolver<T, S> {
        String stringify(DragGestureHandler<T, S>[] handlers);
        S parse(String sources);
        T data();
        Activity getActivity();
    }

}
