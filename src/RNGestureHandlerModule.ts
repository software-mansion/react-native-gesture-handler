// Reexport the native module spec used by codegen. The relevant files are inluded on Android
// to ensure the compatibility with the old arch, while iOS doesn't require those at all.

import Module from './specs/NativeRNGestureHandlerModule';
export default Module;

declare const global: {
  _WORKLET_RUNTIME: ArrayBuffer;
};

function tryInstallUIBindings() {
  if (global._WORKLET_RUNTIME) {
    console.log('Installing Gesture Handler UI bindings');
    Module.installUIRuntimeBindings();
  } else {
    setTimeout(() => {
      console.log('Waiting for worklet runtime to be available');
      tryInstallUIBindings();
    }, 1);
  }
}

try {
  require('react-native-reanimated');
  console.log('Reanimated is available');
  tryInstallUIBindings();
} catch (error) {
  console.error("Couldn't install Gesture Handler UI bindings", error);
}
