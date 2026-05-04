import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStaticNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CompositionNavigation from './compositionNavigation';
import CompetingGesturesScreen from './composition_and_interactions/competingGestures';
import ExclusiveGesturesScreen from './composition_and_interactions/exclusiveGestures';
import RequireToFailScreen from './composition_and_interactions/requireToFail';
import GestureDetectorsNavigation from './gestureDetectorsNavigation';
import InterceptingGestureDetectorScreen from './gestureDetectors/interceptingGestureDetector';
import VirtualGestureDetectorScreen from './gestureDetectors/virtualGestureDetector';
import GesturesNavigation from './gesturesNavigation';
import HomeScreen from './HomeScreen';
import IntegrationNavigation from './integrationNavigation';
import MultipleHandlersScreen from './integration/MultipleHandlers';
import FlingScreen from './gestures/fling';
import HoverScreen from './gestures/hover';
import LongPressScreen from './gestures/long_press';
import PanScreen from './gestures/pan';
import PinchScreen from './gestures/pinch';
import RotationScreen from './gestures/rotation';
import TapScreen from './gestures/tap';

export default function MainNavigation() {
  const RootStack = createNativeStackNavigator({
    screens: {
      Home: {
        screen: HomeScreen,
      },
      'Gesture Tests': {
        screen: GesturesNavigation,
      },
      'Gesture Detectors': {
        screen: GestureDetectorsNavigation,
      },
      'Intercepting Gesture Detector': {
        screen: InterceptingGestureDetectorScreen,
        options: { gestureEnabled: false },
      },
      'Virtual Gesture Detector': {
        screen: VirtualGestureDetectorScreen,
        options: { gestureEnabled: false },
      },
      'Integration Tests': {
        screen: IntegrationNavigation,
      },
      'Composition & Interaction': {
        screen: CompositionNavigation,
      },
      'Competing Gestures': {
        screen: CompetingGesturesScreen,
        options: { gestureEnabled: false },
      },
      'Exclusive Gestures': {
        screen: ExclusiveGesturesScreen,
        options: { gestureEnabled: false },
      },
      Tap: {
        screen: TapScreen,
        options: { gestureEnabled: false },
      },
      Pan: {
        screen: PanScreen,
        options: { gestureEnabled: false },
      },
      Pinch: {
        screen: PinchScreen,
        options: { gestureEnabled: false },
      },
      Rotation: {
        screen: RotationScreen,
        options: { gestureEnabled: false },
      },
      'Long Press': {
        screen: LongPressScreen,
        options: { gestureEnabled: false },
      },
      Fling: {
        screen: FlingScreen,
        options: { gestureEnabled: false },
      },
      Hover: {
        screen: HoverScreen,
        options: { gestureEnabled: false },
      },
      MultipleHandlers: {
        screen: MultipleHandlersScreen,
        options: { gestureEnabled: false },
      },
      'Require to Fail': {
        screen: RequireToFailScreen,
        options: { gestureEnabled: false },
      },
    },
  });

  const Navigation = createStaticNavigation(RootStack);

  const linking = {
    prefixes: ['e2eApp://'],
    screens: {
      Home: '',
      'Gesture Tests': 'gestures',
      'Gesture Detectors': 'gesture-detectors',
      'Intercepting Gesture Detector':
        'gesture-detectors/intercepting-gesture-detector',
      'Virtual Gesture Detector': 'gesture-detectors/virtual-gesture-detector',
      Tap: 'gestures/tap',
      Pan: 'gestures/pan',
      Pinch: 'gestures/pinch',
      Rotation: 'gestures/rotation',
      'Long Press': 'gestures/long-press',
      Fling: 'gestures/fling',
      Hover: 'gestures/hover',
      'Integration Tests': 'integration',
      MultipleHandlers: 'integration/multiple',
      'Composition & Interaction': 'composition-interaction',
      'Competing Gestures': 'composition-interaction/competing-gestures',
      'Exclusive Gestures': 'composition-interaction/exclusive-gestures',
      'Require to Fail': 'composition-interaction/require-to-fail',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation linking={linking} />
    </GestureHandlerRootView>
  );
}
