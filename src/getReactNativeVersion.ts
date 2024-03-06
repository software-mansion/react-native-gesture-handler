import pack from 'react-native/package.json';

const [majorStr, minorStr] = pack.version.split('.');
const REACT_NATIVE_VERSION = {
  major: parseInt(majorStr, 10),
  minor: parseInt(minorStr, 10),
};

export function getReactNativeVersion() {
  return REACT_NATIVE_VERSION;
}
