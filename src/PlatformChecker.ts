import { Platform } from 'react-native';

export function isMacOS(): boolean {
  return Platform.OS === 'macos';
}
