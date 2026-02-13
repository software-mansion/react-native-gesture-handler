import AnimatedExample from './showcase/animated';
import BottomSheetExample from './showcase/bottom_sheet';
import NestedTextExample from './showcase/nested_text/nested_text';
import OverlapExample from './showcase/overlap';
import SharedValueExample from './showcase/shared_value';
import SvgExample from './showcase/svg';
import StateManagerExample from './showcase/state_manager';
import TimerExample from './showcase/timer';

import CameraExample from './complicated/camera';
import ChatHeadsExample from './complicated/chat_heads';
import LockExample from './complicated/lock';
import VelocityExample from './complicated/velocity_test';

import ContextMenuExample from './hover_mouse/context_menu';
import HoverIconsExample from './hover_mouse/hover';
import HoverableIconsExample from './hover_mouse/hoverable_icons';
import MouseButtonsExample from './hover_mouse/mouse_buttons';
import StylusDataExample from './hover_mouse/stylus_data';

import FlingExample from './simple/fling';
import HoverExample from './simple/hover';
import LongPressExample from './simple/longPress';
import PanExample from './simple/pan';
import PinchExample from './simple/pinch';
import RotationExample from './simple/rotation';
import TapExample from './simple/tap';

import ButtonsExample from './components/buttons';
import ReanimatedDrawerLayout from './components/drawer';
import FlatListExample from './components/flatlist';
import ScrollViewExample from './components/scrollview';
import Swipeable from './components/swipeable/index';
import SwitchTextInputExample from './components/switchAndInput';

import RectButtonExample from './tests/rectButton';
import TwoFingerPanExample from './tests/twoFingerPan';
import WebStylesResetExample from './tests/webStylesReset';
import PointerTypeExample from './tests/pointerType';
import ReattachingExample from './tests/reattaching';
import NestedRootViewExample from './tests/nestedRootView';
import NestedPressablesExample from './tests/nestedPressables';
import PressableExample from './tests/pressable';

import { ExamplesSection } from '../common';
import EmptyExample from '../empty';

export const NEW_EXAMPLES: ExamplesSection[] = [
  {
    sectionTitle: 'Empty',
    data: [{ name: 'Empty Example', component: EmptyExample }],
  },
  {
    sectionTitle: 'Simple Gestures',
    data: [
      { name: 'Fling', component: FlingExample },
      { name: 'Tap', component: TapExample },
      { name: 'LongPress', component: LongPressExample },
      { name: 'Hover', component: HoverExample },
      { name: 'Pinch', component: PinchExample },
      { name: 'Rotation', component: RotationExample },
      { name: 'Pan', component: PanExample },
    ],
  },
  {
    sectionTitle: 'Showcase',
    data: [
      { name: 'State Manager', component: StateManagerExample },
      { name: 'Svg', component: SvgExample },
      { name: 'Nested Text', component: NestedTextExample },
      { name: 'Shared Value', component: SharedValueExample },
      { name: 'Bottom Sheet', component: BottomSheetExample },
      { name: 'Overlap', component: OverlapExample },
      { name: 'Animated', component: AnimatedExample },
      { name: 'Timer', component: TimerExample },
    ],
  },
  {
    sectionTitle: 'Hover and mouse',
    data: [
      { name: 'Stylus Data', component: StylusDataExample },
      {
        name: 'Context Menu',
        component: ContextMenuExample,
        unsupportedPlatforms: new Set(['android', 'ios', 'macos']),
      },
      { name: 'Hover Icons', component: HoverIconsExample },
      { name: 'Hoverable Icons', component: HoverableIconsExample },
      { name: 'Mouse Buttons', component: MouseButtonsExample },
    ],
  },
  {
    sectionTitle: 'Complicated',
    data: [
      { name: 'Lock', component: LockExample },
      { name: 'Velocity Test', component: VelocityExample },
      { name: 'Chat Heads', component: ChatHeadsExample },
      { name: 'Camera', component: CameraExample },
    ],
  },

  {
    sectionTitle: 'Components',
    data: [
      { name: 'FlatList example', component: FlatListExample },
      { name: 'ScrollView example', component: ScrollViewExample },
      { name: 'Buttons example', component: ButtonsExample },
      { name: 'Switch & TextInput', component: SwitchTextInputExample },
      { name: 'Reanimated Swipeable', component: Swipeable },
      { name: 'Reanimated Drawer Layout', component: ReanimatedDrawerLayout },
    ],
  },
  {
    sectionTitle: 'Tests',
    data: [
      { name: 'RectButton', component: RectButtonExample },
      { name: 'Two Finger Pan', component: TwoFingerPanExample },
      {
        name: 'Web Styles Reset',
        component: WebStylesResetExample,
        unsupportedPlatforms: new Set(['android', 'ios', 'macos']),
      },
      { name: 'Pointer Type', component: PointerTypeExample },
      { name: 'Reattaching', component: ReattachingExample },
      { name: 'Modal with Nested Root View', component: NestedRootViewExample },
      { name: 'Nested pressables', component: NestedPressablesExample },
      { name: 'Pressable', component: PressableExample },
    ],
  },
];
