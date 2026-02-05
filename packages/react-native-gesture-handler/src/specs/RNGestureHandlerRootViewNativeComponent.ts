import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import type { ViewProps } from 'react-native';

// Publicly accessible type, moduleId is set internally
export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

interface NativeProps extends ViewProps {
  moduleId: Int32;
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<NativeProps>('RNGestureHandlerRootView');
