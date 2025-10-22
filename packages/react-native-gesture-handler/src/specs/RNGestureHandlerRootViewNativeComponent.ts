import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';

export interface RootViewNativeProps extends ViewProps {
  unstable_forceActive?: boolean;
}

export default codegenNativeComponent<RootViewNativeProps>(
  'RNGestureHandlerRootView'
);
