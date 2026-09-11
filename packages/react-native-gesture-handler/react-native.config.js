module.exports = {
  spm: {
    name: 'RNGestureHandler',
  },
  dependency: {
    platforms: {
      android: {
        componentDescriptors: [
          'RNGestureHandlerDetectorComponentDescriptor',
        ],
        cmakeListsPath: './CMakeLists.txt',
      },
    },
  },
};
