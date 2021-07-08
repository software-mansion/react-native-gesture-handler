package com.facebook.react.views.modal

import android.view.MotionEvent
import android.view.ViewGroup
import android.view.ViewParent
import com.facebook.react.views.modal.ReactModalHostView.DialogRootViewGroup

/**
 * For handling gestures inside RNGH we need to have access to some methods of
 * `ReactModalHostView.DialogRootViewGroup`. This class is not available outside
 * package so this file exports important features.
 */
object RNGHModalUtils {
    @JvmStatic
    fun dialogRootViewGroupOnChildStartedNativeGesture(modal: ViewGroup, androidEvent: MotionEvent?) {
        (modal as DialogRootViewGroup).onChildStartedNativeGesture(androidEvent)
    }

    @JvmStatic
    fun isDialogRootViewGroup(modal: ViewParent?) = modal is DialogRootViewGroup
}