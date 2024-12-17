import { TouchableNativeFeedback as RNTouchableNativeFeedback } from 'react-native';
import { tagMessage } from '../../utils';

/**
 * @deprecated TouchableNativeFeedback will be removed in the future version of Gesture Handler.
 */
class TouchableNativeFeedback extends RNTouchableNativeFeedback {
  componentDidMount() {
    console.warn(
      tagMessage(
        'TouchableNativeFeedback component will be removed in the future version of Gesture Handler.'
      )
    );

    return super.componentDidMount?.();
  }
}

export default TouchableNativeFeedback;
