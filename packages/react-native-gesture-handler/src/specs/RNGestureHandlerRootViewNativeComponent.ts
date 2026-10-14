import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

// Publicly accessible type, moduleId is set internally
export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

// @ts-expect-error WithDefault adds null for codegen, unlike ViewProps.pointerEvents.
interface NativeProps extends ViewProps {
  pointerEvents?: CodegenTypes.WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
  moduleId?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerRootView'
) as HostComponent<NativeProps>;
