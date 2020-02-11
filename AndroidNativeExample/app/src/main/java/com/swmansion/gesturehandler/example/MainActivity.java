package com.swmansion.gesturehandler.example;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
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

import com.swmansion.gesturehandler.DragDropGestureHandler;
import com.swmansion.gesturehandler.BaseGestureHandlerInteractionController;
import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionController;
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

import static com.swmansion.gesturehandler.GestureHandler.STATE_END;

public class MainActivity extends Activity {

    private GHRootView wrapper;
    private ScrollView scrollView;
    private Button button;
    private SeekBar seekBar;
    private View block;
    private View largeBlock;
    private Switch switchView;
    private TextView textView;

    //private final RNGestureHandlerRegistry mRegistry = new RNGestureHandlerRegistry();
    private final GestureHandlerRegistryImpl mRegistry = new GestureHandlerRegistryImpl();
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        wrapper = findViewById(R.id.wrapper);
        scrollView = findViewById(R.id.scroll);
        button = findViewById(R.id.button);
        seekBar = findViewById(R.id.seekbar);
        block = findViewById(R.id.block);
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
        registry.registerHandlerForView(scrollView, new NativeViewGestureHandler())
                .setInteractionController(new GestureHandlerInteractionController() {
                    @Override
                    public boolean shouldWaitForHandlerFailure(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }

                    @Override
                    public boolean shouldRequireHandlerToWaitForFailure(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }

                    @Override
                    public boolean shouldRecognizeSimultaneously(GestureHandler handler, GestureHandler otherHandler) {
                        return otherHandler instanceof DragDropGestureHandler || handler instanceof DragDropGestureHandler;
                    }

                    @Override
                    public boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }
                })
                .setShouldActivateOnStart(true);
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

        registry.registerHandlerForView(block, new LongPressGestureHandler(this))
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

        registry.registerHandlerForView(block, new DragGestureHandler<>())
                .setType(dragTypes)
                .setOnTouchEventListener(new OnDragEventListenerImpl<DragGestureHandler<Object>>() {
                    @Override
                    public void onDragEvent(DragGestureHandler<Object> handler, DragEvent event) {
                        Log.d("Drag", "Drag action " + event.getAction() + ", dropTarget " + handler.getDropTarget());
                    }

                    @Override
                    public void onStateChange(DragGestureHandler<Object> handler, int newState, int oldState) {

                    }
                })
                .setInteractionController(new GestureHandlerInteractionController() {
                    @Override
                    public boolean shouldWaitForHandlerFailure(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }

                    @Override
                    public boolean shouldRequireHandlerToWaitForFailure(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }

                    @Override
                    public boolean shouldRecognizeSimultaneously(GestureHandler handler, GestureHandler otherHandler) {
                        return true;//otherHandler.getView() == scrollView;
                    }

                    @Override
                    public boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }
                });

        OnTouchEventListener onDropEventListener = new OnDragEventListenerImpl<DropGestureHandler<Object>>() {
            @Override
            public void onDragEvent(DropGestureHandler<Object> handler, DragEvent event) {
                Log.d("Drop", "Drop action " + event.getAction() + ", dragTarget " + handler.getDragTarget());
                int action = event.getAction();
                final View view = handler.getView();
                switch (action) {
                    case DragEvent.ACTION_DRAG_ENTERED:
                        view.setBackgroundColor(Color.GREEN);
                        break;
                    case DragEvent.ACTION_DRAG_EXITED:
                        view.setBackgroundColor(Color.TRANSPARENT);
                        break;
                    case DragEvent.ACTION_DROP:
                        view.setBackgroundColor(Color.BLUE);
                        break;
                    default:
                        //view.setBackgroundColor(Color.GRAY);
                        break;
                }
                view.invalidate();
            }

            @Override
            public void onStateChange(DropGestureHandler<Object> handler, int newState, int oldState) {
                Log.d("Drop", "state " + GestureHandler.stateToString(newState));
                if (newState == STATE_END) {
                    final View view = handler.getView();
                    view.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            view.setBackgroundColor(Color.parseColor("#c5cae9"));
                        }
                    }, 1000);
                }
            }
        };

        registry.registerHandlerForView(scrollView, new DropGestureHandler<>())
                .setType(dragTypes)
                .setOnTouchEventListener(onDropEventListener);

        registry.registerHandlerForView(largeBlock, new DropGestureHandler<>())
                .setType(dragTypes)
                .setOnTouchEventListener(onDropEventListener);


        registry.registerHandlerForView(block, new TapGestureHandler())
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

        registry.registerHandlerForView(block, new TapGestureHandler())
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

        GestureHandlerInteractionController pinchAndRotateInteractionController =
                new BaseGestureHandlerInteractionController() {
                    @Override
                    public boolean shouldRecognizeSimultaneously(GestureHandler handler,
                                                                 GestureHandler otherHandler) {
                        // Allow pinch and rotate handlers registered for largeBlock to run simultaneously
                        return handler.getView().equals(largeBlock)
                                && (handler instanceof PinchGestureHandler || handler instanceof RotationGestureHandler || handler instanceof PanGestureHandler)
                                && (otherHandler instanceof PinchGestureHandler || otherHandler instanceof RotationGestureHandler || otherHandler instanceof PanGestureHandler);
                    }

                    @Override
                    public boolean shouldHandlerBeCancelledBy(GestureHandler handler, GestureHandler otherHandler) {
                        return false;
                    }

                };

        registry.registerHandlerForView(largeBlock, new RotationGestureHandler())
                .setInteractionController(pinchAndRotateInteractionController)
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

        registry.registerHandlerForView(largeBlock, new PinchGestureHandler())
                .setInteractionController(pinchAndRotateInteractionController)
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

        registry.registerHandlerForView(largeBlock, new PanGestureHandler(this))
                .setMinDist(2)
                .setMaxPointers(1)
                .setShouldCancelWhenOutside(false)
                .setInteractionController(pinchAndRotateInteractionController)
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
    }
}
