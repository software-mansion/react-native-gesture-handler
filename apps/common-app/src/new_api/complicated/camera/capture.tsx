import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const CAROUSEL_SIZE = 100;
const RECORD_INDICATOR_STROKE = 10;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CaptureButtonProps {
  progress: SharedValue<number>;
}

export function CaptureButton(props: CaptureButtonProps) {
  const radius = CAROUSEL_SIZE / 2;
  const svgRadius = CAROUSEL_SIZE / 2 - RECORD_INDICATOR_STROKE * 0.5;
  const circumference = svgRadius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => {
    const svgProgress = 100 - props.progress.value * 100;
    return {
      strokeDashoffset: svgRadius * Math.PI * 2 * (svgProgress / 100),
    };
  });

  return (
    <Animated.View style={styles.shutterContainer}>
      <Animated.View style={styles.shutterButtonBackground} />
      <Svg style={styles.shutterButtonRecordingIndicator}>
        <AnimatedCircle
          cx={radius}
          cy={radius}
          r={svgRadius}
          stroke={'red'}
          strokeLinecap="round"
          fill={'transparent'}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={RECORD_INDICATOR_STROKE}
          animatedProps={animatedProps}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shutterContainer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    transform: [{ translateX: -CAROUSEL_SIZE / 2 }],
  },
  shutterButtonBackground: {
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    borderRadius: CAROUSEL_SIZE / 2,
    borderWidth: RECORD_INDICATOR_STROKE,
    borderColor: 'white',
    position: 'absolute',
  },
  shutterButtonRecordingIndicator: {
    width: CAROUSEL_SIZE,
    height: CAROUSEL_SIZE,
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -CAROUSEL_SIZE / 2 }, { rotateZ: '-90deg' }],
  },
});
