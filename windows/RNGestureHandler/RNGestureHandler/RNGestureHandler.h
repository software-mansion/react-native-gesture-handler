#pragma once

#include "pch.h"
#include "NativeModules.h"
#include "RNGestureRegistry.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::RNGestureHandler
{
    // In sync with react-native-gesture-handler/src/State.ts
    enum class RNGestureHandlerState
    {
        Undetermined = 0,
        Failed = 1,
        Began = 2,
        Cancelled = 3,
        Active = 4,
        End = 5,
    };

    struct RNGestureHandlerEventExtraData
    {
        RNGestureHandlerEventExtraData();

        // Pan-specific
        bool hasTranslationXY;
        float translationX;
        float translationY;

        bool hasVelocityXY;
        float velocityX;
        float velocityY;

        // Rotation/Pinch-specific
        bool hasRotation;
        float rotation;

        bool hasVelocity;
        float velocity;

        bool hasAnchorXY;
        float anchorX;
        float anchorY;

        // LongPress/Pan/Tap-specific
        bool hasXY;
        float x;
        float y;

        bool hasAbsoluteXY;
        float absoluteX;
        float absoluteY;

        // Pinch-specific
        bool hasScale;
        float scale;

        bool hasFocalXY;
        float focalX;
        float focalY;
    };

    struct RNGestureHandlerEvent
    {
        int viewTag;
        int handlerTag;
        RNGestureHandlerState prevState, state;
        RNGestureHandlerEventExtraData* extraData;
        unsigned int coalescingKey;
    };
    
    enum class RNGestureHandlerKind
    {
        FlingGesture,
        ForceTouchGesture,
        LongPressGesture,
        PanGesture,
        PinchGesture,
        RotationGesture,
        TapGesture,
        Unknown
    };

    struct RNGestureHandler
    {
        RNGestureHandler();

        RNGestureHandlerKind kind;
        int handlerTag;
        int viewTag;
        int coalescingKey;
        winrt::Windows::UI::Input::GestureRecognizer recognizer;
        RNGestureHandlerState lastState;
        React::ReactContext reactContext;

        virtual void updateConfig(JSValueObject config);

        void bindToView(winrt::Windows::UI::Xaml::UIElement view);
        void unbindFromView(winrt::Windows::UI::Xaml::UIElement view);

        void sendEventsInState(RNGestureHandlerState state, RNGestureHandlerEventExtraData* extraData);
        void sendTouchEvent(RNGestureHandlerEvent* event);
        void sendStateChangeEvent(RNGestureHandlerEvent* event);

        // Route the pointer pressed event to the gesture recognizer.
        // The points are in the reference frame of the canvas that contains the rectangle element.
        void onPointerPressed(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e);

        // Route the pointer moved event to the gesture recognizer.
        // The points are in the reference frame of the canvas that contains the rectangle element.
        void onPointerMoved(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e);

        // Route the pointer released event to the gesture recognizer.
        // The points are in the reference frame of the canvas that contains the rectangle element.
        virtual void onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e);

        // Route the pointer canceled event to the gesture recognizer.
        // The points are in the reference frame of the canvas that contains the rectangle element.
        void onPointerCanceled(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e);

        void onManipulationStarted(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::ManipulationStartedEventArgs const& e);

        virtual void onManipulationUpdated(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e);

        virtual void onManipulationCompleted(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::ManipulationCompletedEventArgs const& e);

        virtual void onCrossSliding(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::CrossSlidingEventArgs const& e);

        virtual void onDragging(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::DraggingEventArgs const& e);

        virtual void onHolding(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::HoldingEventArgs const& e);

        virtual void onTapped(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::TappedEventArgs const& e);

        winrt::event_token pointerPressedRevoker;
        winrt::event_token pointerMovedRevoker;
        winrt::event_token pointerReleasedRevoker;
        winrt::event_token pointerCanceledRevoker;

        winrt::event_token crossSlidingRevoker;
        winrt::event_token draggingRevoker;
        winrt::event_token holdingRevoker;
        winrt::event_token tappedRevoker;

        winrt::event_token manipulationStartedRevoker;
        winrt::event_token manipulationUpdatedRevoker;
        winrt::event_token manipulationCompletedRevoker;
    };
}
