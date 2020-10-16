import { Platform } from 'react-native';

export default NativeModules?.PlatformConstants ?? Platform.constants;
