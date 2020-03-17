package com.swmansion.gesturehandler.example;

import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;

import com.swmansion.gesturehandler.DragDropGestureHandler;
import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DragGestureUtils;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

public class DragDropUtil<O extends Object, M extends Object> {
    
    public static class DragGestureHandlerImpl extends DragGestureHandler<String[], ArrayList<DragDataObject>> {
        DragGestureHandlerImpl(Context context) {
            super(context);
        }
    }

    public static class DropGestureHandlerImpl extends DropGestureHandler<String[], ArrayList<DragDataObject>> {
        DropGestureHandlerImpl(Context context) {
            super(context);
        }

    }

    @SuppressWarnings("unchecked cast")
    public static class DragDropEventListener<O extends Object,
            M extends Object,
            T extends DragDropGestureHandler<O, M, T>,
            ME extends DragDropEventListener<O, M, T, ME>>
            implements OnTouchEventListener<T> {

        private HashMap<Integer, Integer> actionToColor = new HashMap<>();
        private HashMap<Object, Integer> stateToColor = new HashMap<>();
        private Integer bgc = null;
        private Integer currentBgc = null;

        ME setColorForAction(int action, int color) {
            actionToColor.put(action, color);
            return (ME) this;
        }

        ME setColorForState(int state, int color) {
            stateToColor.put(state, color);
            return (ME) this;
        }

        ME setColorForState(int state, int oldState, int color) {
            stateToColor.put(state + "," + oldState, color);
            return (ME) this;
        }

        private void setBackgroundColor(View view, int color) {
            if (bgc == null) {
                Drawable background = view.getBackground();
                if (background instanceof ColorDrawable) {
                    bgc = ((ColorDrawable) background).getColor();
                }
            }
            view.setBackgroundColor(color);
            view.invalidate();
            currentBgc = color;
        }

        private String printData(T handler) {
            if (handler instanceof DropGestureHandler) {
                Object d = ((DropGestureHandler) handler).getData();
                String data = d != null ? marshall((ArrayList<DragDataObject>) d) : "";
                return handler + ", " + data;
            } else {
                return "";
            }
        }

        @Override
        public void onTouchEvent(T handler, MotionEvent event) {

        }

        @Override
        public void onDragEvent(T handler, DragEvent event) {
            int action = event.getAction();
            Log.d("Drag", "action " + event.getAction() + ", " + printData(handler));
            if (actionToColor.containsKey(action)) {
                setBackgroundColor(handler.getView(), actionToColor.get(action));
            }
        }

        @Override
        public void onStateChange(T handler, int newState, int oldState) {
            Log.d("Drag", "state " + GestureHandler.stateToString(newState) + " " + handler);
            Integer color = stateToColor.containsKey(newState + ',' + oldState) ?
                    stateToColor.get(newState + ',' + oldState) :
                    stateToColor.containsKey(newState) ?
                            stateToColor.get(newState) :
                            null;
            if (color != null) {
                setBackgroundColor(handler.getView(), color);
            }
        }
    }

    public static class DragEventListenerImpl extends
            DragDropEventListener<String[], ArrayList<DragDataObject>, DragGestureHandlerImpl, DragEventListenerImpl> {

    }

    public static class DropEventListenerImpl extends
            DragDropEventListener<DropGestureHandlerImpl, DropEventListenerImpl> {

    }

    public static String marshall(@NonNull ArrayList<DragDataObject> data) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < data.size(); i++) {
            builder.append(data.get(i).handlerTag);
            builder.append("=");
            for (String datum : data.get(i).data) {
                builder.append(datum);
                builder.append(",");
            }
            if (i < data.size() - 1) {
                builder.append("&");
            }
        }
        return builder.toString();
    }

    public static class DragDataObject {
        int handlerTag;
        String[] data;

        DragDataObject() {

        }

        DragDataObject(int handlerTag, String[] data) {
            this.handlerTag = handlerTag;
            this.data = data;
        }

        DragDataObject(DragGestureHandler<String[], ArrayList<DragDataObject>> handler) {
            this(handler.getTag(), handler.getDataResolver().data());
        }

        DragDataObject(String rawData) {
            this();
            String[] keyVal = rawData.split("=");
            handlerTag = Integer.valueOf(keyVal[0]);
            data = keyVal[1].split(",");
        }

        @NonNull
        @Override
        public String toString() {
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < data.length; i++) {
                builder.append(data[i]);
                if (i < data.length - 1) {
                    builder.append(",");
                }
            }
            return String.format(Locale.ENGLISH, "DragData={handlerTag=%d,data=%s}", handlerTag, builder.toString());
        }
    }

    public static abstract class CustomDataResolver implements DragGestureUtils.DataResolver<String[], ArrayList<DragDataObject>> {

        private String[] mData;

        CustomDataResolver() {
            mData = new String[]{"a","b","c"};
        }

        CustomDataResolver(String[] data) {
            mData = data;
        }

        @Override
        public ArrayList<DragDataObject> parse(String sources) {
            ArrayList<DragDataObject> out = new ArrayList<>();
            for (String source: sources.split("&")) {
                out.add(new DragDataObject(source));
            }
            return out;
        }

        @Override
        public String stringify(DragGestureHandler<String[], ArrayList<DragDataObject>>[] handlers) {
            ArrayList<DragDataObject> data = new ArrayList<>();
            for (DragGestureHandler<String[], ArrayList<DragDataObject>> handler: handlers) {
                data.add(new DragDataObject(handler));
            }
            return marshall(data);
        }

        @Override
        public String[] data() {
            return mData;
        }
    }

}
