// @ts-ignore TS being TS
import codegenNativeComponentUntyped from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps, HostComponent } from 'react-native';

const codegenNativeComponent = codegenNativeComponentUntyped as <T extends {}>(
  name: string
) => HostComponent<T>;

interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerRootView');
