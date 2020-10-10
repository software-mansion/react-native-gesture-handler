package com.swmansion.gesturehandler;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipDescription;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.SystemClock;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragGestureUtils {

    public static final String DRAG_EVENT_NAME = "GESTURE_HANDLER_DRAG_EVENT";
    public static final String DRAG_MIME_TYPE = "GESTURE_HANDLER_CLIP_DATA";

    public static final String KEY_DATA = "data";
    public static final String KEY_SOURCE_APP = "sourceAppID";
    public static final String KEY_DRAG_TARGET = "dragTarget";
    public static final String KEY_DROP_TARGET = "dropTarget";
    public static final String KEY_TYPES = "types";
    public static final int DRAG_MODE_MOVE = 0;
    public static final int DRAG_MODE_MOVE_RESTORE = 1;
    public static final int DRAG_MODE_COPY = 2;
    public static final int DRAG_MODE_NONE = 3;

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

    static class DragEventBroadcastManager {

        private final Context mContext;
        private final ArrayList<BroadcastReceiver> mReceivers = new ArrayList<>();

        DragEventBroadcastManager(Context context) {
            mContext = context;
        }

        DragEventBroadcastManager(Context context, BroadcastReceiver receiver) {
            mContext = context;
            register(receiver);
        }

        void broadcast(DragEvent event, DropGestureHandler handler) {
            DragEventBroadcast eventBroadcast = new DragEventBroadcast(mContext, event, handler);
            if (eventBroadcast.shouldBroadcastEvent()) {
                eventBroadcast.broadcast();
            }
        }

        @Nullable
        DragEventBroadcast obtain(Intent intent) {
            if (intent.getAction() != null && intent.getAction().contains(DragEventBroadcast.INTENT_ACTION)) {
                DragEventBroadcast eventBroadcast = new DragEventBroadcast(mContext);
                eventBroadcast.action = intent.getIntExtra(DragEventBroadcast.KEY_ACTION, DragEvent.ACTION_DRAG_EXITED);
                eventBroadcast.dropTargetID = intent.getIntExtra(DragEventBroadcast.KEY_DROP_HANDLER_ID, View.NO_ID);
                eventBroadcast.sourcePackageName = mContext.getPackageName();
                eventBroadcast.targetPackageName = intent.getStringExtra(DragEventBroadcast.KEY_TARGET_PACKAGE_NAME);
                return eventBroadcast;
            }
            return null;
        }

        void register(BroadcastReceiver receiver) {
            if (!mReceivers.contains(receiver)) {
                IntentFilter filter = new IntentFilter();
                filter.addAction(DragEventBroadcast.INTENT_ACTION);
                mContext.registerReceiver(receiver, filter);
                mReceivers.add(receiver);
            }
        }

        void unregister(BroadcastReceiver receiver) {
            if (mReceivers.contains(receiver)) {
                mReceivers.remove(receiver);
                safeUnregister(receiver);
            }
        }

        void unregisterAll() {
            for(BroadcastReceiver receiver : mReceivers) {
                safeUnregister(receiver);
            }
            mReceivers.clear();
        }

        private void safeUnregister(BroadcastReceiver receiver) {
          try {
            mContext.unregisterReceiver(receiver);
          } catch (Throwable throwable) {
            throwable.printStackTrace();
          }
        }
    }

    static class DragEventBroadcast {

        static final String KEY_ACTION = "action";
        static final String KEY_DROP_HANDLER_ID = "dropTargetID";
        static final String KEY_TARGET_PACKAGE_NAME = "targetPackageName";
        private static final String PACKAGE_NAME = "com.swmansion.gesturehandler";
        static final String INTENT_ACTION = PACKAGE_NAME + "." + DRAG_EVENT_NAME;

        int action;
        int dropTargetID;
        String sourcePackageName;
        String targetPackageName;
        private final Context mContext;

        private DragEventBroadcast(Context context) {
            mContext = context;
        }

        private DragEventBroadcast(Context context, DragEvent event, DropGestureHandler handler) {
            mContext = context;
            action = event.getAction();
            dropTargetID = handler != null ? handler.getDropTarget() : View.NO_ID;
            sourcePackageName = DragGestureUtils.getEventPackageName(event);
            targetPackageName = context.getPackageName();
        }

        private boolean isExternalEvent() {
            return sourcePackageName != null && !sourcePackageName.equals(targetPackageName);
        }

        private boolean isBroadcastAction() {
            return action == DragEvent.ACTION_DRAG_ENTERED || action == DragEvent.ACTION_DRAG_EXITED || action == DragEvent.ACTION_DROP;
        }

        private boolean shouldBroadcastEvent() {
            return isExternalEvent() && isBroadcastAction();
        }

        private void broadcast() {
            Intent intent = new Intent();
            intent.setPackage(sourcePackageName);
            intent.setAction(INTENT_ACTION);
            intent.putExtra(KEY_ACTION, action);
            intent.putExtra(KEY_DROP_HANDLER_ID, dropTargetID);
            intent.putExtra(KEY_TARGET_PACKAGE_NAME, targetPackageName);
            mContext.sendBroadcast(intent, null);
        }
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
