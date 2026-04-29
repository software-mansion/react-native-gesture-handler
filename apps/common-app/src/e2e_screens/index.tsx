import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './HomeScreen';
import GesturesNavigation from './gesturesNavigation';
import IntegrationNavigation from './integrationNavigation';
import CompositionNavigation from './compositionNavigation';
import MultipleHandlersScreen from './integration/MultipleHandlers';
import TapScreen from './gestures/tap';
import PanScreen from './gestures/pan';
import PinchScreen from './gestures/pinch';
import RotationScreen from './gestures/rotation';
import LongPressScreen from './gestures/long_press';
import FlingScreen from './gestures/fling';
import HoverScreen from './gestures/hover';

export default function MainNavigation() {
  const RootStack = createNativeStackNavigator({
    screens: {
      Home: {
        screen: HomeScreen,
      },
      'Gesture Tests': {
        screen: GesturesNavigation,
      },
      'Integration Tests': {
        screen: IntegrationNavigation,
      },
      'Composition & Interaction': {
        screen: CompositionNavigation,
      },
      Tap: {
        screen: TapScreen,
      },
      Pan: {
        screen: PanScreen,
      },
      Pinch: {
        screen: PinchScreen,
      },
      Rotation: {
        screen: RotationScreen,
      },
      'Long Press': {
        screen: LongPressScreen,
      },
      Fling: {
        screen: FlingScreen,
      },
      Hover: {
        screen: HoverScreen,
      },
      MultipleHandlers: {
        screen: MultipleHandlersScreen,
      },
    },
  });

  const Navigation = createStaticNavigation(RootStack);

  const linking = {
    prefixes: ['e2eApp://'],
    screens: {
      Home: '',
      'Gesture Tests': 'gestures',
      Tap: 'gestures/tap',
      Pan: 'gestures/pan',
      Pinch: 'gestures/pinch',
      Rotation: 'gestures/rotation',
      'Long Press': 'gestures/long-press',
      Fling: 'gestures/fling',
      Hover: 'gestures/hover',
      'Integration Tests': 'integration',
      'Composition & Interaction': 'composition-interaction',
      MultipleHandlers: 'integration/multiple',
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation linking={linking} />
    </GestureHandlerRootView>
  );
}
