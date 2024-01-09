// Reexport the native module spec used by codegen. The relevant files are inluded on Android
// to ensure the compatibility with the old arch, while iOS doesn't require those at all.

import Module from './specs/NativeRNGestureHandlerModule';
export default Module;
