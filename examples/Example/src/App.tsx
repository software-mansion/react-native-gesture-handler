import React from 'react';
import { Text, View, StyleSheet, SectionList, Platform } from 'react-native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import DoublePinchRotate from './release_tests/doubleScalePinchAndRotate';
import DoubleDraggable from './release_tests/doubleDraggable';
import { ComboWithGHScroll } from './release_tests/combo';
import { TouchablesIndex, TouchableExample } from './release_tests/touchables';
import Rows from './release_tests/rows';
import NestedGestureHandlerRootViewWithModal from './release_tests/nestedGHRootViewWithModal';
import { PinchableBox } from './recipes/scaleAndRotate';
import PanAndScroll from './recipes/panAndScroll';
import { BottomSheet } from './showcase/bottomSheet';
import Swipeables from './showcase/swipeable';
import ChatHeads from './showcase/chatHeads';
import { DraggableBox } from './basic/draggable';
import MultiTap from './basic/multitap';
import BouncingBox from './basic/bouncing';
import PanResponder from './basic/panResponder';
import HorizontalDrawer from './basic/horizontalDrawer';
import PagerAndDrawer from './basic/pagerAndDrawer';
import ForceTouch from './basic/forcetouch';

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
    sectionTitle: 'Basic examples',
    data: [
      { name: 'Draggable', component: DraggableBox },
      { name: 'Multitap', component: MultiTap },
      { name: 'Bouncing box', component: BouncingBox },
      { name: 'Pan responder', component: PanResponder },
      { name: 'Horizontal drawer', component: HorizontalDrawer },
      { name: 'Pager & drawer', component: PagerAndDrawer },
      { name: 'Force touch', component: ForceTouch },
    ],
  },
  {
    sectionTitle: 'Recipes',
    data: [
      { name: 'Pinch & rotate', component: PinchableBox },
      { name: 'Pan & scroll', component: PanAndScroll },
    ],
  },
  {
    sectionTitle: 'Showcase',
    data: [
      { name: 'Bottom sheet', component: BottomSheet },
      { name: 'Swipeables', component: Swipeables },
      { name: 'Chat heads', component: ChatHeads },
    ],
  },
  {
    sectionTitle: 'Release tests',
    data: [
      {
        name: 'Modals with nested GHRootViews - issue #139',
        component: NestedGestureHandlerRootViewWithModal,
      },
      { name: 'Double pinch & rotate', component: DoublePinchRotate },
      { name: 'Double draggable', component: DoubleDraggable },
      { name: 'Rows', component: Rows },
      { name: 'Combo', component: ComboWithGHScroll },
      { name: 'Touchables', component: TouchablesIndex as React.ComponentType },
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="TouchableExample" component={TouchableExample} />
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
    <RectButton style={[styles.button]} onPress={() => onPressItem(name)}>
      <Text>{name}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
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
  },
  list: {},
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
});
