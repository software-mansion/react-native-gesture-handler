import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';

export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

// @ts-expect-error WithDefault adds null for codegen, unlike ViewProps.pointerEvents.
interface NativeProps extends ViewProps {
  pointerEvents?: CodegenTypes.WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerRootView'
) as HostComponent<RootViewNativeProps>;
