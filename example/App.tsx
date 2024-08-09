import React, { useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import {
  GestureHandlerRootView,
  RectButton,
  Switch,
} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OverflowParent from './src/release_tests/overflowParent';
import DoublePinchRotate from './src/release_tests/doubleScalePinchAndRotate';
import DoubleDraggable from './src/release_tests/doubleDraggable';
import GesturizedPressable from './src/release_tests/gesturizedPressable';
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
import NestedPressables from './src/release_tests/nestedPressables';
import NestedButtons from './src/release_tests/nestedButtons';
import PointerType from './src/release_tests/pointerType';
import SwipeableReanimation from './src/release_tests/swipeableReanimation';
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

import Camera from './src/new_api/camera';
import Transformations from './src/new_api/transformations';
import Overlap from './src/new_api/overlap';
import Calculator from './src/new_api/calculator';
import BottomSheetNewApi from './src/new_api/bottom_sheet';
import ChatHeadsNewApi from './src/new_api/chat_heads';
import DragNDrop from './src/new_api/drag_n_drop';
import BetterHorizontalDrawer from './src/new_api/betterHorizontalDrawer';
import ManualGestures from './src/new_api/manualGestures/index';
import Hover from './src/new_api/hover';
import HoverableIcons from './src/new_api/hoverable_icons';
import VelocityTest from './src/new_api/velocityTest';
import Swipeable from 'src/new_api/swipeable';
import Pressable from 'src/new_api/pressable';

import EmptyExample from './src/empty/EmptyExample';
import RectButtonBorders from './src/release_tests/rectButton';
import { ListWithHeader } from './src/ListWithHeader';
import { COLORS } from './src/common';

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
    sectionTitle: 'New api',
    data: [
      { name: 'Ball with velocity', component: VelocityTest },
      { name: 'Camera', component: Camera },
      { name: 'Transformations', component: Transformations },
      { name: 'Overlap', component: Overlap },
      { name: 'Bottom Sheet', component: BottomSheetNewApi },
      { name: 'Calculator', component: Calculator },
      { name: 'Chat Heads', component: ChatHeadsNewApi },
      { name: 'Drag and drop', component: DragNDrop },
      { name: 'Swipeable', component: Swipeable },
      { name: 'Hover', component: Hover },
      { name: 'Hoverable icons', component: HoverableIcons },
      {
        name: 'Horizontal Drawer (Reanimated 2 & RNGH 2)',
        component: BetterHorizontalDrawer,
      },
      {
        name: 'Manual gestures',
        component: ManualGestures,
      },
      { name: 'Pressable', component: Pressable },
    ],
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
        name: 'Nested Pressables - issue #2980',
        component: NestedPressables as React.ComponentType,
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
      { name: 'Swipeable Reanimation', component: SwipeableReanimation },
      { name: 'RectButton (borders)', component: RectButtonBorders },
      { name: 'Gesturized pressable', component: GesturizedPressable },
    ],
  },
];

const OPEN_LAST_EXAMPLE_KEY = 'openLastExample';
const LAST_EXAMPLE_KEY = 'lastExample';

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
              backgroundColor: '#fff',
            },
            headerStyle: {
              backgroundColor: COLORS.offWhite,
            },
          }}>
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
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

function navigate(
  navigation: StackNavigationProp<ParamListBase>,
  dest: string
) {
  AsyncStorage.setItem(LAST_EXAMPLE_KEY, dest);
  navigation.navigate(dest);
}

function MainScreen({ navigation }: StackScreenProps<ParamListBase>) {
  useEffect(() => {
    AsyncStorage.multiGet([OPEN_LAST_EXAMPLE_KEY, LAST_EXAMPLE_KEY]).then(
      ([openLastExample, lastExample]) => {
        if (openLastExample[1] === 'true' && lastExample[1]) {
          navigate(navigation, lastExample[1]);
        }
      }
    );
    // we only want to run this effect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ListWithHeader
        style={styles.list}
        sections={EXAMPLES}
        keyExtractor={(example) => example.name}
        ListHeaderComponent={OpenLastExampleSetting}
        renderItem={({ item }) => (
          <MainScreenItem
            name={item.name}
            onPressItem={(name) => navigate(navigation, name)}
          />
        )}
        renderSectionHeader={({ section: { sectionTitle } }) => (
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function OpenLastExampleSetting() {
  const [openLastExample, setOpenLastExample] = React.useState(false);

  useEffect(() => {
    AsyncStorage.getItem(OPEN_LAST_EXAMPLE_KEY).then((value) => {
      setOpenLastExample(value === 'true');
    });
  }, []);

  function updateSetting(value: boolean) {
    AsyncStorage.setItem(OPEN_LAST_EXAMPLE_KEY, value.toString());
    setOpenLastExample(value);
  }

  return (
    <RectButton
      style={[styles.button, styles.autoOpenSetting]}
      onPress={() => {
        updateSetting(!openLastExample);
      }}>
      <View
        style={styles.buttonContent}
        pointerEvents={Platform.OS === 'web' ? 'box-only' : 'auto'}>
        <Text>Open last example on launch</Text>
        <Switch
          value={openLastExample}
          onValueChange={() => {
            updateSetting(!openLastExample);
          }}
        />
      </View>
    </RectButton>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
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
    padding: 16,
    backgroundColor: COLORS.offWhite,
  },
  list: {},
  separator: {
    height: 2,
  },
  button: {
    flex: 1,
    height: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoOpenSetting: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#eef0ff',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
