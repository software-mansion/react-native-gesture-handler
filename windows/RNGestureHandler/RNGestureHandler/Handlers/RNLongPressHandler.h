#pragma once

#include "../RNGestureHandler.h"

namespace winrt::RNGestureHandler
{
    struct RNLongPressGestureHandler : RNGestureHandler
    {
        void onHolding(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::HoldingEventArgs const& e) override;

        void onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e) override;
    };
}
