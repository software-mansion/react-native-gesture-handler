export default {
  expo: {
    name: 'ExpoExample',
    slug: 'ExpoExample',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#F8F9FF',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.example.ExpoExample',
      buildNumber: '1',
    },
    android: {
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F8F9FF',
      },
      edgeToEdgeEnabled: true,
      package: 'com.example.ExpoExample',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'Allow RNGH example to access your camera',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './node_modules/@swmansion/icons/fonts/broken/swm-icons-broken.ttf',
            './node_modules/@swmansion/icons/fonts/outline/swm-icons-outline.ttf',
            './node_modules/@swmansion/icons/fonts/curved/swm-icons-curved.ttf',
          ],
        },
      ],
    ],
  },
};
