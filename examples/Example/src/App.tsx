import React from 'react';
import { Text, View, FlatList, StyleSheet, ScrollView } from 'react-native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';

import Rows from './rows';
import Bouncing from './bouncing';
import Draggable from './draggable';
import Multitap from './multitap';
import ScaleAndRotate from './scaleAndRotate';
import SwipeableTable from './swipeable';
import doubleScalePinchAndRotate from './doubleScalePinchAndRotate';
import PagerAndDrawer from './pagerAndDrawer';
import HorizontalDrawer from './horizontalDrawer';
import PanAndScroll from './panAndScroll';
import Fling from './fling';
import PanResponder from './panResponder';
import DoubleDraggable from './doubleDraggable';
import ForceTouch from './forcetouch';
import BottomSheet from './bottomSheet';
import { TouchablesIndex, TouchableExample } from './touchables';
import { ComboWithGHScroll, ComboWithRNScroll } from './combo';
import ChatHeads from './chatHeads';

type Screens = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { component: React.ComponentType<any>; title?: string }
>;

const SCREENS: Screens = {
  Rows: { component: Rows, title: 'Table rows & buttons' },
  Multitap: { component: Multitap },
  Draggable: { component: Draggable },
  ScaleAndRotate: { component: ScaleAndRotate, title: 'Scale, rotate & tilt' },
  ScaleAndRotateSimultaneously: {
    component: doubleScalePinchAndRotate,
    title: 'Scale, rotate & tilt & more',
  },
  PagerAndDrawer: {
    component: PagerAndDrawer,
    title: 'Android pager & drawer',
  },
  HorizontalDrawer: {
    component: HorizontalDrawer,
    title: 'Gesture handler based DrawerLayout',
  },
  SwipeableTable: {
    component: SwipeableTable,
    title: 'Gesture handler based SwipeableRow',
  },
  PanAndScroll: {
    component: PanAndScroll,
    title: 'Horizontal pan or tap in ScrollView',
  },
  Fling: {
    component: Fling,
    title: 'Flinghandler',
  },
  PanResponder: { component: PanResponder },
  Bouncing: { component: Bouncing, title: 'Twist & bounce back animation' },
  ChatHeads: {
    component: ChatHeads,
    title: 'Chat Heads (no native animated support yet)',
  },
  Combo: { component: ComboWithGHScroll },
  BottomSheet: {
    title: 'BottomSheet gestures interactions',
    component: BottomSheet,
  },
  ComboWithRNScroll: {
    component: ComboWithRNScroll,
    title: "Combo with RN's ScrollView",
  },
  DoubleDraggable: {
    component: DoubleDraggable,
    title: 'Two handlers simultaneously',
  },
  Touchables: {
    component: TouchablesIndex,
    title: 'Touchables',
  },
  ForceTouch: {
    component: ForceTouch,
    title: 'Force touch',
  },
};

type RootStackParamList = {
  Home: undefined;
} & {
  [P in keyof typeof SCREENS]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ title: '✌️ Gesture Handler Demo' }}
          component={MainScreen}
        />
        {Object.keys(SCREENS).map((name) => (
          <Stack.Screen
            key={name}
            name={name}
            getComponent={() => SCREENS[name].component}
            options={{ title: SCREENS[name].title || name }}
          />
        ))}
        <Stack.Screen name="TouchableExample" component={TouchableExample} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainScreen({ navigation }: StackScreenProps<ParamListBase>) {
  const data = Object.keys(SCREENS).map((key) => {
    const item = SCREENS[key];
    return { key, title: item.title || key };
  });

  return (
    <FlatList
      style={styles.list}
      data={data}
      ItemSeparatorComponent={ItemSeparator}
      renderItem={(props) => (
        <MainScreenItem
          {...props}
          onPressItem={({ key }: { key: string }) => navigation.navigate(key)}
        />
      )}
      renderScrollComponent={(props) => <ScrollView {...props} />}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

type MainScreenItemProps = {
  item: { key: string; title: string };
  onPressItem: (item: { key: string }) => void;
};

function MainScreenItem(props: MainScreenItemProps) {
  const { title } = props.item;
  return (
    <RectButton
      style={[styles.button]}
      onPress={() => props.onPressItem(props.item)}>
      <Text style={styles.buttonText}>{title}</Text>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#EFEFF4',
  },
  separator: {
    height: 1,
    backgroundColor: '#DBDBE0',
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    height: 60,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
