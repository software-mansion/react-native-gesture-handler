let Reanimated;

try {
  Reanimated = require('react-native-reanimated');

  if (!Reanimated.setGestureState) {
    Reanimated.setGestureState = () => {
      'worklet';

      console.warn('Please use newer version of react-native-reanimated in order to control state of the gestures.');
    };
  } // When 'react-native-reanimated' is not available we want to
  // quietly continue
  // eslint-disable-next-line no-empty

} catch (e) {}

export { Reanimated };
//# sourceMappingURL=reanimatedWrapper.js.map