import * as React from 'react';
import type { FlatListProps } from 'react-native';
import {
  FlatList as RNFlatList,
  ScrollView as RNScrollView,
  Switch as RNSwitch,
  TextInput as RNTextInput,
  View,
} from 'react-native';

import createNativeWrapper from '../createNativeWrapper';

export const ScrollView = createNativeWrapper(RNScrollView, {
  disallowInterruption: false,
});

export const Switch = createNativeWrapper(RNSwitch, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

export const TextInput = createNativeWrapper(RNTextInput);

export const DrawerLayoutAndroid = () => {
  console.warn('DrawerLayoutAndroid is not supported on web!');
  return <View />;
};

// RefreshControl is implemented as a functional component, rendering a View
// NativeViewGestureHandler needs to set a ref on its child, which cannot be done
// on functional components
export const RefreshControl = createNativeWrapper(View);

export const FlatList = React.forwardRef(
  <ItemT,>(props: FlatListProps<ItemT>, ref: any) => (
    <RNFlatList
      ref={ref}
      {...props}
      renderScrollComponent={(scrollProps) => <ScrollView {...scrollProps} />}
    />
  )
);
