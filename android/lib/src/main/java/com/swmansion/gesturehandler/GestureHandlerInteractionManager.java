package com.swmansion.gesturehandler;

import android.util.SparseArray;

import androidx.annotation.Nullable;

public class GestureHandlerInteractionManager implements GestureHandlerInteractionController {

    private SparseArray<int[]> mWaitForRelations = new SparseArray<>();
    private SparseArray<int[]> mSimultaneousRelations = new SparseArray<>();

    public void dropRelationsForHandlerWithTag(int handlerTag) {
        mWaitForRelations.remove(handlerTag);
        mSimultaneousRelations.remove(handlerTag);
    }

    public void configureInteractions(GestureHandler handler, @Nullable int[] waitForRelations, @Nullable int[] simultaneousRelations) {
        handler.setInteractionController(this);
        if (waitForRelations != null) {
            mWaitForRelations.put(handler.getTag(), waitForRelations);
        }
        if (simultaneousRelations != null) {
            mSimultaneousRelations.put(handler.getTag(), simultaneousRelations);
        }
    }

    @Override
    public boolean shouldWaitForHandlerFailure(GestureHandler handler, GestureHandler otherHandler) {
        int[] waitForTags = mWaitForRelations.get(handler.getTag());
        if (waitForTags != null) {
            for (int i = 0; i < waitForTags.length; i++) {
                if (waitForTags[i] == otherHandler.getTag()) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public boolean shouldRequireHandlerToWaitForFailure(GestureHandler handler,
                                                        GestureHandler otherHandler) {
        return false;
    }

    @Override
    public boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler otherHandler) {
        return false;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler,
                                                 GestureHandler otherHandler) {
        int[] simultHandlerTags = mSimultaneousRelations.get(handler.getTag());
        if (simultHandlerTags != null) {
            for (int i = 0; i < simultHandlerTags.length; i++) {
                if (simultHandlerTags[i] == otherHandler.getTag()) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public int[] getSimultaneousRelations(GestureHandler handler) {
        return mSimultaneousRelations.get(handler.getTag(), new int[0]);
    }

    public void reset() {
        mWaitForRelations.clear();
        mSimultaneousRelations.clear();
    }
}
