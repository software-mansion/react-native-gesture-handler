// @ts-ignore TS being TS
import codegenNativeComponentUntyped from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore TS being TS
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps, HostComponent } from 'react-native';
// @ts-ignore TS being TS
import type { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheet';

const codegenNativeComponent = codegenNativeComponentUntyped as <T extends {}>(
  name: string
) => HostComponent<T>;

interface NativeProps extends ViewProps {
  exclusive?: boolean;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: boolean;
  rippleColor?: ColorValue;
  rippleRadius?: Int32;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerButton');
