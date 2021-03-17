#pragma once

#include "../RNGestureHandler.h"

namespace winrt::RNGestureHandler
{
    struct RNTapGestureHandler : RNGestureHandler
    {
        void onTapped(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::TappedEventArgs const& e) override;

        void onPointerReleased(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Xaml::Input::PointerRoutedEventArgs const& e) override;
    };
}
