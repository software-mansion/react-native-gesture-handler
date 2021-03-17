#pragma once

#include "../RNGestureHandler.h"

namespace winrt::RNGestureHandler
{
    struct RNPanGestureHandler : public RNGestureHandler
    {
        void onManipulationUpdated(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const& e) override;

        void onManipulationCompleted(winrt::Windows::Foundation::IInspectable const& sender,
            winrt::Windows::UI::Input::ManipulationCompletedEventArgs const& e) override;
    };
}
