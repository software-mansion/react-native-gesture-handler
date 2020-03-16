package com.swmansion.gesturehandler;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.SparseArray;
import android.view.DragEvent;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.view.DragAndDropPermissionsCompat;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.isProgressEvent;

public class DropGestureHandler<T, M> extends DragDropGestureHandler<T, M, DropGestureHandler<T, M>> {

    private @Nullable DragGestureHandler<T, M> mDragHandler;
    private int mDragAction;
    private boolean mResult;
    private boolean mPointerState = false;
    private boolean mShouldCancelNext = false;
    private boolean mAwaitingCancellation = false;
    private String mLastEventData;
    private String mLastSourceAppID;
    boolean mIsActiveDropHandler = false;

    public DropGestureHandler(Context context) {
        super(context);
    }

    @Override
    public M getData() throws JSONException {
        if (mLastEventData != null && mDataResolver != null) {
            JSONObject jsonObject = new JSONObject(mLastEventData);
            SparseArray<String> out = new SparseArray<>();
            Iterator<String> iterator = jsonObject.keys();
            while (iterator.hasNext()) {
                String key = iterator.next();
                Object value = jsonObject.get(key);
                out.put(Integer.valueOf(key), (String)value);
            }
            return mDataResolver.parse(out);
        } else {
            return null;
        }
    }

    @Override
    public int getDragTarget() {
        return mDragHandler != null && mDragHandler.getView() != null ?
                mDragHandler.getView().getId() : 
                View.NO_ID;
    }

    @Override
    public int getDropTarget() {
        return getView() != null ? getView().getId() : View.NO_ID;
    }

    @Override
    public int getDragAction() {
        return mDragAction;
    }

    public @Nullable DragGestureHandler<T, M> getDragHandler() {
        return mDragHandler;
    }

    public @Nullable String getLastSourceAppID() {
        return mLastSourceAppID;
    }

    public void setDragHandler(@Nullable DragGestureHandler<T, M> dragHandler) {
        mDragHandler = dragHandler;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || handler instanceof DragGestureHandler;
    }

    @Override
    protected boolean shouldActivate() {
        return super.shouldActivate() && mIsActiveDropHandler;
    }

    void tryCancel() {
        if (mShouldCancelNext && !mAwaitingCancellation) {
            cancel();
            mAwaitingCancellation = true;
        }
    }

    /**
     * @param event receives an event with {@link DragGestureHandler} {@link DragEvent} action
     */
    @Override
    protected void onHandle(DragEvent event) {
        if (!mOrchestrator.mIsDragging || !shouldHandleEvent(event)) {
            fail();
            return;
        } else if (mShouldCancelNext) {
            return;
        }

        int action = event.getAction();
        boolean pointerIsInside = isWithinBounds();

        if (isProgressEvent(event)) {
            if (action == DragEvent.ACTION_DROP) {
                if (mIsActive) {
                    mDragAction = DragEvent.ACTION_DROP;
                    mResult = true;
                    DragAndDropPermissionsCompat dropPermissions = null;
                    if (mDataResolver != null && mDataResolver.getActivity() != null) {
                        dropPermissions = ActivityCompat
                                .requestDragAndDropPermissions(mDataResolver.getActivity(), event);
                    }
                    Intent intent = event.getClipData()
                            .getItemAt(0)
                            .getIntent();
                    mLastEventData = intent.getStringExtra(KEY_DATA);
                    mLastSourceAppID = intent.getStringExtra(KEY_SOURCE_APP);
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && dropPermissions != null) {
                        dropPermissions.release();
                    }
                } else {
                    mDragAction = DragEvent.ACTION_DRAG_ENDED;
                }
            } else if (pointerIsInside && !mPointerState) {
                mDragAction = DragEvent.ACTION_DRAG_ENTERED;
            } else if (!pointerIsInside) {
                mDragAction = DragEvent.ACTION_DRAG_EXITED;
            } else {
                mDragAction = DragEvent.ACTION_DRAG_LOCATION;
            }
        } else {
            mDragAction = action;
        }

        mPointerState = pointerIsInside;
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.onHandle(ev);
        DragGestureUtils.recycle(ev);

        if (mDragAction == DragEvent.ACTION_DRAG_EXITED) {
            mShouldCancelNext = true;
        }
    }

    @Override
    void dispatchDragEvent(DragEvent event) {
        DragEvent ev = DragGestureUtils.obtain(mDragAction, getX(), getY(), mResult,
                event.getClipData(), event.getClipDescription());
        super.dispatchDragEvent(ev);
        DragGestureUtils.recycle(ev);
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDragHandler = null;
        mPointerState = false;
        mDragAction = DragEvent.ACTION_DRAG_ENDED;
        mResult = false;
        mShouldCancelNext = false;
        mAwaitingCancellation = false;
        mLastEventData = null;
        mLastSourceAppID = null;
        mIsActiveDropHandler = false;
    }

}
