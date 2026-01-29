import * as React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import {
  InterceptingGestureDetector,
  VirtualGestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedRef,
  setNativeProps,
} from 'react-native-reanimated';

import { COLORS } from './colors';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const CalloutContext = React.createContext<{
  showCallout: (
    emoji: string,
    text: string,
    position: { x: number; y: number }
  ) => void;
  hideCallout: () => void;
} | null>(null);

function Callout({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const calloutPosition = useSharedValue<{ x: number; y: number } | null>(null);
  const calloutOpacity = useSharedValue(0);
  const aRef = useAnimatedRef<Animated.View>();
  const textARef = useAnimatedRef<typeof AnimatedTextInput>();
  const textIconARef = useAnimatedRef<Animated.Image>();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: calloutOpacity.value,
      transform: [
        { translateX: calloutPosition.value ? calloutPosition.value.x : 0 },
        { translateY: calloutPosition.value ? calloutPosition.value.y : 0 },
      ],
    };
  });

  const contextValue = React.useMemo(
    () => ({
      showCallout: (
        icon: string,
        text: string,
        position: { x: number; y: number }
      ) => {
        'worklet';
        setNativeProps(textIconARef, { source: [{ uri: icon }] });
        setNativeProps(textARef, { text });
        calloutPosition.value = position;
        calloutOpacity.value = withTiming(1, { duration: 200 });
      },
      hideCallout: () => {
        'worklet';
        calloutOpacity.value = withTiming(0, { duration: 200 });
      },
    }),
    [calloutOpacity, calloutPosition, textARef, textIconARef]
  );

  return (
    <CalloutContext value={contextValue}>
      {children}
      <Animated.View
        ref={aRef}
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          setHeight(e.nativeEvent.layout.height);
        }}
        style={[
          animatedStyle,
          {
            flexDirection: 'row',
            gap: 8,
            position: 'absolute',
            left: -width / 2,
            top: -height,
            backgroundColor: COLORS.KINDA_GREEN,
            borderRadius: 20,
            minWidth: 80,
            minHeight: 40,
            transformOrigin: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: 4,
            paddingRight: 16,
          },
        ]}>
        <Animated.Image
          ref={textIconARef}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />

        <AnimatedTextInput
          ref={textARef}
          editable={false}
          style={{
            fontSize: 18,
            maxWidth: 160,
            color: COLORS.NAVY,
            fontWeight: 'bold',
          }}
        />
      </Animated.View>
    </CalloutContext>
  );
}

function NiceText({
  content,
  bold,
}: {
  content: { value: string; author: string; icon: string };
  bold?: boolean;
}) {
  const callout = React.use(CalloutContext);

  const color = useSharedValue(COLORS.NAVY);
  const underlineColor = useSharedValue('transparent');

  const styles = useAnimatedStyle(() => ({
    color: color.value,
    textDecorationLine:
      underlineColor.value === 'transparent' ? 'none' : 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: underlineColor.value,
    textAlign: 'justify',
    fontWeight: bold ? 'bold' : 'normal',
  }));

  const tap = useLongPressGesture({
    minDuration: 250,
    onActivate: (e) => {
      underlineColor.value = COLORS.NAVY;

      callout?.showCallout(content.icon, content.author, {
        x: e.absoluteX,
        y: e.absoluteY - 32,
      });
    },
    onFinalize: () => {
      underlineColor.value = 'transparent';

      callout?.hideCallout();
    },
  });

  return (
    <VirtualGestureDetector gesture={tap}>
      <Animated.Text style={[styles]}>{content.value}</Animated.Text>
    </VirtualGestureDetector>
  );
}

const TEXTS = [
  {
    value:
      "I've been playing around with the new version, and Reanimated is honestly amazing; the performance gains are night and day.",
    author: 'By BB',
    icon: 'https://avatars.githubusercontent.com/u/56109050?s=64&v=4',
  },
  {
    value:
      'The animations are just so fluid and natural now, you can really feel the 120Hz responsiveness on every single interaction.',
    author: 'By Tomek',
    icon: 'https://avatars.githubusercontent.com/u/20516055?s=64&v=4',
  },
  {
    value:
      "It's easily the best library for React Native UI—nothing else even comes close to this level of declarative power.",
    author: 'By Krzyś',
    icon: 'https://avatars.githubusercontent.com/u/36106620?s=64&v=4',
  },
  {
    value:
      "Yeah, Reanimated is cool and all, but have you heard about Gesture Handler? It's the secret sauce that actually makes the touch feel real.",
    author: 'By Kuba',
    icon: 'https://avatars.githubusercontent.com/u/21055725?v=4&size=64',
  },
];

export default function NiceTextExample() {
  return (
    <View style={styles.container}>
      <Callout>
        <InterceptingGestureDetector>
          <Animated.Text style={{ fontSize: 18, textAlign: 'center' }}>
            {TEXTS.map((text, index) => (
              <React.Fragment key={index}>
                <NiceText content={text} bold={index === TEXTS.length - 1} />
                {index < TEXTS.length - 1 && ' '}
              </React.Fragment>
            ))}
          </Animated.Text>
        </InterceptingGestureDetector>
      </Callout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
