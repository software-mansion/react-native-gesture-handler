module.exports = {
  docs: {
    Basics: [
      'introduction',
      'quickstart/quickstart',
      'gesture-composition',
      'example',
    ],
    'API reference': [
      {
        Gestures: [
          'api/gestures/gesture-detector',
          'api/gestures/gesture',
          'api/gestures/pan-gesture',
          'api/gestures/tap-gesture',
          'api/gestures/long-press-gesture',
          'api/gestures/rotation-gesture',
          'api/gestures/pinch-gesture',
          'api/gestures/fling-gesture',
          'api/gestures/force-touch-gesture',
          'api/gestures/native-gesture',
          'api/gestures/composed-gestures',
        ],
        Components: [
          'api/components/buttons',
          'api/components/swipeable',
          'api/components/touchables',
          'api/components/drawer-layout',
        ],
      },
    ],
    'Under the hood': [
      'under-the-hood/states-events',
      'under-the-hood/how-does-it-work',
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
