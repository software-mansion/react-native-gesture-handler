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
  withTiming,
  useAnimatedProps,
  useAnimatedStyle,
  runOnJS,
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

  function enableScroll() {
    setTimeout(() => {
      scrollEnabled.value = true;
    });
  }

  const dragGesture = Gesture.Pan()
    .onChange((e) => {
      if (IS_ANDROID) {
        if (scrollOffset.value <= 0) {
          scrollOffset.value -= e.changeY;
          scrollEnabled.value = false;
        } else {
          runOnJS(enableScroll)();
        }
      }
    })
    .onFinalize(() => {
      if (IS_ANDROID && scrollOffset.value <= 0) {
        scrollOffset.value = withTiming(0);
        runOnJS(enableScroll)();
      }
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
