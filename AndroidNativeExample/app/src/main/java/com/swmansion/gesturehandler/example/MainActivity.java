package com.swmansion.gesturehandler.example;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Point;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
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

import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DragGestureUtils;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionManager;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;
import com.swmansion.gesturehandler.LongPressGestureHandler;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.OnTouchEventListenerImpl;
import com.swmansion.gesturehandler.PanGestureHandler;
import com.swmansion.gesturehandler.PinchGestureHandler;
import com.swmansion.gesturehandler.PointerEventsConfig;
import com.swmansion.gesturehandler.RotationGestureHandler;
import com.swmansion.gesturehandler.TapGestureHandler;
import com.swmansion.gesturehandler.ViewConfigurationHelper;
import com.swmansion.gesturehandler.example.DragDropUtil.CustomDataResolver;
import com.swmansion.gesturehandler.example.DragDropUtil.DragDataObject;
import com.swmansion.gesturehandler.example.DragDropUtil.DragEventListenerImpl;
import com.swmansion.gesturehandler.example.DragDropUtil.DragGestureHandlerImpl;
import com.swmansion.gesturehandler.example.DragDropUtil.DropEventListenerImpl;
import com.swmansion.gesturehandler.example.DragDropUtil.DropGestureHandlerImpl;

import java.util.ArrayList;
import java.util.Timer;
import java.util.TimerTask;

import static com.swmansion.gesturehandler.GestureHandler.STATE_END;

public class MainActivity extends Activity {

    private GHRootView wrapper;
    private ScrollView scrollView;
    private Button button;
    private SeekBar seekBar;
    private View block;
    private View largeBlock;
    private View blockChild;
    private View blockChild2;
    private Switch switchView;
    private TextView textView;
    private boolean enableShadow = true;
    private final Timer timer = new Timer();

    private final GestureHandlerRegistryImpl mRegistry = new GestureHandlerRegistryImpl() {
        @Override
        public <T extends GestureHandler> T registerHandlerForView(View view, T handler) {
            handler.setTag((int) (-view.getId() * Math.random()));
            return super.registerHandlerForView(view, handler);
        }
    };

    private GestureHandlerOrchestrator mOrchestrator;

    class CustomDragListener extends DragEventListenerImpl {
        private float dy, y = 0;
        private final int height;

        CustomDragListener() {
            DisplayMetrics displayMetrics = new DisplayMetrics();
            getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
            height = displayMetrics.heightPixels;
        }

        @Override
        public void onDragEvent(DragGestureHandler<String[], ArrayList<DragDataObject>> handler, DragEvent event) {
            super.onDragEvent(handler, event);
            boolean scroll = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && MainActivity.this.isInMultiWindowMode()) {
                scroll = false;
            }
            if (event.getAction() == DragEvent.ACTION_DRAG_LOCATION && scroll) {
                if (Math.abs(handler.getLastAbsolutePositionY()) < 100) {
                    dy = Math.max(Math.abs(event.getY() - y), Math.abs(dy));
                    scrollView.smoothScrollBy(0, (int) -dy);
                } else if (Math.abs(height - handler.getLastAbsolutePositionY()) < 100) {
                    dy = Math.max(Math.abs(event.getY() - y), Math.abs(dy));
                    scrollView.smoothScrollBy(0, (int) dy);
                }
            }

            y = event.getY();

            if (!enableShadow) {
                View view = handler.getView();
                view.setTranslationX(handler.getTranslationX() + scrollView.getScrollX());
                view.setTranslationY(handler.getTranslationY() + scrollView.getScrollY());
                if (isFinished(handler.getState())) {
                    view.setTranslationX(0);
                    view.setTranslationY(0);
                }
            }
            if (event.getAction() == DragEvent.ACTION_DROP) {
                assert handler.getDropHandler() != null;
                if (handler.getDropHandler() != null) {
                    Toast.makeText(
                            MainActivity.this,
                            String.format("Dropped %s on %s",
                                    handler.getView().getClass().getSimpleName(),
                                    handler.getDropHandler().getView().getClass().getSimpleName()),
                            Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(
                            MainActivity.this,
                            String.format("Dropped %s in %s",
                                    handler.getView().getClass().getSimpleName(),
                                    handler.getSourceAppID()),
                            Toast.LENGTH_SHORT).show();
                }

            }
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            //hideSystemUI();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        timer.cancel();
        mOrchestrator.tearDown();
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
        blockChild2 = findViewById(R.id.block_child2);
        largeBlock = findViewById(R.id.large_block);
        switchView = findViewById(R.id.switchView);
        final View[] shadows = new View[]{button, switchView, largeBlock, null};

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

        GestureHandlerRegistryImpl registry = mRegistry;
        GestureHandlerInteractionManager interactionManager = new GestureHandlerInteractionManager();

        final GestureHandler panHandler = new PanGestureHandler<>(this)
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

        final DragEventListenerImpl dragEventListener = new CustomDragListener()
                        .setColorForAction(DragEvent.ACTION_DRAG_STARTED, Color.BLUE)
                        .setColorForAction(DragEvent.ACTION_DRAG_ENTERED, Color.MAGENTA)
                        .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.BLACK)
                        .setColorForState(STATE_END, Color.RED);

        final DragEventListenerImpl dragEventListener2 = new CustomDragListener()
                .setColorForAction(DragEvent.ACTION_DRAG_STARTED, Color.CYAN)
                .setColorForAction(DragEvent.ACTION_DRAG_ENTERED, Color.YELLOW)
                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.BLACK)
                .setColorForState(STATE_END, Color.RED);

        final DragGestureHandler dragHandler = new DragGestureHandlerImpl(this)
                .setTypes(dragTypes)
                .setDataResolver(new CustomDataResolver(this, new String[]{"x", "y", "z"}))
                .setOnTouchEventListener(dragEventListener);

        final DragGestureHandler buttonDragHandler = new DragGestureHandlerImpl(this)
                .setOnTouchEventListener(new CustomDragListener()
                        .setColorForAction(DragEvent.ACTION_DRAG_ENTERED, Color.MAGENTA)
                        .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.DKGRAY)
                        .setColorForAction(DragEvent.ACTION_DRAG_ENDED, Color.LTGRAY))
                .setTypes(dragTypes)
                .setDragMode(DragGestureUtils.DRAG_MODE_NONE);

        final DragGestureHandler.MultiDragShadowBuilder.Config config = new DragGestureHandler.MultiDragShadowBuilder.Config();
        buttonDragHandler.setShadowConfig(config);
        config.offset = new Point(300, 150);

        timer.scheduleAtFixedRate(new TimerTask() {
            private int i = 0;
            @Override
            public void run() {
                if (enableShadow) {
                    i++;
                    buttonDragHandler.setShadowBuilderView(shadows[(i + 2)%shadows.length]);
                    dragHandler.setShadowBuilderView(shadows[i%shadows.length]);
                }
            }
        }, 0, 1000);

        // Native click events should work as expected assuming the view is wrapped with
        // NativeViewGestureHandler
        button.setOnClickListener(new View.OnClickListener() {
            private int i = 0;
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "I'm touched", Toast.LENGTH_SHORT).show();
                if (enableShadow) {
                    dragHandler.setShadowBuilderView(shadows[i++%shadows.length]);
                }
                config.offset.y *= -1;
            }
        });
        switchView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                enableShadow = !enableShadow;
                dragHandler.setDragMode(enableShadow ? DragGestureUtils.DRAG_MODE_MOVE_RESTORE : DragGestureUtils.DRAG_MODE_NONE);
                int color = enableShadow ? Color.RED : Color.YELLOW;
                dragEventListener.setColorForState(STATE_END, color);
                block.setBackgroundColor(color);
                block.invalidate();
                config.isRTL = !config.isRTL;
                Toast.makeText(
                        MainActivity.this,
                        enableShadow ? "Drag shadow ENABLED" : "Drag shadow DISABLED",
                        Toast.LENGTH_SHORT
                ).show();
            }
        });

        DropGestureHandler sDropHandler = new DropGestureHandlerImpl(this)
                .setOnTouchEventListener(new DropEventListenerImpl());
        //
        registry.registerHandlerForView(scrollView, scrollHandler)
        .setOnTouchEventListener(new OnTouchEventListenerImpl<NativeViewGestureHandler>() {
            @Override
            public void onTouchEvent(NativeViewGestureHandler handler, MotionEvent event) {
                Log.d("Scroll", "scroll: " + event);
            }

            @Override
            public void onStateChange(NativeViewGestureHandler handler, int newState, int oldState) {
                Log.d("Scroll", "scroll state: " + GestureHandler.stateToString(newState));
            }
        });

        registry.registerHandlerForView(button, new NativeViewGestureHandler())
                .setShouldActivateOnStart(true);
        registry.registerHandlerForView(button, buttonDragHandler);
        registry.registerHandlerForView(button, new DropGestureHandlerImpl(this)
                .setOnTouchEventListener(new DropEventListenerImpl()));


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
/*
        registry.registerHandlerForView(scrollView, new DropGestureHandlerImpl(this))
                .setEnabled(false)
                .setTypes(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListenerImpl()
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.GREEN)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.RED)
                                .setColorForState(GestureHandler.STATE_FAILED, Color.RED)
                                .setColorForAction(DragEvent.ACTION_DROP, Color.BLUE)
                );

 */

        registry.registerHandlerForView(blockChild, new DropGestureHandlerImpl(this))
                .setTypes(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListenerImpl()
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.GREEN)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.RED)
                                .setColorForState(GestureHandler.STATE_FAILED, Color.RED)
                                .setColorForAction(DragEvent.ACTION_DROP, Color.BLUE)
                );

        registry.registerHandlerForView(blockChild2, new DropGestureHandlerImpl(this))
                .setTypes(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListenerImpl() {
                            @Override
                            public void onStateChange(DropGestureHandler<String[], ArrayList<DragDataObject>> handler, int newState, int oldState) {
                                super.onStateChange(handler, newState, oldState);
                                if (newState == STATE_END) {
                                    scrollView.smoothScrollTo(0, 0);
                                }
                            }
                        }
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.GREEN)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.RED)
                                .setColorForState(GestureHandler.STATE_FAILED, Color.RED)
                                .setColorForAction(DragEvent.ACTION_DROP, Color.BLUE)
                );

        registry.registerHandlerForView(largeBlock, new DropGestureHandlerImpl(this))
                .setTypes(dragTypes)
                .setOnTouchEventListener(
                        new DropEventListenerImpl()
                                .setColorForState(GestureHandler.STATE_ACTIVE, Color.YELLOW)
                                .setColorForAction(DragEvent.ACTION_DRAG_EXITED, Color.BLACK)
                                .setColorForState(GestureHandler.STATE_FAILED, Color.BLACK)
                                //.setColorForAction(DragEvent.ACTION_DROP, Color.CYAN)
                                .setColorForState(STATE_END, Color.CYAN)
                );


        registry.registerHandlerForView(block, doubleTapHandler);
        registry.registerHandlerForView(block, tapHandler);
        registry.registerHandlerForView(largeBlock, rotationHandler);
        registry.registerHandlerForView(largeBlock, pinchHandler);
        registry.registerHandlerForView(largeBlock, panHandler);

        interactionManager.configureInteractions(panHandler,
                new int[]{dragHandler.getTag()},
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(rotationHandler, null,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(pinchHandler, null,
                new int[]{panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()});
        interactionManager.configureInteractions(scrollHandler,
                new int[]{dragHandler.getTag(), panHandler.getTag(), rotationHandler.getTag(), pinchHandler.getTag()},
                new int[]{sDropHandler.getTag()});
        interactionManager.configureInteractions(dragHandler,
                new int[]{tapHandler.getTag(), doubleTapHandler.getTag(), longPressHandler.getTag()},
                new int[]{buttonDragHandler.getTag()});
        interactionManager.configureInteractions(longPressHandler,
                null, new int[]{dragHandler.getTag()});
        interactionManager.configureInteractions(tapHandler,
                new int[]{doubleTapHandler.getTag(), longPressHandler.getTag()}, null);
        interactionManager.configureInteractions(doubleTapHandler,
                new int[]{longPressHandler.getTag()}, null);
        interactionManager.configureInteractions(sDropHandler,
                null, new int[]{scrollHandler.getTag()});
    }

}
