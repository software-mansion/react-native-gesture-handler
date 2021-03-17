#include "pch.h"
#include "RNFlingHandler.h"

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNFlingGestureHandler::sendFlingEvent(winrt::Windows::Foundation::Point pos)
{
    RNGestureHandlerEventExtraData eventData;

    eventData.hasXY = true;
    eventData.x = pos.X;
    eventData.y = pos.Y;

    eventData.hasAbsoluteXY = true;
    eventData.absoluteX = pos.X;
    eventData.absoluteY = pos.Y;

    RNGestureHandlerEvent event{};
    event.viewTag = viewTag;
    event.handlerTag = handlerTag;
    event.state = RNGestureHandlerState::Active;
    event.prevState = lastState;
    event.extraData = &eventData;

    sendEventsInState(RNGestureHandlerState::Active, &eventData);
    sendTouchEvent(&event);
}

void RNFlingGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e)
{
    sendFlingEvent(e.Position());
}

void RNFlingGestureHandler::onCrossSliding(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::CrossSlidingEventArgs const& e)
{
    VERBOSE_DEBUG("onCrossSliding\n");
    switch (e.CrossSlidingState())
    {
    case CrossSlidingState::Completed:
        sendEventsInState(RNGestureHandlerState::End, 0);
        sendEventsInState(RNGestureHandlerState::Undetermined, 0);
        break;
    default:
        sendFlingEvent(e.Position());
        break;
    }
}

void RNFlingGestureHandler::onDragging(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::DraggingEventArgs const& e)
{
    VERBOSE_DEBUG("onDragging\n");
    switch (e.DraggingState())
    {
    case DraggingState::Completed:
        sendEventsInState(RNGestureHandlerState::End, 0);
        sendEventsInState(RNGestureHandlerState::Undetermined, 0);
        break;
    default:
        sendFlingEvent(e.Position());
        break;
    }
}

void RNFlingGestureHandler::onManipulationCompleted(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationCompletedEventArgs const&)
{
    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}

void RNFlingGestureHandler::onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
    winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e)
{
    RNGestureHandler::onPointerReleased(sender, e);

    sendEventsInState(RNGestureHandlerState::End, 0);
    sendEventsInState(RNGestureHandlerState::Undetermined, 0);
}
