#include "pch.h"
#include "RNGestureHandlerModule.h"
#include "Handlers/RNFlingHandler.h"
#include "Handlers/RNForceTouchHandler.h"
#include "Handlers/RNLongPressHandler.h"
#include "Handlers/RNPanHandler.h"
#include "Handlers/RNPinchHandler.h"
#include "Handlers/RNRotationHandler.h"
#include "Handlers/RNTapHandler.h"

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Xaml;

void RNGestureHandlerModule::Init(React::ReactContext const& _reactContext) noexcept
{
    reactContext = _reactContext;
}

void RNGestureHandlerModule::GetConstantProvider(ReactConstantProvider& provider) noexcept
{
    JSValueArray directions
    {
        (int)RNGestureHandlerDirection::Right,
        (int)RNGestureHandlerDirection::Left,
        (int)RNGestureHandlerDirection::Up,
        (int)RNGestureHandlerDirection::Down
    };
    provider.Add(L"Directions", directions);
}

static RNGestureHandlerKind getHandlerKind(std::string handlerName) noexcept
{
    if (handlerName == "FlingGestureHandler")
    {
        return RNGestureHandlerKind::FlingGesture;
    }
    else if (handlerName == "ForceTouchGestureHandler")
    {
        return RNGestureHandlerKind::ForceTouchGesture;
    }
    else if (handlerName == "LongPressGestureHandler")
    {
        return RNGestureHandlerKind::LongPressGesture;
    }
    else if (handlerName == "PanGestureHandler")
    {
        return RNGestureHandlerKind::PanGesture;
    }
    else if (handlerName == "PinchGestureHandler")
    {
        return RNGestureHandlerKind::PinchGesture;
    }
    else if (handlerName == "RotationGestureHandler")
    {
        return RNGestureHandlerKind::RotationGesture;
    }
    else if (handlerName == "TapGestureHandler")
    {
        return RNGestureHandlerKind::TapGesture;
    }
    else
    {
        return RNGestureHandlerKind::Unknown;
    }
}

void RNGestureHandlerModule::CreateGestureHandler(std::string handlerName, int handlerTag,
    JSValueObject config) noexcept
{
    RNGestureHandlerKind handlerKind = getHandlerKind(handlerName);
    RNGestureHandler* handler = nullptr;
    switch (handlerKind)
    {
    case RNGestureHandlerKind::FlingGesture:
    {
        handler = new RNFlingGestureHandler();
        break;
    }
    case RNGestureHandlerKind::ForceTouchGesture:
    {
        handler = new RNForceTouchGestureHandler();
        break;
    }
    case RNGestureHandlerKind::LongPressGesture:
    {
        handler = new RNLongPressGestureHandler();
        break;
    }
    case RNGestureHandlerKind::PanGesture:
    {
        handler = new RNPanGestureHandler();
        break;
    }
    case RNGestureHandlerKind::PinchGesture:
    {
        handler = new RNPinchGestureHandler();
        break;
    }
    case RNGestureHandlerKind::RotationGesture:
    {
        handler = new RNRotationGestureHandler();
        break;
    }
    case RNGestureHandlerKind::TapGesture:
    {
        handler = new RNTapGestureHandler();
        break;
    }
    }

    if (!handler)
    {
        return;
    }

    handler->kind = handlerKind;
    handler->reactContext = reactContext;
    handler->lastState = RNGestureHandlerState::Undetermined;
    handler->handlerTag = handlerTag;

    gestureRegistry.registerHandler(handler);
}

void RNGestureHandlerModule::AttachGestureHandler(int handlerTag, int viewTag) noexcept
{
    XamlUIService uiService = XamlUIService::FromContext(reactContext.Handle());
    DependencyObject instance = uiService.ElementFromReactTag(viewTag);
    if (!instance)
    {
        return;
    }

    UIElement element = instance.as<UIElement>();
    if (!gestureRegistry.attachHandlerToView(handlerTag, element))
    {
        return;
    }

    RNGestureHandler* handler = gestureRegistry.getHandler(handlerTag);
    handler->viewTag = viewTag;
}

void RNGestureHandlerModule::UpdateGestureHandler(int handlerTag, JSValueObject config) noexcept
{
    RNGestureHandler* handler = gestureRegistry.getHandler(handlerTag);
    if (!handler)
    {
        return;
    }

    handler->updateConfig(std::move(config));
}

void RNGestureHandlerModule::DropGestureHandler(int handlerTag) noexcept
{
    RNGestureHandler* handler = gestureRegistry.getHandler(handlerTag);
    if (!handler)
    {
        return;
    }

    gestureRegistry.detachHandler(handler);
    gestureRegistry.dropHandler(handler->handlerTag);
}
