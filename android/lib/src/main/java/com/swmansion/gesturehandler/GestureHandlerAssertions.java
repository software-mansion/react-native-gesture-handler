package com.swmansion.gesturehandler;

public interface GestureHandlerAssertions<T extends GestureHandler> {
    boolean assertTrue(T handler);
}
