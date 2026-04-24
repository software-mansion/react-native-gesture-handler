import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface FilterCarouselProps {
  filters: string[];
  selected: SharedValue<number>;
  filterSize: number;
}

export function FilterCarousel(props: FilterCarouselProps) {
  const style = useAnimatedStyle(() => {
    return {
      flexDirection: 'row',
      position: 'absolute',
      left: '50%',
      gap: props.filterSize * 0.4,
      transform: [
        {
          translateX:
            -props.filterSize / 2 -
            props.filterSize * 1.4 * props.selected.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      {props.filters.map((filter) => (
        <View
          key={filter}
          style={{
            backgroundColor: filter,
            width: props.filterSize,
            height: props.filterSize,
            borderRadius: props.filterSize / 2,
          }}
        />
      ))}
    </Animated.View>
  );
}

interface FilterOverlayProps {
  filters: string[];
  selected: SharedValue<number>;
}

export function FilterOverlay(props: FilterOverlayProps) {
  const style = useAnimatedStyle(() => {
    const progress = props.selected.value % 1;

    return {
      opacity: 0.3 * (Math.abs(progress - 0.5) * 2),
      backgroundColor: props.filters[Math.round(props.selected.value)],
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents={'none'}
    />
  );
}
