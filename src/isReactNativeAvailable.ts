let isReactNativeWeb: boolean;

try {
  isReactNativeWeb = require('react-native') !== undefined;
} catch {
  isReactNativeWeb = false;
}

export function isReactNativeWebAvailable() {
  return isReactNativeWeb;
}
