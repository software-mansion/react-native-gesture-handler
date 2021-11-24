// old examples for old api
import OverflowParent from './release_tests/overflowParent'; // doesn't work (Animated)
import DoublePinchRotate from './release_tests/doubleScalePinchAndRotate'; // doesn't work (Animated)
import DoubleDraggable from './release_tests/doubleDraggable'; // doesn't work (Animated)
import { ComboWithGHScroll } from './release_tests/combo'; // doesn't work ("requireNativeComponent: "RNCSlider" was not found in the UIManager")
import { TouchablesIndex, TouchableExample } from './release_tests/touchables'; // doesn't work ("undefined is not an object (evaluating 'this.props.route.params')")
import Rows from './release_tests/rows'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import NestedTouchables from './release_tests/nestedTouchables'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import NestedGestureHandlerRootViewWithModal from './release_tests/nestedGHRootViewWithModal'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import { PinchableBox } from './recipes/scaleAndRotate'; // doesn't work (Animated)
import PanAndScroll from './recipes/panAndScroll'; // doesn't work (Animated)
import { BottomSheet } from './showcase/bottomSheet'; // doesn't work (Animated)
import Swipeables from './showcase/swipeable'; // doesn't work (Unimplemented component: RNGestureHandlerButton)
import ChatHeads from './showcase/chatHeads'; // doesn't work (Animated)
import { DraggableBox } from './basic/draggable'; // doesn't work (Animated)
import MultiTap from './basic/multitap'; // doesn't work (Animated)
import BouncingBox from './basic/bouncing'; // doesn't work (Animated)
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

// current example
export default FabricReanimatedExample;
