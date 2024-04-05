import { NativeModules, Platform } from './ReactCompact';

type PlatformConstants = {
  forceTouchAvailable: boolean;
};

export default (NativeModules?.PlatformConstants ??
  Platform.constants) as PlatformConstants;
