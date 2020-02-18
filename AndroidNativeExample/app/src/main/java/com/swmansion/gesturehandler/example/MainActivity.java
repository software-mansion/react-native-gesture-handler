package com.swmansion.gesturehandler.example;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.PointF;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.swmansion.gesturehandler.BaseGestureHandlerInteractionController;
import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionController;
import com.swmansion.gesturehandler.GestureHandlerInteractionManager;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;
import com.swmansion.gesturehandler.LongPressGestureHandler;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnDragEventListenerImpl;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.OnTouchEventListenerImpl;
import com.swmansion.gesturehandler.PanGestureHandler;
import com.swmansion.gesturehandler.PinchGestureHandler;
import com.swmansion.gesturehandler.PointerEventsConfig;
import com.swmansion.gesturehandler.RotationGestureHandler;
import com.swmansion.gesturehandler.TapGestureHandler;
import com.swmansion.gesturehandler.ViewConfigurationHelper;

import java.util.ArrayList;
import java.util.HashMap;

import static com.swmansion.gesturehandler.GestureHandler.STATE_END;

public class MainActivity extends Activity {

    private GHRootView wrapper;
    private ScrollView scrollView;
    private Button button;
    private SeekBar seekBar;
    private View block;
    private View largeBlock;
    private View blockChild;
    private Switch switchView;
    private TextView textView;

    //private final RNGestureHandlerRegistry mRegistry = new RNGestureHandlerRegistry();
    private final GestureHandlerRegistryImpl mRegistry = new GestureHandlerRegistryImpl() {
        @Override
        public <T extends GestureHandler> T registerHandlerForView(View view, T handler) {
            handler.setTag((int) (-view.getId() * Math.random()));
            return super.registerHandlerForView(view, handler);
        }
    };
    private GestureHandlerOrchestrator mOrchestrator;
/*
    private RNGestureHandlerInteractionManager mInteractionManager =
            new RNGestureHandlerInteractionManager();
*/

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            //hideSystemUI();
        }
    }

    private void hideSystemUI() {
        // Enables regular immersive mode.
        // For "lean back" mode, remove SYSTEM_UI_FLAG_IMMERSIVE.
        // Or for "sticky immersive," replace it with SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE
                        // Set the content to appear under the system bars so that the
                        // content doesn't resize when the system bars hide and show.
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        // Hide the nav bar and status bar
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    private static boolean isFinished(int state) {
        return state == GestureHandler.STATE_CANCELLED || state == GestureHandler.STATE_FAILED
                || state == GestureHandler.STATE_END;
    }

    private static class DropEventListener implements OnTouchEventListener<DropGestureHandler<Object>> {

        private HashMap<Integer, Integer> actionToColor = new HashMap<>();
        private HashMap<Object, Integer> stateToColor = new HashMap<>();
        private Integer bgc = null;
        private Integer currentBgc = null;

        DropEventListener setColorForAction(int action, int color) {
            actionToColor.put(action, color);
            return this;
        }

        DropEventListener setColorForState(int state, int color) {
            stateToColor.put(state, color);
            return this;
        }

        DropEventListener setColorForState(int state, int oldState, int color) {
            stateToColor.put(state + "," + oldState, color);
            return this;
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

        @Override
        public void onTouchEvent(DropGestureHandler<Object> handler, MotionEvent event) {

        }

        @Override
        public void onDragEvent(DropGestureHandler<Object> handler, DragEvent event) {
            Log.d("Drop", "Drop action " + event.getAction() + ", " + handler);
            int action = event.getAction();
            if (actionToColor.containsKey(action)) {
                //Log.d("DropColor", "onDragEvent: " + actionToColor.get(action) +  "   "+ actionToColor.containsKey(action));
                setBackgroundColor(handler.getView(), actionToColor.get(action));
            }
        }

        @Override
        public void onStateChange(DropGestureHandler<Object> handler, int newState, int oldState) {
            Log.d("Drop", "state " + GestureHandler.stateToString(newState) + " " + handler);
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        wrapper = findViewById(R.id.wrapper);
        scrollView = findViewById(R.id.scroll);
        button = findViewById(R.id.button);
        seekBar = findViewById(R.id.seekbar);
        block = findViewById(R.id.block);
        blockChild = findViewById(R.id.block_child);
        largeBlock = findViewById(R.id.large_block);
        switchView = findViewById(R.id.switchView);

        ArrayList<Integer> dragTypes = new ArrayList<>();
        dragTypes.add(0);
        dragTypes.add(1);

        ArrayList<Integer> dragTypesB = new ArrayList<>();
        dragTypesB.add(3);
        dragTypesB.add(4);

        mOrchestrator = new GestureHandlerOrchestrator(
                wrapper, mRegistry, new ViewConfigurationHelper() {
            @Override
            public PointerEventsConfig getPointerEventsConfigForView(View view) {
                return PointerEventsConfig.AUTO;
            }

            @Override
            public View getChildInDrawingOrderAtIndex(ViewGroup parent, int index) {
                return parent.getChildAt(index);
            }

            @Override
            public boolean isViewClippingChildren(ViewGroup view) {
                return false;
            }

        });
        mOrchestrator.setMinimumAlphaForTraversal(0.1f);
        wrapper.init(mOrchestrator, mRegistry);


        // Native click events should work as expected assuming the view is wrapped with
        // NativeViewGestureHandler
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "I'm touched", Toast.LENGTH_SHORT).show();
            }
        });

        GestureHandlerRegistryImpl registry = mRegistry;
        GestureHandlerInteractionManager interactionManager = new GestureHandlerInteractionManager();

        final GestureHandler panHandler = new PanGestureHandler(this)
                .setMinDist(2)
                .setMaxPointers(1)
                .setShouldCancelWhenOutside(false)
                .setOnTouchEventListener(new OnTouchEventListenerImpl<PanGestureHandler>() {
                    @Override
                    public void onTouchEvent(PanGestureHandler handler, MotionEvent event) {
                        if (handler.getState() == GestureHandler.STATE_ACTIVE) {
                            largeBlock.setTranslationX(handler.getTranslationX());
                            largeBlock.setTranslationY(handler.getTranslationY());
                        }
                    }

                    @Override
                    public void onStateChange(PanGestureHandler handler, int newState, int oldState) {
                        if (newState == STATE_END) {
                            largeBlock.setTranslationX(0);
                            largeBlock.setTranslationY(0);
                        }

                    }

                });

        GestureHandler rotationHandler = new RotationGestureHandler()
                .setOnTouchEventListener(new OnTouchEventListener<RotationGestureHandler>() {

                    private double mRotation = 0f;

                    @Override
                    public void onTouchEvent(RotationGestureHandler handler, MotionEvent event) {
                        if (handler.getState() == GestureHandler.STATE_ACTIVE) {
                            largeBlock.setRotation((float) Math.toDegrees(mRotation + handler.getRotation()));
                        }
                    }

                    @Override
                    public void onDragEvent(RotationGestureHandler handler, DragEvent event) {

                    }

                    @Override
                    public void onStateChange(RotationGestureHandler handler, int newState, int oldState) {
                        if (oldState == GestureHandler.STATE_ACTIVE) {
                            mRotation += handler.getRotation();
                        }
                    }
                });

        GestureHandler pinchHandler = new PinchGestureHandler()
                .setOnTouchEventListener(new OnTouchEventListener<PinchGestureHandler>() {

                    private double mScale = 1f;

                    @Override
                    public void onTouchEvent(PinchGestureHandler handler, MotionEvent event) {
                        if (handler.getState() == GestureHandler.STATE_ACTIVE) {
                            largeBlock.setScaleX((float) (mScale * handler.getScale()));
                            largeBlock.setScaleY((float) (mScale * handler.getScale()));
                        }
                    }

                    @Override
                    public void onDragEvent(PinchGestureHandler handler, DragEvent event) {

                    }

                    @Override
                    public void onStateChange(PinchGestureHandler handler, int newState, int oldState) {
                        if (oldState == GestureHandler.STATE_ACTIVE) {
                            mScale *= handler.getScale();
                        }
                    }
                });

        NativeViewGestureHandler scrollHandler = new NativeViewGestureHandler()
                .setDisallowInterruption(true);

        GestureHandler doubleTapHandler = new TapGestureHandler()
                .setNumberOfTaps(2)
                .setOnTouchEventListener(new OnTouchEventListener<TapGestureHandler>() {
                    @Override
                    public void onTouchEvent(TapGestureHandler handler, MotionEvent event) {
                    }

                    @Override
                    public void onDragEvent(TapGestureHandler handler, DragEvent event) {

                    }

                    @Override
                    public void onStateChange(TapGestureHandler handler, int newState, int oldState) {
                        if (newState == GestureHandler.STATE_ACTIVE) {
                            Toast.makeText(MainActivity.this, "I'm d0able tapped", Toast.LENGTH_SHORT).show();
                        }
                    }
                });

        GestureHandler tapHandler = new TapGestureHandler()
                .setNumberOfTaps(1)
                .setOnTouchEventListener(new OnTouchEventListener<TapGestureHandler>() {
                    @Override
                    public void onTouchEvent(TapGestureHandler handler, MotionEvent event) {
                    }

                    @Override
                    public void onDragEvent(TapGestureHandler handler, DragEvent event) {

                    }

                    @Override
                    public void onStateChange(TapGestureHandler handler, int newState, int oldState) {
                        if (newState == GestureHandler.STATE_ACTIVE) {
                            Toast.makeText(MainActivity.this, "I'm tapped once", Toast.LENGTH_SHORT).show();
                        }
                    }
                });

        GestureHandler longPressHandler = new LongPressGestureHandler(this)
                .setShouldCancelWhenOutside(true)
                .setOnTouchEventListener(new OnTouchEventListener<LongPressGestureHandler>() {
                    @Override
                    public void onTouchEvent(LongPressGestureHandler handler, MotionEvent event) {
                    }

                    @Override
                    public void onDragEvent(LongPressGestureHandler handler, DragEvent event) {

                    }

                    @Override
                    public void onStateChange(LongPressGestureHandler handler, int newState, int oldState) {
                        if (newState == GestureHandler.STATE_ACTIVE) {
                            Toast.makeText(MainActivity.this, "Long press", Toast.LENGTH_SHORT).show();
                        }
                    }
                });

        GestureHandler dragHandler = new DragGestureHandler<>(this)
                .setType(dragTypes)
                .setOnTouchEventListener(new OnDragEventListenerImpl<DragGestureHandler<Object>>() {
                    @Override
                    public void onDragEvent(DragGestureHandler<Object> handler, DragEvent event) {
                        Log.d("Drag", "Drag action " + event.getAction() + ", dropTarget " + handler.getDropTarget() + " " +
                                new PointF(event.getX(), event.getY()));
                        int action = event.getAction();
                        final View view = handler.getView();
                        switch (action) {
                            case DragEvent.ACTION_DRAG_ENTERED:
                                view.setBackgroundColor(Color.BLUE);
                                break;
                            case DragEvent.ACTION_DRAG_LOCATION:
                                break;
                            default:
                                view.setBackgroundColor(Color.RED);
                                break;
                        }
                        view.invalidate();
                    }

                    @Override
                    public void onStateChange(DragGestureHandler<Object> handler, int newState, int oldState) {
                        Log.d("Drag", "onStateChange: " + handler.stateToString(oldState)+" to " + handler.stateToString(newState));
                    }
                });


        //
        registry.registerHandlerForView(scrollView, scrollHandler);
        registry.registerHandlerForView(button, new NativeViewGestureHandler())
                .setShouldActivateOnStart(true);
        registry.registerHandlerForView(seekBar, new NativeViewGestureHandler())
                .setDisallowInterruption(true)
                .setShouldActivateOnStart(true)
                .setShouldCancelWhenOutside(false);
        registry.registerHandlerForView(switchView, new NativeViewGestureHandler())
                .setShouldActivateOnStart(true)
                .setDisallowInterruption(true)
                .setShouldCancelWhenOutside(false)
                .setHitSlop(20);


        registry.registerHandlerForView(block, longPressHandler);
        registry.registerHandlerForView(block, dragHandler);

        registry.registerHandlerForView(scrollView, new DropGestureHandler<>(this))
                .setEnabled(false)
                .setType(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListener()
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.GREEN)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.RED)
                                .setColorForAction(DragEvent.ACTION_DROP, Color.BLUE)
                );

        registry.registerHandlerForView(blockChild, new DropGestureHandler<>(this))
                .setType(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListener()
                        .setColorForState(GestureHandler.STATE_ACTIVE, Color.GREEN)
                        .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.RED)
                        .setColorForAction(DragEvent.ACTION_DROP, Color.BLUE)
                );

        registry.registerHandlerForView(largeBlock, new DropGestureHandler<>(this))
                .setType(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListener()
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.YELLOW)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.BLACK)
                                .setColorForAction(DragEvent.ACTION_DROP, Color.CYAN)
                );


        registry.registerHandlerForView(block, doubleTapHandler);
        registry.registerHandlerForView(block, tapHandler);
        registry.registerHandlerForView(largeBlock, rotationHandler);
        registry.registerHandlerForView(largeBlock, pinchHandler);
        registry.registerHandlerForView(largeBlock, panHandler);

        interactionManager.configureInteractions(panHandler, null,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(rotationHandler, null,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(pinchHandler, null,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(scrollHandler,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()},
                new int[]{dragHandler.getTag()});
        interactionManager.configureInteractions(dragHandler,
                new int[]{tapHandler.getTag(), doubleTapHandler.getTag(), longPressHandler.getTag()},
                new int[]{scrollHandler.getTag()});
        interactionManager.configureInteractions(longPressHandler,
                null, new int[]{dragHandler.getTag()});
        interactionManager.configureInteractions(tapHandler,
                new int[]{doubleTapHandler.getTag(), longPressHandler.getTag()}, null);
        interactionManager.configureInteractions(doubleTapHandler,
                new int[]{longPressHandler.getTag()}, null);
    }
}
