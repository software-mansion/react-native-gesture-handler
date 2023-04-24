import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  active?: boolean;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerRootView');
