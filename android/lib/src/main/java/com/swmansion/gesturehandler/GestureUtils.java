package com.swmansion.gesturehandler;

import android.view.MotionEvent;

public class GestureUtils {
    public static float getLastPointerX(GestureHandlerMotionEventAdapter event, boolean averageTouches) {
        float offset = event.getRawX() - event.getX();
        int excludeIndex = event.getActionMasked() == MotionEvent.ACTION_POINTER_UP ?
                event.getActionIndex() : -1;

        if (averageTouches) {
            float sum = 0f;
            int count = 0;
            for (int i = 0, size = event.getMotionEventPointerCount(); i < size; i++) {
                if (i != excludeIndex && event.containsIndexOfMotionEvent(i)) {
                    sum += event.getX(i) + offset;
                    count++;
                }
            }
            return sum / count;
        } else {
            int lastPointerIdx = event.getMotionEventPointerCount() - 1;
            while (lastPointerIdx == excludeIndex || !event.containsIndexOfMotionEvent(lastPointerIdx)) {
                lastPointerIdx--;
            }
            return event.getX(lastPointerIdx) + offset;
        }
    }

    public static float getLastPointerY(GestureHandlerMotionEventAdapter event, boolean averageTouches) {
        float offset = event.getRawY() - event.getY();
        int excludeIndex = event.getActionMasked() == MotionEvent.ACTION_POINTER_UP ?
                event.getActionIndex() : -1;

        if (averageTouches) {
            float sum = 0f;
            int count = 0;
            for (int i = 0, size = event.getMotionEventPointerCount(); i < size; i++) {
                if (i != excludeIndex && event.containsIndexOfMotionEvent(i)) {
                    sum += event.getY(i) + offset;
                    count++;
                }
            }
            return sum / count;
        } else {
            int lastPointerIdx = event.getMotionEventPointerCount() - 1;
            while (lastPointerIdx == excludeIndex || !event.containsIndexOfMotionEvent(lastPointerIdx)) {
                lastPointerIdx--;
            }
            return event.getY(lastPointerIdx) + offset;
        }
    }
}
