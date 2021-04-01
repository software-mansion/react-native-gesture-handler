#include "pch.h"
#include "RNPinchHandler.h"

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNPinchGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e)
{
    RNGestureHandlerEventExtraData eventData;

    eventData.hasScale = true;
    eventData.scale = e.Cumulative().Scale;

    eventData.hasVelocity = true;
    eventData.velocity = e.Velocities().Expansion;

    eventData.hasFocalXY = true;
    eventData.focalX = e.Position().X;
    eventData.focalY = e.Position().X;

    RNGestureHandlerEvent event{};
    event.viewTag = viewTag;
    event.handlerTag = handlerTag;
    event.state = RNGestureHandlerState::Active;
    event.prevState = lastState;
    event.extraData = &eventData;

    sendEventsInState(RNGestureHandlerState::Active, &eventData);
    sendTouchEvent(&event);
}

void RNPinchGestureHandler::onManipulationCompleted(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationCompletedEventArgs const&)
{
    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}

void RNPinchGestureHandler::onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
    winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e)
{
    RNGestureHandler::onPointerReleased(sender, e);

    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}
