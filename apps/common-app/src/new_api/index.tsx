import EmptyExample from '../empty';

import Lock from './v3_api/lock/lock';
import LogicDetectorExample from './v3_api/svg/svg';
import V3HoverIcons from './v3_api/hover/index';
import V3Overlap from './v3_api/overlap/index';
import V3Velocity from './v3_api/velocity_test/index';
import V3BottomSheet from './v3_api/bottom_sheet/index';
import V3ChatHeads from './v3_api/chat_heads/index';
import V3HoverableIcons from './v3_api/hoverable_icons/index';
import V3Camera from './v3_api/camera/index';
import V3NestedText from './v3_api/nested_text/nested_text';
import SharedValue from './v3_api/shared_value';

import Swipeable from './components/swipeable/index';
import ReanimatedDrawerLayout from './components/drawer';
import FlatListExample from './components/flatlist';
import ScrollViewExample from './components/scrollview';
import ButtonsExample from './components/buttons';
import SwitchTextInputExample from './components/switchAndInput';

import LongPressExample from './simple/longPress';
import TapExample from './simple/tap';
import HoverExample from './simple/hover';
import FlingExample from './simple/fling';
import PinchExample from './simple/pinch';
import RotationExample from './simple/rotation';
import PanExample from './simple/pan';
import { ExamplesSection } from '../common';

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
      { name: 'Svg', component: LogicDetectorExample },
      { name: 'Nested Text', component: V3NestedText },
      { name: 'Shared Value', component: SharedValue },
    ],
  },
  {
    sectionTitle: 'General',
    data: [
      { name: 'Lock', component: Lock },
      { name: 'HoverIcons', component: V3HoverIcons },
      { name: 'Overlap', component: V3Overlap },
      { name: 'Velocity Test', component: V3Velocity },
      { name: 'Bottom Sheet', component: V3BottomSheet },
      { name: 'Chat Heads', component: V3ChatHeads },
      { name: 'Hoverable Icons', component: V3HoverableIcons },
      { name: 'Camera', component: V3Camera },
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
];
