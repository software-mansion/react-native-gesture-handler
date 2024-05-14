import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SectionList,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import OverflowParent from './src/release_tests/overflowParent';
import DoublePinchRotate from './src/release_tests/doubleScalePinchAndRotate';
import DoubleDraggable from './src/release_tests/doubleDraggable';
import { ComboWithGHScroll } from './src/release_tests/combo';
import {
  TouchablesIndex,
  TouchableExample,
} from './src/release_tests/touchables';
import Rows from './src/release_tests/rows';
import NestedFling from './src/release_tests/nestedFling';
import MouseButtons from './src/release_tests/mouseButtons';
import ContextMenu from './src/release_tests/contextMenu';
import NestedTouchables from './src/release_tests/nestedTouchables';
import NestedButtons from './src/release_tests/nestedButtons';
import PointerType from './src/release_tests/pointerType';
import NestedGestureHandlerRootViewWithModal from './src/release_tests/nestedGHRootViewWithModal';
import { PinchableBox } from './src/recipes/scaleAndRotate';
import PanAndScroll from './src/recipes/panAndScroll';
import { BottomSheet } from './src/showcase/bottomSheet';
import Swipeables from './src/showcase/swipeable';
import ChatHeads from './src/showcase/chatHeads';
import Draggable from './src/basic/draggable';
import MultiTap from './src/basic/multitap';
import BouncingBox from './src/basic/bouncing';
import PanResponder from './src/basic/panResponder';
import HorizontalDrawer from './src/basic/horizontalDrawer';
import PagerAndDrawer from './src/basic/pagerAndDrawer';
import ForceTouch from './src/basic/forcetouch';
import Fling from './src/basic/fling';

import ReanimatedSimple from './src/new_api/reanimated';
import Camera from './src/new_api/camera';
import Transformations from './src/new_api/transformations';
import OverlapParents from './src/new_api/overlap_parent';
import OverlapSiblings from './src/new_api/overlap_siblings';
import Calculator from './src/new_api/calculator';
import BottomSheetNewApi from './src/new_api/bottom_sheet';
import ChatHeadsNewApi from './src/new_api/chat_heads';
import DragNDrop from './src/new_api/drag_n_drop';
import BetterHorizontalDrawer from './src/new_api/betterHorizontalDrawer';
import ManualGestures from './src/new_api/manualGestures/index';
import Hover from './src/new_api/hover';
import HoverableIcons from './src/new_api/hoverable_icons';
import VelocityTest from './src/new_api/velocityTest';

import EmptyExample from './src/empty/EmptyExample';
import RectButtonBorders from './src/release_tests/rectButton';

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
    sectionTitle: 'Empty',
    data: [{ name: 'Empty Example', component: EmptyExample }],
  },
  {
    sectionTitle: 'Basic examples',
    data: [
      { name: 'Draggable', component: Draggable },
      { name: 'Multitap', component: MultiTap },
      { name: 'Bouncing box', component: BouncingBox },
      { name: 'Pan responder', component: PanResponder },
      { name: 'Horizontal drawer', component: HorizontalDrawer },
      { name: 'Pager & drawer', component: PagerAndDrawer },
      { name: 'Force touch', component: ForceTouch },
      { name: 'Fling', component: Fling },
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
        name: 'Views overflowing parents - issue #1532',
        component: OverflowParent,
      },
      {
        name: 'Modals with nested GHRootViews - issue #139',
        component: NestedGestureHandlerRootViewWithModal,
      },
      {
        name: 'Nested Touchables - issue #784',
        component: NestedTouchables as React.ComponentType,
      },
      {
        name: 'Nested buttons (sound & ripple on Android)',
        component: NestedButtons,
      },
      { name: 'Double pinch & rotate', component: DoublePinchRotate },
      { name: 'Double draggable', component: DoubleDraggable },
      { name: 'Rows', component: Rows },
      { name: 'Nested Fling', component: NestedFling },
      { name: 'Combo', component: ComboWithGHScroll },
      { name: 'Touchables', component: TouchablesIndex as React.ComponentType },
      { name: 'MouseButtons', component: MouseButtons },
      { name: 'ContextMenu (web only)', component: ContextMenu },
      { name: 'PointerType', component: PointerType },
      { name: 'RectButton (borders)', component: RectButtonBorders },
    ],
  },
  {
    sectionTitle: 'New api',
    data: [
      {
        name: 'Simple interaction with Reanimated',
        component: ReanimatedSimple,
      },
      { name: 'Hover', component: Hover },
      { name: 'Hoverable icons', component: HoverableIcons },
      { name: 'Camera', component: Camera },
      { name: 'Velocity test', component: VelocityTest },
      { name: 'Transformations', component: Transformations },
      { name: 'Overlap parents', component: OverlapParents },
      { name: 'Overlap siblings', component: OverlapSiblings },
      { name: 'Calculator', component: Calculator },
      { name: 'Bottom Sheet', component: BottomSheetNewApi },
      { name: 'Chat Heads', component: ChatHeadsNewApi },
      { name: 'Drag and drop', component: DragNDrop },
      {
        name: 'Horizontal Drawer (Reanimated 2 & RNGH 2)',
        component: BetterHorizontalDrawer,
      },
      {
        name: 'Manual gestures',
        component: ManualGestures,
      },
    ],
  },
];

type RootStackParamList = {
  Home: undefined;
  TouchableExample: { item: string };
} & {
  [Screen: string]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            cardStyle: {
              // It's important to set height for the screen, without it scroll doesn't work on web platform.
              height: Dimensions.get('window').height,
            },
          }}>
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
