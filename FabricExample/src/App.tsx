import * as React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import OverviewExample from './examples/OverviewExample';
import UltimateExample from './examples/ultimate/UltimateExample';
import ViewFlatteningExample from './examples/ViewFlatteningExample';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="OverviewExample" component={OverviewExample} />
        <Stack.Screen name="UltimateExample" component={UltimateExample} />
        <Stack.Screen
          name="ViewFlatteningExample"
          component={ViewFlatteningExample}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
