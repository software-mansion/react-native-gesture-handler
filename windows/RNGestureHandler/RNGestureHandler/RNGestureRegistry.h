#pragma once

#include "../RNGestureHandler.h"

namespace winrt::RNGestureHandler
{
    struct RNGestureHandler;

    struct RNGestureRegistry
    {
        void registerHandler(RNGestureHandler* handler);
        RNGestureHandler* getHandler(int handlerTag);
        bool attachHandlerToView(int handlerTag, winrt::Windows::UI::Xaml::UIElement view);
        void detachHandler(RNGestureHandler* handler);
        void dropHandler(int handlerTag);
        void dropAllHandlers();

        // Maps from handler tags to their gesture handler.
        std::unordered_map<int, RNGestureHandler*> handlers;

        // Maps from handler tags to view tags.
        std::unordered_map<int, int> attachedTo;

        // Maps from view tags to a vector of gesture handlers.
        std::unordered_map<int, std::vector<RNGestureHandler*>> handlersForView;
    };
}
