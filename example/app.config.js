export default ({ config }) => ({
  ...config,
  name: 'example',
  slug: 'example',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#F8F9FF',
  },
  ios: {
    bundleIdentifier: 'com.example',
    buildNumber: '1',
    supportsTablet: true,
  },
  android: {
    versionCode: 1,
    package: 'com.example',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F8F9FF',
    },
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
  ],
  newArchEnabled: Boolean(Number(process.env.FABRIC_ENABLED)),
});
