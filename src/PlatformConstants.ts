import { NativeModules } from 'react-native';

type PlatformConstants = {
  forceTouchAvailable: boolean;
};

export default NativeModules.PlatformConstants as PlatformConstants;
