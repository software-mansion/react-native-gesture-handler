#include "pch.h"
#include "RNForceTouchHandler.h"

using namespace winrt::RNGestureHandler;
using namespace winrt::Windows::UI::Input;
using namespace winrt::Windows::UI::Xaml;
using namespace winrt::Windows::UI::Xaml::Controls;
using namespace winrt::Windows::UI::Xaml::Input;

void RNForceTouchGestureHandler::onManipulationUpdated(winrt::Windows::Foundation::IInspectable const&,
    winrt::Windows::UI::Input::ManipulationUpdatedEventArgs const&)
{
    // Not available under UWP.
}
