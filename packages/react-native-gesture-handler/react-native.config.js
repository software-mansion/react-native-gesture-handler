module.exports = {
  spm: {
    name: 'RNGestureHandler',
  },
  dependency: {
    platforms: {
      android: {
        // Listing any descriptor disables CLI autodetection, so every one must be here.
        componentDescriptors: [
          'RNGestureHandlerButtonComponentDescriptor',
          'RNGestureHandlerDetectorComponentDescriptor',
          'RNGestureHandlerRootViewComponentDescriptor',
        ],
        cmakeListsPath: './CMakeLists.txt',
      },
    },
  },
};
