module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Guides',
      items: [
        'introduction',
        'quickstart/quickstart',
        'gesture-composition',
        'manual-gestures/manual-gestures',
        'whats-new',
        'example',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      items: [
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
            'api/gestures/manual-gesture',
            'api/gestures/composed-gestures',
            'api/gestures/touch-events',
            'api/gestures/state-manager',
          ],
          Components: [
            'api/components/buttons',
            'api/components/swipeable',
            'api/components/touchables',
            'api/components/drawer-layout',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Under the hood',
      items: [
        'under-the-hood/states-events',
        'under-the-hood/how-does-it-work',
      ],
    },
    {
      type: 'category',
      label: 'Gesture handlers',
      items: [
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
            'gesture-handlers/api/create-native-wrapper',
          ],
        },
      ],
    },
    { type: 'doc', id: 'contributing' },
    { type: 'doc', id: 'troubleshooting' },
    { type: 'doc', id: 'resources' },
    { type: 'doc', id: 'community' },
  ],
};
