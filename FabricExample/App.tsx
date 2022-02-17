import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandler,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {LogBox, StyleSheet, Switch, Text, View} from 'react-native';

import React from 'react';

import ViewFlatteningExample from './ViewFlatteningExample';

declare const _WORKLET: boolean; // from react-native-reanimated

LogBox.ignoreLogs([
  "Seems like you're using an old API with gesture components",
]);

export default ViewFlatteningExample;
