import { codegenNativeComponent } from 'react-native';
import type { HostComponent, ViewProps } from 'react-native';

export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<RootViewNativeProps>(
  'RNGestureHandlerRootView'
) as HostComponent<RootViewNativeProps>;
