import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

// Publicly accessible type, moduleId is set internally
export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

interface NativeProps extends ViewProps {
  moduleId: CodegenTypes.Int32;
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerRootView'
) as HostComponent<NativeProps>;
