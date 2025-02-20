import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  handlerTags: Int32[];
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerDetector', {
  interfaceOnly: true,
});
