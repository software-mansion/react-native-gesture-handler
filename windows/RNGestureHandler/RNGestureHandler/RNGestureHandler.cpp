#include "pch.h"
#include "RNGestureHandler.h"

#include <string.h>

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

RNGestureHandlerEventExtraData::RNGestureHandlerEventExtraData() :
    hasTranslationXY(false),
    translationX(0),
    translationY(0),
    hasVelocityXY(false),
    velocityX(0),
    velocityY(0),
    hasRotation(false),
    rotation(0),
    hasVelocity(false),
    velocity(0),
    hasAnchorXY(false),
    anchorX(0),
    anchorY(0),
    hasXY(false),
    x(0),
    y(0),
    hasAbsoluteXY(false),
    absoluteX(0),
    absoluteY(0)
{
}

RNGestureHandler::RNGestureHandler() :
    lastState(RNGestureHandlerState::Undetermined),
    kind(RNGestureHandlerKind::Unknown),
    handlerTag(-1),
    viewTag(-1),
    coalescingKey(0)
{

}

static GestureSettings GenerateGestureSettings(RNGestureHandlerKind kind)
{
    GestureSettings settings{};
    
    switch (kind)
    {
    case RNGestureHandlerKind::PanGesture:
        settings |= GestureSettings::ManipulationTranslateX
            | GestureSettings::ManipulationTranslateY;
        break;
    case RNGestureHandlerKind::RotationGesture:
        settings |= GestureSettings::ManipulationRotate;
        break;
    case RNGestureHandlerKind::FlingGesture:
        settings |= GestureSettings::CrossSlide | GestureSettings::Drag;
        break;
    case RNGestureHandlerKind::PinchGesture:
        settings |= GestureSettings::ManipulationScale;
        break;
    case RNGestureHandlerKind::LongPressGesture:
        settings |= GestureSettings::Hold;
        break;
    case RNGestureHandlerKind::TapGesture:
        settings |= GestureSettings::Tap;
        break;
    }

    return settings;
}

void RNGestureHandler::bindToView(winrt::Windows::UI::Xaml::UIElement element)
{
    recognizer = GestureRecognizer {};
    recognizer.GestureSettings(GenerateGestureSettings(kind));

    // Set up event handlers to respond to gesture recognizer output
    manipulationStartedRevoker = recognizer.ManipulationStarted({ this, &RNGestureHandler::onManipulationStarted });
    manipulationUpdatedRevoker = recognizer.ManipulationUpdated({ this, &RNGestureHandler::onManipulationUpdated });
    manipulationCompletedRevoker = recognizer.ManipulationCompleted({ this, &RNGestureHandler::onManipulationCompleted });

    if (kind == RNGestureHandlerKind::FlingGesture)
    {
        draggingRevoker = recognizer.Dragging({ this, &RNGestureHandler::onDragging });
        crossSlidingRevoker = recognizer.CrossSliding({ this, &RNGestureHandler::onCrossSliding });
    }
    else if (kind == RNGestureHandlerKind::LongPressGesture)
    {
        holdingRevoker = recognizer.Holding({ this, &RNGestureHandler::onHolding });
    }
    else if (kind == RNGestureHandlerKind::TapGesture)
    {
        tappedRevoker = recognizer.Tapped({ this, &RNGestureHandler::onTapped });
    }

    // Set up pointer event handlers. These receive input events that are used by the gesture recognizer.
    pointerPressedRevoker = element.PointerPressed({ this, &RNGestureHandler::onPointerPressed });
    pointerMovedRevoker = element.PointerMoved({ this, &RNGestureHandler::onPointerMoved });
    pointerReleasedRevoker = element.PointerReleased({ this, &RNGestureHandler::onPointerReleased });
    pointerCanceledRevoker = element.PointerCanceled({ this, &RNGestureHandler::onPointerCanceled });
}

void RNGestureHandler::unbindFromView(winrt::Windows::UI::Xaml::UIElement element)
{
    element.PointerPressed(pointerPressedRevoker);
    element.PointerMoved(pointerMovedRevoker);
    element.PointerReleased(pointerReleasedRevoker);
    element.PointerCanceled(pointerCanceledRevoker);

    recognizer.CrossSliding(crossSlidingRevoker);
    recognizer.Dragging(draggingRevoker);
    recognizer.Holding(holdingRevoker);
    recognizer.Tapped(tappedRevoker);

    recognizer.ManipulationStarted(manipulationStartedRevoker);
    recognizer.ManipulationUpdated(manipulationUpdatedRevoker);
    recognizer.ManipulationCompleted(manipulationCompletedRevoker);

    recognizer = nullptr;
    viewTag = -1;
}

void RNGestureHandler::onPointerPressed(winrt::Windows::Foundation::IInspectable const& sender,
    PointerRoutedEventArgs const& e)
{
    VERBOSE_DEBUG("onPointerPressed\n");

    sendEventsInState(RNGestureHandlerState::Began, 0);

    // Set the pointer capture to the element being interacted with so that only it
    // will fire pointer-related events
    UIElement element = sender.as<winrt::Windows::UI::Xaml::UIElement>();
    element.CapturePointer(e.Pointer());

    // Feed the current point into the gesture recognizer as a down event
    recognizer.ProcessDownEvent(e.GetCurrentPoint(element));
}

void RNGestureHandler::onPointerMoved(winrt::Windows::Foundation::IInspectable const& sender,
    PointerRoutedEventArgs const& e)
{
    // Feed the set of points into the gesture recognizer as a move event
    UIElement reference = sender.as<winrt::Windows::UI::Xaml::UIElement>();

    auto points = e.GetIntermediatePoints(reference);

    recognizer.ProcessMoveEvents(points);
}

void RNGestureHandler::onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
    PointerRoutedEventArgs const& e)
{
    VERBOSE_DEBUG("OnPointerReleased\n");

    // Feed the current point into the gesture recognizer as an up event
    UIElement reference = sender.as<winrt::Windows::UI::Xaml::UIElement>();

    recognizer.ProcessUpEvent(e.GetCurrentPoint(reference));

    // Release the pointer
    auto element = reference;
    element.ReleasePointerCapture(e.Pointer());
}

void RNGestureHandler::onPointerCanceled(winrt::Windows::Foundation::IInspectable const& sender,
    PointerRoutedEventArgs const& e)
{
    VERBOSE_DEBUG("OnPointerCanceled\n");

    recognizer.CompleteGesture();

    UIElement element = sender.as<winrt::Windows::UI::Xaml::UIElement>();
    element.ReleasePointerCapture(e.Pointer());

    sendEventsInState(RNGestureHandlerState::Cancelled, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}

void RNGestureHandler::onManipulationStarted(winrt::Windows::Foundation::IInspectable const&,
    ManipulationStartedEventArgs const&)
{
    VERBOSE_DEBUG("onManipulationStarted\n");
}

void RNGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    ManipulationUpdatedEventArgs const&)
{
    VERBOSE_DEBUG("onManipulationUpdated\n");
}

void RNGestureHandler::onManipulationCompleted(winrt::Windows::Foundation::IInspectable const&,
    ManipulationCompletedEventArgs const&)
{
    VERBOSE_DEBUG("onManipulationCompleted\n");
}

void RNGestureHandler::onCrossSliding(winrt::Windows::Foundation::IInspectable const&,
    CrossSlidingEventArgs const&)
{
    VERBOSE_DEBUG("onCrossSliding\n");
}

void RNGestureHandler::onDragging(winrt::Windows::Foundation::IInspectable const&,
    DraggingEventArgs const&)
{
    VERBOSE_DEBUG("onDragging\n");
}

void RNGestureHandler::onHolding(winrt::Windows::Foundation::IInspectable const&,
    HoldingEventArgs const&)
{
    VERBOSE_DEBUG("onHolding\n");
}

void RNGestureHandler::onTapped(winrt::Windows::Foundation::IInspectable const&,
    TappedEventArgs const&)
{
    VERBOSE_DEBUG("onTapped\n");
}

void RNGestureHandler::updateConfig(JSValueObject config)
{
    VERBOSE_DEBUG("updateConfig\n");
}

void RNGestureHandler::sendEventsInState(RNGestureHandlerState state,
    RNGestureHandlerEventExtraData* extraData)
{
    if (state == lastState)
    {
        return;
    }

    RNGestureHandlerEvent event{};
    event.viewTag = viewTag;
    event.handlerTag = handlerTag;
    event.prevState = lastState;
    event.extraData = extraData;

    if (state == RNGestureHandlerState::Active)
    {
        // Generate a unique coalescing-key each time the gesture-handler becomes active. 
        static unsigned int nextEventCoalescingKey = 0;
        coalescingKey = nextEventCoalescingKey++;
    }
    else if (state == RNGestureHandlerState::End && lastState != RNGestureHandlerState::Active)
    {
        event.state = RNGestureHandlerState::Active;
        event.coalescingKey = coalescingKey;
        sendStateChangeEvent(&event);

        lastState = RNGestureHandlerState::Active;
    }

    event.state = state;
    event.prevState = lastState;
    event.coalescingKey = coalescingKey;
    sendStateChangeEvent(&event);

    lastState = state;
}

static void WriteJSEventData(IJSValueWriter const& writer, RNGestureHandlerEvent* event)
{
    writer.WriteObjectBegin();

    writer.WritePropertyName(winrt::to_hstring(L"handlerTag"));
    writer.WriteInt64(event->handlerTag);

    writer.WritePropertyName(winrt::to_hstring(L"state"));
    writer.WriteInt64(static_cast<int>(event->state));

    writer.WritePropertyName(winrt::to_hstring(L"numberOfPointers"));
    writer.WriteInt64(winrt::Windows::Devices::Input::PointerDevice::GetPointerDevices().Size());

    if (event->extraData)
    {
        writer.WritePropertyName(winrt::to_hstring(L"coalescingKey"));
        writer.WriteInt64(event->coalescingKey);
        
        if (event->extraData->hasTranslationXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"translationX"));
            writer.WriteDouble(event->extraData->translationX);

            writer.WritePropertyName(winrt::to_hstring(L"translationY"));
            writer.WriteDouble(event->extraData->translationY);
        }

        if (event->extraData->hasVelocityXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"velocityX"));
            writer.WriteDouble(event->extraData->velocityX);

            writer.WritePropertyName(winrt::to_hstring(L"velocityY"));
            writer.WriteDouble(event->extraData->velocityY);
        }

        if (event->extraData->hasXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"x"));
            writer.WriteDouble(event->extraData->x);

            writer.WritePropertyName(winrt::to_hstring(L"y"));
            writer.WriteDouble(event->extraData->y);
        }

        if (event->extraData->hasAbsoluteXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"absoluteX"));
            writer.WriteDouble(event->extraData->x);

            writer.WritePropertyName(winrt::to_hstring(L"absoluteY"));
            writer.WriteDouble(event->extraData->y);
        }

        if (event->extraData->hasRotation)
        {
            writer.WritePropertyName(winrt::to_hstring(L"rotation"));
            writer.WriteDouble(event->extraData->rotation);
        }

        if (event->extraData->hasVelocity)
        {
            writer.WritePropertyName(winrt::to_hstring(L"velocity"));
            writer.WriteDouble(event->extraData->velocity);
        }

        if (event->extraData->hasAnchorXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"anchorX"));
            writer.WriteDouble(event->extraData->anchorX);

            writer.WritePropertyName(winrt::to_hstring(L"anchorY"));
            writer.WriteDouble(event->extraData->anchorY);
        }

        if (event->extraData->hasScale)
        {
            writer.WritePropertyName(winrt::to_hstring(L"scale"));
            writer.WriteDouble(event->extraData->scale);
        }

        if (event->extraData->hasFocalXY)
        {
            writer.WritePropertyName(winrt::to_hstring(L"focalX"));
            writer.WriteDouble(event->extraData->focalX);

            writer.WritePropertyName(winrt::to_hstring(L"focalY"));
            writer.WriteDouble(event->extraData->focalY);
        }
    }

    writer.WriteObjectEnd();
}

void RNGestureHandler::sendTouchEvent(RNGestureHandlerEvent* event)
{
    XamlUIService uiService = XamlUIService::FromContext(reactContext.Handle());
    DependencyObject instance = uiService.ElementFromReactTag(viewTag);
    if (!instance)
        return;

    FrameworkElement element = instance.try_as<FrameworkElement>();

    reactContext.DispatchEvent(element, L"onGestureHandlerEvent",
        [&](IJSValueWriter const& writer) {
            WriteJSEventData(writer, event);
        }
    );
}

void RNGestureHandler::sendStateChangeEvent(RNGestureHandlerEvent* event)
{
    XamlUIService uiService = XamlUIService::FromContext(reactContext.Handle());
    DependencyObject instance = uiService.ElementFromReactTag(viewTag);
    if (!instance)
        return;

    FrameworkElement element = instance.try_as<FrameworkElement>();

    reactContext.DispatchEvent(element, L"onGestureHandlerStateChange",
        [&](IJSValueWriter const& writer) {
            WriteJSEventData(writer, event);
        }
    );
}