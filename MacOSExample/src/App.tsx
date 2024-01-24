import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SectionList,
  Platform,
  Pressable,
} from 'react-native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Draggable from './basic/draggable';
import PinchableBox from './recipes/scaleAndRotate';
import Tap from './basic/tap';
import NativeViewExample from './basic/nativeview';

interface Example {
  name: string;
  component: React.ComponentType;
}

interface ExamplesSection {
  sectionTitle: string;
  data: Example[];
}

const EXAMPLES: ExamplesSection[] = [
  {
    sectionTitle: 'Examples',
    data: [
      { name: 'Draggable', component: Draggable },
      { name: 'Pinch & rotate', component: PinchableBox },
      { name: 'Tap', component: Tap },
      { name: 'NativeView example', component: NativeViewExample },
    ],
  },
];

type RootStackParamList = {
  Home: undefined;
} & {
  [Screen: string]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            options={{ title: '✌️ Gesture Handler Demo' }}
            component={MainScreen}
          />
          {EXAMPLES.flatMap(({ data }) => data).flatMap(
            ({ name, component }) => (
              <Stack.Screen
                key={name}
                name={name}
                getComponent={() => component}
                options={{ title: name }}
              />
            )
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

function MainScreen({ navigation }: StackScreenProps<ParamListBase>) {
  return (
    <SectionList
      style={styles.list}
      sections={EXAMPLES}
      keyExtractor={(example) => example.name}
      renderItem={({ item }) => (
        <MainScreenItem
          name={item.name}
          onPressItem={(name) => navigation.navigate(name)}
        />
      )}
      renderSectionHeader={({ section: { sectionTitle } }) => (
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

interface MainScreenItemProps {
  name: string;
  onPressItem: (name: string) => void;
}

function MainScreenItem({ name, onPressItem }: MainScreenItemProps) {
  return (
    <Pressable style={[styles.button]} onPress={() => onPressItem(name)}>
      <Text style={styles.text}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sectionTitle: {
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
      },
      android: {
        fontSize: 19,
        fontFamily: 'sans-serif-medium',
      },
    }),
    paddingTop: 10,
    paddingBottom: 5,
    paddingLeft: 10,
    backgroundColor: '#efefef',
    color: 'black',
  },
  separator: {
    height: 2,
  },
  button: {
    flex: 1,
    height: 50,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    color: 'black',
  },
});
