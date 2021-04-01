#include "pch.h"
#include "RNPanHandler.h"

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNPanGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e)
{
    RNGestureHandlerEventExtraData eventData;

    eventData.hasTranslationXY = true;
    eventData.translationX = e.Cumulative().Translation.X;
    eventData.translationY = e.Cumulative().Translation.Y;

    eventData.hasVelocityXY = true;
    eventData.velocityX = e.Velocities().Linear.X;
    eventData.velocityY = e.Velocities().Linear.Y;

    eventData.hasXY = true;
    eventData.x = e.Position().X;
    eventData.y = e.Position().Y;

    eventData.hasAbsoluteXY = true;
    eventData.absoluteX = e.Position().X;
    eventData.absoluteY = e.Position().Y;

    RNGestureHandlerEvent event{};
    event.viewTag = viewTag;
    event.handlerTag = handlerTag;
    event.state = RNGestureHandlerState::Active;
    event.prevState = lastState;
    event.extraData = &eventData;

    sendEventsInState(RNGestureHandlerState::Active, &eventData);
    sendTouchEvent(&event);
}

void RNPanGestureHandler::onManipulationCompleted(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationCompletedEventArgs const&)
{
    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}