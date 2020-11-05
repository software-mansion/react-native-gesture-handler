declare module 'react-native-gesture-handler/DrawerLayout' {
  import * as React from 'react'
  import { Animated, StatusBarAnimation, StyleProp, ViewStyle } from 'react-native';

  export type DrawerPosition = 'left' | 'right';

  export type DrawerState = 'Idle' | 'Dragging' | 'Settling';

  export type DrawerType = 'front' | 'back' | 'slide';

  export type DrawerLockMode = 'unlocked' | 'locked-closed' | 'locked-open';

  export type DrawerKeyboardDismissMode = 'none' | 'on-drag';

  export interface DrawerLayoutProperties {
    renderNavigationView: (
      progressAnimatedValue: Animated.Value
    ) => React.ReactNode;
    drawerPosition?: DrawerPosition;
    drawerWidth?: number;
    drawerBackgroundColor?: string;
    drawerLockMode?: DrawerLockMode;
    keyboardDismissMode?: DrawerKeyboardDismissMode;
    onDrawerClose?: () => void;
    onDrawerOpen?: () => void;
    onDrawerStateChanged?: (
      newState: DrawerState,
      drawerWillShow: boolean
    ) => void;
    useNativeAnimations?: boolean;

    drawerType?: DrawerType;
    edgeWidth?: number;
    minSwipeDistance?: number;
    hideStatusBar?: boolean;
    statusBarAnimation?: StatusBarAnimation;
    overlayColor?: string;
    contentContainerStyle?: StyleProp<ViewStyle>;
    enableTrackpadTwoFingerGesture?: boolean;
  }

  interface DrawerMovementOptionType {
    velocity?: number;
  }

  export default class DrawerLayout extends React.Component<DrawerLayoutProperties> {
    openDrawer: (options?: DrawerMovementOptionType) => void;
    closeDrawer: (options?: DrawerMovementOptionType) => void;
  }
}
