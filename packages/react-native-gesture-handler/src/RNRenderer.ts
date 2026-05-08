/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RNRenderer: any;

try {
  // React Native >= 0.86 removed `Libraries/Renderer/shims/ReactNative`.
  RNRenderer = require('react-native/Libraries/ReactNative/RendererProxy');
} catch (e) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const shim = require('react-native/Libraries/Renderer/shims/ReactNative');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  RNRenderer = shim.default;
}

export { RNRenderer };
