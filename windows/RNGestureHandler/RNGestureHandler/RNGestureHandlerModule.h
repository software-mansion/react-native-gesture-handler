#pragma once

#include "pch.h"
#include "NativeModules.h"
#include "RNGestureRegistry.h"

using namespace winrt::Microsoft::ReactNative;

#ifdef RNW61
#define JSVALUEOBJECTPARAMETER
#else
#define JSVALUEOBJECTPARAMETER const &
#endif

namespace winrt::RNGestureHandler
{
    enum class RNGestureHandlerDirection
    {
        Right = 1,
        Left = 2,
        Up = 4,
        Down = 8,
    };

    REACT_MODULE(RNGestureHandlerModule, L"RNGestureHandlerModule");
    struct RNGestureHandlerModule
    {
        const std::string Name = "RNGestureHandlerModule";

        React::ReactContext reactContext;
        RNGestureRegistry gestureRegistry;
        winrt::Windows::UI::Input::GestureRecognizer recognizer;

        REACT_INIT(Init);
        void Init(React::ReactContext const& reactContext) noexcept;

        REACT_METHOD(CreateGestureHandler, L"createGestureHandler")
            void CreateGestureHandler(std::string handlerName, int handlerTag, JSValueObject config) noexcept;

        REACT_METHOD(AttachGestureHandler, L"attachGestureHandler")
            void AttachGestureHandler(int handlerTag, int viewTag) noexcept;

        REACT_METHOD(UpdateGestureHandler, L"updateGestureHandler")
            void UpdateGestureHandler(int handlerTag, JSValueObject config) noexcept;

        REACT_METHOD(DropGestureHandler, L"dropGestureHandler")
            void DropGestureHandler(int handlerTag) noexcept;

        REACT_CONSTANT_PROVIDER(GetConstantProvider)
            void GetConstantProvider(ReactConstantProvider& provider) noexcept;
    };
}
