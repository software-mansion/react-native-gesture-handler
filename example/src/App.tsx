// old examples for old api
import OverflowParent from './release_tests/overflowParent'; // OK (but balls draggable only within rectangle)
import DoublePinchRotate from './release_tests/doubleScalePinchAndRotate'; // not checked yet
import DoubleDraggable from './release_tests/doubleDraggable'; // OK
import { ComboWithGHScroll } from './release_tests/combo'; // doesn't work ("requireNativeComponent: "RNCSlider" was not found in the UIManager")
import { TouchablesIndex, TouchableExample } from './release_tests/touchables'; // doesn't work ("undefined is not an object (evaluating 'this.props.route.params')")
import Rows from './release_tests/rows'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import NestedTouchables from './release_tests/nestedTouchables'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import NestedGestureHandlerRootViewWithModal from './release_tests/nestedGHRootViewWithModal'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import { PinchableBox } from './recipes/scaleAndRotate'; // OK
import PanAndScroll from './recipes/panAndScroll'; // OK
import { BottomSheet } from './showcase/bottomSheet'; // OK
import Swipeables from './showcase/swipeable'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import ChatHeads from './showcase/chatHeads'; // always sticks to the top for USE_NATIVE_DRIVER=false, animations played sequentially for USE_NATIVE_DRIVER=true
import { DraggableBox } from './basic/draggable'; // OK
import MultiTap from './basic/multitap'; // OK
import BouncingBox from './basic/bouncing'; // OK
import PanResponder from './basic/panResponder'; // doesn't work ("setNativeProps is not currently supported") // TODO: migrate setNativeProps
import BetterHorizontalDrawer from './basic/betterHorizontalDrawer'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import HorizontalDrawer from './basic/horizontalDrawer'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import PagerAndDrawer from './basic/pagerAndDrawer'; // not checked yet (Android)
import ForceTouch from './basic/forcetouch'; // not checked yet

// old examples for new api
import ReanimatedSimple from './new_api/reanimated'; // OK
import Camera from './new_api/camera'; // OK
import Transformations from './new_api/transformations'; // OK
import OverlapParents from './new_api/overlap_parent'; // OK
import OverlapSiblings from './new_api/overlap_siblings'; // OK
import Calculator from './new_api/calculator'; // doesn't work (empty screen)
import BottomSheetNewApi from './new_api/bottom_sheet'; // OK
import ChatHeadsNewApi from './new_api/chat_heads'; // OK
import DragNDrop from './new_api/drag_n_drop'; // doesn't work (weird positions)

// new examples for new api
import FabricReanimatedExample from './new_api/fabric/FabricReanimatedExample'; // OK
import FabricCallbacksExample from './new_api/fabric/FabricCallbacksExample'; // OK
import FabricPanGestureHandlerExample from './new_api/fabric/FabricPanGestureHandlerExample'; // OK
import FabricEmptyExample from './new_api/fabric/FabricEmptyExample';

export default DraggableBox;
