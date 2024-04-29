import { NativeModules, Platform } from './ReactCompat';

type PlatformConstants = {
  forceTouchAvailable: boolean;
};

export default (NativeModules?.PlatformConstants ??
  Platform.constants) as PlatformConstants;
