module.exports = {
  docs: {
    Basics: [
      'introduction',
      'quickstart/quickstart',
      'example',
    ],
    'API reference': [
      {
        Gestures: [
          'api/gestures/gesture-detector',
        ],
        Components: [
          'api/components/buttons',
          'api/components/swipeable',
          'api/components/touchables',
          'api/components/drawer-layout',
        ],
      },
    ],
    'Gesture handlers': [
      {
        Basics: [
          'gesture-handlers/basics/about-handlers',
          'gesture-handlers/basics/state',
          'gesture-handlers/basics/interactions',
        ],
        'API reference': [
          'gesture-handlers/api/common-gh',
          'gesture-handlers/api/pan-gh',
          'gesture-handlers/api/tap-gh',
          'gesture-handlers/api/longpress-gh',
          'gesture-handlers/api/rotation-gh',
          'gesture-handlers/api/fling-gh',
          'gesture-handlers/api/pinch-gh',
          'gesture-handlers/api/force-gh',
          'gesture-handlers/api/nativeview-gh',
          'gesture-handlers/api/create-native-wrapper'
        ],
      }
    ],
    Other: ['contributing', 'troubleshooting', 'resources', 'credits'],
  },
};
