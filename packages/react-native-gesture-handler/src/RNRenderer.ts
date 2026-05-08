// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rendererModule: any;

try {
  // React Native >= 0.86 removed `Libraries/Renderer/shims/ReactNative`.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  rendererModule = require('react-native/Libraries/ReactNative/RendererProxy');
} catch {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  rendererModule = require('react-native/Libraries/Renderer/shims/ReactNative');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const RNRenderer = rendererModule.default ?? rendererModule;
