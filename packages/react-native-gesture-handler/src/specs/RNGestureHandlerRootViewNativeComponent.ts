import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  moduleId: Int32;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerRootView');
