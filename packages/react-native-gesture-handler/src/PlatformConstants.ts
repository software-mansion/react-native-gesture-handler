import { NativeModules, Platform } from 'react-native';

type PlatformConstants = {
  forceTouchAvailable?: boolean;
  interfaceIdiom?: string;
  osVersion?: string;
  systemName?: string;
  [key: string]: any;
};

const platformConstants =
  NativeModules && (NativeModules as any).PlatformConstants
    ? (NativeModules as any).PlatformConstants
    : Platform && (Platform as any).constants
      ? (Platform as any).constants
      : {};

export default platformConstants as PlatformConstants;
