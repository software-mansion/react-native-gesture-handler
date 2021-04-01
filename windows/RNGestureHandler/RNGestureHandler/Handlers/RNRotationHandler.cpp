#include "pch.h"
#include "RNRotationHandler.h"

#define _USE_MATH_DEFINES
#include <math.h>

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNRotationGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e)
{
    RNGestureHandlerEventExtraData eventData;

    static const float DEGREE_TO_RADS = (float)M_PI / 180.0f;
    eventData.hasRotation = true;
    eventData.rotation = e.Cumulative().Rotation * DEGREE_TO_RADS;

    eventData.hasVelocity = true;
    eventData.velocity = e.Velocities().Angular;

    eventData.hasAnchorXY = true;
    eventData.anchorX = e.Position().X;
    eventData.anchorY = e.Position().Y;

    RNGestureHandlerEvent event{};
    event.viewTag = viewTag;
    event.handlerTag = handlerTag;
    event.state = RNGestureHandlerState::Active;
    event.prevState = lastState;
    event.extraData = &eventData;

    sendEventsInState(RNGestureHandlerState::Active, &eventData);
    sendTouchEvent(&event);
}

void RNRotationGestureHandler::onManipulationCompleted(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationCompletedEventArgs const&)
{
    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}

void RNRotationGestureHandler::onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
    winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e)
{
    RNGestureHandler::onPointerReleased(sender, e);

    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}
