package com.swmansion.gesturehandler.example;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Toast;

import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerRegistryImpl;
import com.swmansion.gesturehandler.GestureHandlerViewWrapper;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.TapGestureHandler;

public class MainActivity extends AppCompatActivity {

  private GestureHandlerViewWrapper wrapper;
  private ScrollView scrollView;
  private Button button;
  private SeekBar seekBar;
  private View block;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    wrapper = (GestureHandlerViewWrapper) findViewById(R.id.wrapper);
    scrollView = (ScrollView) findViewById(R.id.scroll);
    button = (Button) findViewById(R.id.button);
    seekBar = (SeekBar) findViewById(R.id.seekbar);
    block = findViewById(R.id.block);

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
            .setShouldActivateOnStart(true)
            .setShouldCancelWhenOutside(false);

    registry.registerHandlerForView(block, new TapGestureHandler())
            .setNumberOfTaps(2)
            .setMaxDurationMs(5000)
            .setShouldBeRequiredByOthersToFail(true)
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
            .setMaxDurationMs(5000)
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
//    registry.registerHandlerForView(block, new PanGestureHandler())
//            .setShouldCancelOthersWhenActivated(true)
//            .setMinDy(2)
//            .setCanStartHandlingWithDownEventOnly(true)
//            .setOnTouchEventListener(new OnTouchEventListener<PanGestureHandler>() {
//              @Override
//              public void onTouchEvent(PanGestureHandler handler, MotionEvent event) {
//                if (handler.getState() == GestureHandler.STATE_ACTIVE) {
//                  block.setTranslationX(handler.getTranslationX());
//                  block.setTranslationY(handler.getTranslationY());
//                }
//              }
//
//              @Override
//              public void onStateChange(PanGestureHandler handler, int newState, int oldState) {
//              }
//            });
  }
}
