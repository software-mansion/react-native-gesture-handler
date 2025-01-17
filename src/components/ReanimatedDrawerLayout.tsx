// This component is based on RN's DrawerLayoutAndroid API
// It's cross-compatible with all platforms despite
// `DrawerLayoutAndroid` only being available on android

import React, { forwardRef } from 'react';

import { View } from 'react-native';

export enum DrawerPosition {
  LEFT,
  RIGHT,
}

export enum DrawerState {
  IDLE,
  DRAGGING,
  SETTLING,
}

export enum DrawerType {
  FRONT,
  BACK,
  SLIDE,
}

export enum DrawerLockMode {
  UNLOCKED,
  LOCKED_CLOSED,
  LOCKED_OPEN,
}

export enum DrawerKeyboardDismissMode {
  NONE,
  ON_DRAG,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DrawerLayoutProps {}

export type DrawerMovementOption = {
  initialVelocity?: number;
  animationSpeed?: number;
};

export interface DrawerLayoutMethods {
  openDrawer: (options?: DrawerMovementOption) => void;
  closeDrawer: (options?: DrawerMovementOption) => void;
}

const DrawerLayout = forwardRef<DrawerLayoutMethods, DrawerLayoutProps>(
  function DrawerLayout(_props: DrawerLayoutProps, _ref) {
    return <View collapsable={false} />;
  }
);

export default DrawerLayout;
