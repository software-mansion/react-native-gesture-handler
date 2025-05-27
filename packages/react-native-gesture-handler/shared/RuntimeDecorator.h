#pragma once

namespace gesturehandler {
    using namespace facebook;
    using namespace facebook::react;

    class RuntimeDecorator {
    public:
        static void installJSRuntimeBindings(jsi::Runtime& rnRuntime, std::function<void(int, int)>&& setGestureState);
        static bool installUIRuntimeBindings(jsi::Runtime& rnRuntime, std::function<void(int, int)>&& setGestureState);
    };
} // namespace gesturehandler
