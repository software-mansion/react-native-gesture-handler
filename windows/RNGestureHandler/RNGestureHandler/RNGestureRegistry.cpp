#include "pch.h"
#include "RNGestureHandler.h"
#include "RNGestureRegistry.h"
#include <string.h>

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNGestureRegistry::registerHandler(RNGestureHandler* handler)
{
    if (!handler)
    {
        return;
    }

    if (handlers.find(handler->handlerTag) != handlers.end())
    {
        return;
    }

    handlers[handler->handlerTag] = handler;
}

RNGestureHandler* RNGestureRegistry::getHandler(int handlerTag)
{
    auto handler = handlers.find(handlerTag);
    return handler != handlers.end() ? handler->second : nullptr;
}

bool RNGestureRegistry::attachHandlerToView(int handlerTag, winrt::Windows::UI::Xaml::UIElement view)
{
    RNGestureHandler* handler = getHandler(handlerTag);
    if (!handler)
    {
        return false;
    }

    handler->unbindFromView(view);
    handler->bindToView(view);

    return true;
}

void RNGestureRegistry::detachHandler(RNGestureHandler* handler)
{
    auto viewIt = attachedTo.find(handler->handlerTag);
    if (viewIt == attachedTo.end())
    {
        return;
    }

    int attachedToView = attachedTo[handler->handlerTag];
    attachedTo.erase(handler->handlerTag);

    auto handlersIt = handlersForView.find(attachedToView);
    if (handlersIt != handlersForView.end())
    {
        std::vector<RNGestureHandler*> attachedHandlers = handlersForView[attachedToView];

        attachedHandlers.erase(std::remove(attachedHandlers.begin(), attachedHandlers.end(), handler));
        if (attachedHandlers.size() == 0)
        {
            handlersForView.erase(handlersForView.find(attachedToView));
        }
    }
}

void RNGestureRegistry::dropHandler(int handlerTag)
{
    auto it = handlers.find(handlerTag);
    if (it == handlers.end())
    {
        return;
    }

    handlers.erase(it);
}

void RNGestureRegistry::dropAllHandlers()
{
    handlers.clear();
}
