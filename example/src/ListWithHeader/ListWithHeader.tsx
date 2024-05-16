import React, { useEffect } from 'react';
import {
  Platform,
  ScrollViewProps,
  SectionList,
  SectionListProps,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedReaction,
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import Header, { HEADER_HEIGHT } from './Header';
import {
  Gesture,
  GestureDetector,
  GestureType,
} from 'react-native-gesture-handler';

const IS_ANDROID = Platform.OS === 'android';

export function ListWithHeader<ItemT, SectionT>(
  props: SectionListProps<ItemT, SectionT>
) {
  const scrollOffset = useSharedValue(0);
  const scrollEnabled = useSharedValue(true);
  const androidDragDist = useSharedValue(0);

  function enableScroll() {
    setTimeout(() => {
      scrollEnabled.value = true;
    });
  }

  const dragGesture = Gesture.Pan()
    .onChange((e) => {
      if (IS_ANDROID) {
        if (scrollOffset.value <= 0 && e.changeY > 0) {
          androidDragDist.value -= e.changeY;
          scrollOffset.value = -Math.pow(
            Math.max(-androidDragDist.value, 0),
            0.85
          );
          console.log(scrollOffset.value);
          scrollEnabled.value = false;
        } else {
          runOnJS(enableScroll)();
        }
      }
    })
    .onFinalize(() => {
      if (IS_ANDROID && scrollOffset.value <= 0) {
        scrollOffset.value = withSpring(0, { damping: 50, stiffness: 500 });
        runOnJS(enableScroll)();
      }

      androidDragDist.value = 0;
    });

  const containerProps = useAnimatedStyle(() => {
    return {
      paddingTop: IS_ANDROID ? Math.max(-scrollOffset.value, 0) : 0,
    };
  });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[{ flex: 1 }, containerProps]}>
        <Header scrollOffset={scrollOffset} />
        <SectionList
          {...props}
          renderScrollComponent={(props) => (
            <ScrollComponentWithOffset
              {...props}
              scrollOffset={scrollOffset}
              dragGesture={dragGesture}
              animatedScrollEnabled={scrollEnabled}
            />
          )}
        />
      </Animated.View>
    </GestureDetector>
  );
}

interface ScrollComponentWithOffsetProps extends ScrollViewProps {
  scrollOffset: SharedValue<number>;
  animatedScrollEnabled: SharedValue<boolean>;
  dragGesture: GestureType;
}

const ScrollComponentWithOffset = React.forwardRef(
  (props: ScrollComponentWithOffsetProps, ref: any) => {
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollViewOffset = useScrollViewOffset(scrollRef);

    useAnimatedReaction(
      () => {
        return scrollViewOffset.value;
      },
      (offset) => {
        props.scrollOffset.value = offset;
      }
    );

    useEffect(() => {
      ref.current = scrollRef.current;
    }, [ref, scrollRef]);

    const scrollProps = useAnimatedProps(() => {
      return {
        scrollEnabled: props.animatedScrollEnabled.value,
      };
    });

    const scrollGesture = Gesture.Native()
      .disallowInterruption(true)
      .simultaneousWithExternalGesture(props.dragGesture);

    return (
      <GestureDetector gesture={scrollGesture}>
        <Animated.ScrollView
          {...props}
          ref={scrollRef}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
          scrollEventThrottle={1}
          animatedProps={scrollProps}
        />
      </GestureDetector>
    );
  }
);
