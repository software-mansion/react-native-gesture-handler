import OverflowParent from './release_tests/overflowParent';
import DoublePinchRotate from './release_tests/doubleScalePinchAndRotate';
import DoubleDraggable from './release_tests/doubleDraggable';
import GesturizedPressable from './release_tests/gesturizedPressable';
import { ComboWithGHScroll } from './release_tests/combo';
import { TouchablesIndex } from './release_tests/touchables';
import NestedFling from './release_tests/nestedFling';
import MouseButtons from './release_tests/mouseButtons';
import ContextMenu from './release_tests/contextMenu';
import NestedTouchables from './release_tests/nestedTouchables';
import NestedPressables from './release_tests/nestedPressables';
import NestedButtons from './release_tests/nestedButtons';
import PointerType from './release_tests/pointerType';
import NestedGestureHandlerRootViewWithModal from './release_tests/nestedGHRootViewWithModal';
import TwoFingerPan from './release_tests/twoFingerPan';
import SvgCompatibility from './release_tests/svg';
import NestedText from './release_tests/nestedText';

import { PinchableBox } from './recipes/scaleAndRotate';
import PanAndScroll from './recipes/panAndScroll';

import { BottomSheet } from './showcase/bottomSheet';
import ChatHeads from './showcase/chatHeads';

import Draggable from './basic/draggable';
import MultiTap from './basic/multitap';
import BouncingBox from './basic/bouncing';
import PanResponder from './basic/panResponder';
import PagerAndDrawer from './basic/pagerAndDrawer';
import ForceTouch from './basic/forcetouch';
import Fling from './basic/fling';
import WebStylesResetExample from './release_tests/webStylesReset';
import StylusData from './release_tests/StylusData';

import Camera from './v2_api/camera';
import Transformations from './v2_api/transformations';
import Overlap from './v2_api/overlap';
import Calculator from './v2_api/calculator';
import BottomSheetNewApi from './v2_api/bottom_sheet';
import ChatHeadsNewApi from './v2_api/chat_heads';
import DragNDrop from './v2_api/drag_n_drop';
import ManualGestures from './v2_api/manualGestures/index';
import Hover from './v2_api/hover';
import HoverableIcons from './v2_api/hoverable_icons';
import VelocityTest from './v2_api/velocityTest';
import Pressable from './v2_api/pressable';

import RectButtonBorders from './release_tests/rectButton';

import MacosDraggable from './simple/draggable';
import Tap from './simple/tap';
import LongPressExample from './simple/longPress';
import ManualExample from './simple/manual';
import SimpleFling from './simple/fling';

import { ExamplesSection } from '../common';
import EmptyExample from '../empty';
export const OLD_EXAMPLES: ExamplesSection[] = [
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
      { name: 'Pressable', component: Pressable },
      { name: 'Hover', component: Hover },
      { name: 'Hoverable icons', component: HoverableIcons },
      {
        name: 'Manual gestures',
        component: ManualGestures,
      },
    ],
  },
  {
    sectionTitle: 'Basic examples',
    data: [
      { name: 'Draggable', component: Draggable },
      { name: 'Multitap', component: MultiTap },
      { name: 'Bouncing box', component: BouncingBox },
      { name: 'Pan responder', component: PanResponder },
      {
        name: 'Pager & drawer',
        component: PagerAndDrawer,
        unsupportedPlatforms: new Set(['web', 'ios', 'macos']),
      },
      {
        name: 'Force touch',
        component: ForceTouch,
        unsupportedPlatforms: new Set(['web', 'android', 'macos']),
      },
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
        name: 'Nested buttons (sound & ripple)',
        component: NestedButtons,
        unsupportedPlatforms: new Set(['web', 'ios', 'macos']),
      },
      {
        name: 'Svg integration with Gesture Handler',
        component: SvgCompatibility,
      },
      { name: 'Double pinch & rotate', component: DoublePinchRotate },
      { name: 'Double draggable', component: DoubleDraggable },
      { name: 'Nested Fling', component: NestedFling },
      {
        name: 'Combo',
        component: ComboWithGHScroll,
        unsupportedPlatforms: new Set(['web']),
      },
      { name: 'Touchables', component: TouchablesIndex as React.ComponentType },
      { name: 'MouseButtons', component: MouseButtons },
      {
        name: 'ContextMenu',
        component: ContextMenu,
        unsupportedPlatforms: new Set(['android', 'ios', 'macos']),
      },
      { name: 'PointerType', component: PointerType },
      { name: 'RectButton (borders)', component: RectButtonBorders },
      { name: 'Gesturized pressable', component: GesturizedPressable },
      {
        name: 'Web styles reset',
        component: WebStylesResetExample,
        unsupportedPlatforms: new Set(['android', 'ios', 'macos']),
      },
      { name: 'Stylus data', component: StylusData },
      {
        name: 'Two finger Pan',
        component: TwoFingerPan,
        unsupportedPlatforms: new Set(['android', 'macos']),
      },
      {
        name: 'Nested Text',
        component: NestedText,
        unsupportedPlatforms: new Set(['macos']),
      },
    ],
  },
  {
    sectionTitle: 'Simple',
    data: [
      { name: 'Simple Draggable', component: MacosDraggable },
      { name: 'Tap', component: Tap },
      { name: 'LongPress', component: LongPressExample },
      { name: 'Manual', component: ManualExample },
      { name: 'Simple Fling', component: SimpleFling },
    ],
  },
];
