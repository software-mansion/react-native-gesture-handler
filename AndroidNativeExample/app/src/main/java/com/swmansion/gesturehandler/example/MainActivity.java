package com.swmansion.gesturehandler.example;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.Toast;

import com.swmansion.gesturehandler.BaseGestureHandlerInteractionController;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionController;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;
import com.swmansion.gesturehandler.GestureHandlerViewWrapper;
import com.swmansion.gesturehandler.LongPressGestureHandler;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.PanGestureHandler;
import com.swmansion.gesturehandler.PinchGestureHandler;
import com.swmansion.gesturehandler.RotationGestureHandler;
import com.swmansion.gesturehandler.TapGestureHandler;

public class MainActivity extends AppCompatActivity {

  private GestureHandlerViewWrapper wrapper;
  private ScrollView scrollView;
  private Button button;
  private SeekBar seekBar;
  private View block;
  private View largeBlock;
  private Switch switchView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    wrapper = (GestureHandlerViewWrapper) findViewById(R.id.wrapper);
    scrollView = (ScrollView) findViewById(R.id.scroll);
    button = (Button) findViewById(R.id.button);
    seekBar = (SeekBar) findViewById(R.id.seekbar);
    block = findViewById(R.id.block);
    largeBlock = findViewById(R.id.large_block);
    switchView = (Switch) findViewById(R.id.switchView);

    // Native click events should work as expected assuming the view is wrapped with
    // NativeViewGestureHandler
    button.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        Toast.makeText(MainActivity.this, "I'm touched", Toast.LENGTH_SHORT).show();
      }
    });

    GestureHandlerRegistryImpl registry = wrapper.getRegistry();

    registry.registerHandlerForView(scrollView, new NativeViewGestureHandler());
    registry.registerHandlerForView(button, new NativeViewGestureHandler());
    registry.registerHandlerForView(seekBar, new NativeViewGestureHandler())
            .setDisallowInterruption(true)
            .setShouldActivateOnStart(true)
            .setShouldCancelWhenOutside(false);
    registry.registerHandlerForView(switchView, new NativeViewGestureHandler())
            .setShouldActivateOnStart(true)
            .setDisallowInterruption(true)
            .setShouldCancelWhenOutside(false)
            .setHitSlop(20);

    registry.registerHandlerForView(block, new LongPressGestureHandler())
            .setOnTouchEventListener(new OnTouchEventListener<LongPressGestureHandler>() {
              @Override
              public void onTouchEvent(LongPressGestureHandler handler, MotionEvent event) {
              }

              @Override
              public void onStateChange(LongPressGestureHandler handler, int newState, int oldState) {
                if (newState == GestureHandler.STATE_ACTIVE) {
                  Toast.makeText(MainActivity.this, "Long press", Toast.LENGTH_SHORT).show();
                }
              }
            });

    registry.registerHandlerForView(block, new TapGestureHandler())
            .setNumberOfTaps(2)
            .setOnTouchEventListener(new OnTouchEventListener<TapGestureHandler>() {
              @Override
              public void onTouchEvent(TapGestureHandler handler, MotionEvent event) {
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
        return handler.getView().equals(largeBlock) && handler instanceof PinchGestureHandler;
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
              public void onStateChange(RotationGestureHandler handler, int newState, int oldState) {
                if (oldState == GestureHandler.STATE_ACTIVE) {
                  mRotation += handler.getRotation();
                }
              }
            });

    registry.registerHandlerForView(largeBlock, new PinchGestureHandler())
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
              public void onStateChange(PinchGestureHandler handler, int newState, int oldState) {
                if (oldState == GestureHandler.STATE_ACTIVE) {
                  mScale *= handler.getScale();
                }
              }
            });

    registry.registerHandlerForView(largeBlock, new PanGestureHandler(this))
            .setMinDy(2)
            .setMaxPointers(1)
            .setOnTouchEventListener(new OnTouchEventListener<PanGestureHandler>() {
              @Override
              public void onTouchEvent(PanGestureHandler handler, MotionEvent event) {
                if (handler.getState() == GestureHandler.STATE_ACTIVE) {
                  largeBlock.setTranslationX(handler.getTranslationX());
                  largeBlock.setTranslationY(handler.getTranslationY());
                }
              }

              @Override
              public void onStateChange(PanGestureHandler handler, int newState, int oldState) {
              }
            });
  }
}
