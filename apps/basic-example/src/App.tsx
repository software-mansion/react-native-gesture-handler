import * as React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Navigator from './Navigator';

import Text from './Text';
import NativeDetector from './NativeDetector';
import RuntimeDecoration from './RuntimeDecoration';

const EXAMPLES = [
  {
    name: 'Text',
    component: Text,
  },
  {
    name: 'Runtime Decoration',
    component: RuntimeDecoration,
  },
  {
    name: 'Native Detector',
    component: NativeDetector,
  },
];

const Stack = Navigator.create();
Stack.setRoutes(
  Object.fromEntries(
    EXAMPLES.map((example, index) => [
      example.name.toLowerCase().replace(/\s+/g, ''),
      {
        component: example.component,
        title: example.name,
        rightButtonAction:
          index === EXAMPLES.length - 1
            ? undefined
            : () => {
                Stack.navigateTo(
                  EXAMPLES[index + 1].name.toLowerCase().replace(/\s+/g, '')
                );
              },
      },
    ])
  )
);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[{ flex: 1 }, Platform.OS === 'android' && { paddingTop: 50 }]}>
        <Stack.Navigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
