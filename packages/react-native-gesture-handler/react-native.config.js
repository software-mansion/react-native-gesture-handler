module.exports = {
  dependency: {
    platforms: {
      android: {
        componentDescriptors: [
          'RNGestureHandlerDetectorComponentDescriptor',
          'RNGestureHandlerButtonWrapperComponentDescriptor',
        ],
        cmakeListsPath: './CMakeLists.txt',
      },
    },
  },
};
