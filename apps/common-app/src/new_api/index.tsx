import EmptyExample from '../empty';

import Lock from './v3_api/lock/lock';
import V3Fling from './v3_api/fling/fling';
import LogicDetectorExample from './v3_api/svg/svg';
import V3Hover from './v3_api/hover/index';
import V3Overlap from './v3_api/overlap/index';
import V3Velocity from './v3_api/velocity_test/index';
import V3BottomSheet from './v3_api/bottom_sheet/index';
import V3ChatHeads from './v3_api/chat_heads/index';
import V3HoverableIcons from './v3_api/hoverable_icons/index';
import V3Camera from './v3_api/camera/index';
import V3NestedText from './v3_api/nested_text/nested_text';

import Swipeable from './components/swipeable/index';
import ReanimatedDrawerLayout from './components/drawer';
import FlatListExample from './components/flatlist';
import ScrollViewExample from './components/scrollview';
import ButtonsExample from './components/buttons';
import SwitchTextInputExample from './components/switchAndInput';

import { ExamplesSection } from '../common';
export const NEW_EXAMPLES: ExamplesSection[] = [
  {
    sectionTitle: 'Empty',
    data: [{ name: 'Empty Example', component: EmptyExample }],
  },
  {
    sectionTitle: 'General',
    data: [
      { name: 'Fling', component: V3Fling },
      { name: 'Svg', component: LogicDetectorExample },
      { name: 'Lock', component: Lock },
      { name: 'Hover', component: V3Hover },
      { name: 'Overlap', component: V3Overlap },
      { name: 'Velocity Test', component: V3Velocity },
      { name: 'Bottom Sheet', component: V3BottomSheet },
      { name: 'Chat Heads', component: V3ChatHeads },
      { name: 'Hoverable Icons', component: V3HoverableIcons },
      { name: 'Camera', component: V3Camera },
      { name: 'Nested Text', component: V3NestedText },
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
