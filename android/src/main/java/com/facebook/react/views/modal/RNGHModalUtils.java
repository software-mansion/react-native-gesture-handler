package com.facebook.react.views.modal;


import android.view.MotionEvent;
import android.view.ViewGroup;
import android.view.ViewParent;

public class RNGHModalUtils {
    static public void dialogRootViewGroupOnChildStartedNativeGesture(ViewGroup modal, MotionEvent androidEvent) {
        ((ReactModalHostView.DialogRootViewGroup) modal).onChildStartedNativeGesture(androidEvent);
    }

    static public boolean isDialogRootViewGroup(ViewParent modal) {
        return modal instanceof ReactModalHostView.DialogRootViewGroup;
    }

}
