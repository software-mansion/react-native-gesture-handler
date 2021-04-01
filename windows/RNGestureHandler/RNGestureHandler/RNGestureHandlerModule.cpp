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
        static_cast<int>(RNGestureHandlerDirection::Right),
        static_cast<int>(RNGestureHandlerDirection::Left),
        static_cast<int>(RNGestureHandlerDirection::Up),
        static_cast<int>(RNGestureHandlerDirection::Down)
    };
    provider.Add(L"Directions", directions);
}

static RNGestureHandler* getHandlerFromName(std::string handlerName) noexcept
{
    if (handlerName == "FlingGestureHandler")
    {
        return new RNFlingGestureHandler();
    }
    else if (handlerName == "ForceTouchGestureHandler")
    {
        return new RNForceTouchGestureHandler();
    }
    else if (handlerName == "LongPressGestureHandler")
    {
        return new RNLongPressGestureHandler();
    }
    else if (handlerName == "PanGestureHandler")
    {
        return new RNPanGestureHandler();
    }
    else if (handlerName == "PinchGestureHandler")
    {
        return new RNPinchGestureHandler();
    }
    else if (handlerName == "RotationGestureHandler")
    {
        return new RNRotationGestureHandler();
    }
    else if (handlerName == "TapGestureHandler")
    {
        return new RNTapGestureHandler();
    }
    else
    {
        return nullptr;
    }
}

void RNGestureHandlerModule::CreateGestureHandler(std::string handlerName, int handlerTag,
    JSValueObject config) noexcept
{
    RNGestureHandler* handler = getHandlerFromName(handlerName);
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
