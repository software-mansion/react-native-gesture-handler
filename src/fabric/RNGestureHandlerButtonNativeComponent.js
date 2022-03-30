/**
 * @flow strict-local
 * @format
 */
/* eslint-disable */
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent } from 'react-native';
import type { ColorValue } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';
import type {
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

type NativeProps = $ReadOnly<{|
  ...ViewProps, // This is required.
  exclusive?: WithDefault<boolean, true>,
  foreground?: boolean,
  borderless?: boolean,
  enabled?: WithDefault<boolean, true>,
  rippleColor?: ColorValue,
  rippleRadius?: Int32,
|}>;

type ComponentType = HostComponent<NativeProps>;

export default (codegenNativeComponent<NativeProps>(
  'RNGestureHandlerButton',
  {}
): ComponentType);
