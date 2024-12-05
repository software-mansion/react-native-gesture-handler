import { TouchableNativeFeedback as RNTouchableNativeFeedback } from 'react-native';

/**
 * @deprecated TouchableNativeFeedback will be removed in Gesture Handler 4
 */
const TouchableNativeFeedback: React.FC<
  React.ComponentProps<typeof RNTouchableNativeFeedback>
> = (props) => {
  return <RNTouchableNativeFeedback {...props} />;
};

export default TouchableNativeFeedback;
