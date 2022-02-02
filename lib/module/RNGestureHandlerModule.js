import { NativeModules } from 'react-native';
const {
  RNGestureHandlerModule
} = NativeModules;

if (RNGestureHandlerModule == null) {
  console.error(`react-native-gesture-handler module was not found. Make sure you're running your app on the native platform and your code is linked properly (cd ios && pod install && cd ..).

    For installation instructions, please refer to https://docs.swmansion.com/react-native-gesture-handler/docs/#installation`.split('\n').map(line => line.trim()).join('\n'));
}

export default RNGestureHandlerModule;
//# sourceMappingURL=RNGestureHandlerModule.js.map