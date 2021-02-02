import { NativeModules } from 'react-native';

type PlatformConstantsType = {
  forceTouchAvailable: boolean;
};

export default NativeModules.PlatformConstants as PlatformConstantsType;
