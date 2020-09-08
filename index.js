// NOTE: Explicit lazy re-exports to slim down app launch time
module.exports = {
  // GestureHandler
  get createNativeWrapper() {
    return require('./createNativeWrapper').default;
  },
  get Directions() {
    return require('./Directions').default;
  },
  get gestureHandlerRootHOC() {
    return require('./gestureHandlerRootHOC').default;
  },
  get GestureHandlerRootView() {
    return require('./GestureHandlerRootView').default;
  },
  get NativeViewGestureHandler() {
    return require('./NativeViewGestureHandler').default;
  },
  get State() {
    return require('./State').default;
  },
  // GestureButtons
  get RawButton() {
    return require('./GestureButtons').RawButton;
  },
  get BaseButton() {
    return require('./GestureButtons').BaseButton;
  },
  get RectButton() {
    return require('./GestureButtons').RectButton;
  },
  get BorderlessButton() {
    return require('./GestureButtons').BorderlessButton;
  },
  get PureNativeButton() {
    return require('./GestureButtons').PureNativeButton;
  },
  // GestureComponents
  get ScrollView() {
    return require('./GestureComponents').ScrollView;
  },
  get Switch() {
    return require('./GestureComponents').Switch;
  },
  get TextInput() {
    return require('./GestureComponents').TextInput;
  },
  get DrawerLayoutAndroid() {
    return require('./GestureComponents').DrawerLayoutAndroid;
  },
  get FlatList() {
    return require('./GestureComponents').FlatList;
  },
  // Gestures
  get TapGestureHandler() {
    return require('./Gestures').TapGestureHandler;
  },
  get FlingGestureHandler() {
    return require('./Gestures').FlingGestureHandler;
  },
  get ForceTouchGestureHandler() {
    return require('./Gestures').ForceTouchGestureHandler;
  },
  get LongPressGestureHandler() {
    return require('./Gestures').LongPressGestureHandler;
  },
  get PanGestureHandler() {
    return require('./Gestures').PanGestureHandler;
  },
  get PinchGestureHandler() {
    return require('./Gestures').PinchGestureHandler;
  },
  get RotationGestureHandler() {
    return require('./Gestures').RotationGestureHandler;
  },
  // touchables
  get TouchableNativeFeedback() {
    return require('./touchables/TouchableNativeFeedback').default;
  },
  get TouchableWithoutFeedback() {
    return require('./touchables/TouchableWithoutFeedback').default;
  },
  get TouchableOpacity() {
    return require('./touchables/TouchableOpacity').default;
  },
  get TouchableHighlight() {
    return require('./touchables/TouchableHighlight').default;
  },
  // other
  get Swipeable() {
    return require('./Swipeable').default;
  },
  get DrawerLayout() {
    return require('./DrawerLayout').default;
  },
};
