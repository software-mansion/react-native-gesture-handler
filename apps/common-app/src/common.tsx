import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const styles = StyleSheet.create({
  lipsum: {
    padding: 10,
  },
  feedback: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
});

type Props = {
  words: number;
  style: StyleProp<ViewStyle>;
};

export class LoremIpsum extends React.Component<Props> {
  static defaultProps = {
    words: 1000,
    style: styles.lipsum,
  };
  loremIpsum() {
    return LOREM_IPSUM.split(' ').slice(0, this.props.words).join(' ');
  }
  render() {
    return <Text style={this.props.style}>{this.loremIpsum()}</Text>;
  }
}

type FeedbackProps = {
  text: string;
  highlight: string;
  color?: string;
  resetState?: () => void;
  duration?: number;
};

// this piece of code is certainly not beutiful, but functional. It enables simple testing without the console
export function Feedback({
  text,
  highlight,
  color = 'black',
  resetState,
  duration = 1000,
}: FeedbackProps) {
  const opacity = useSharedValue(0);
  const [activeHighlight, setActiveHighlight] = useState<string>(highlight);
  const [activeText, setActiveText] = useState<string>(text);
  const [activeColor, setActiveColor] = useState<string>(color);
  const timerRef = useRef<number>(null);
  useEffect(() => {
    if (highlight === '') {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setActiveHighlight(highlight);
    setActiveText(text);
    setActiveColor(color);
    opacity.value = 1;
    if (resetState) {
      resetState();
    }
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    }, duration);
  }, [text, highlight, opacity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  if (!activeHighlight || !activeText.includes(activeHighlight)) {
    return (
      <Animated.Text style={[styles.feedback, animatedStyle]}>
        {text}
      </Animated.Text>
    );
  }

  const parts = activeText.split(activeHighlight);

  return (
    <Animated.Text style={[styles.feedback, animatedStyle]}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <Text>{part}</Text>
          {index < parts.length - 1 && (
            <Text style={{ color: activeColor }}>{activeHighlight}</Text>
          )}
        </React.Fragment>
      ))}
    </Animated.Text>
  );
}

export const COLORS = {
  offWhite: '#f8f9ff',
  headerSeparator: '#eef0ff',
  NAVY: '#001A72',
  KINDA_RED: '#FFB2AD',
  YELLOW: '#FFF096',
  KINDA_GREEN: '#C4E7DB',
  KINDA_BLUE: '#A0D5EF',
};

const LOREM_IPSUM = `
Curabitur accumsan sit amet massa quis cursus. Fusce sollicitudin nunc nisl, quis efficitur quam tristique eget. Ut non erat molestie, ullamcorper turpis nec, euismod neque. Praesent aliquam risus ultricies, cursus mi consectetur, bibendum lorem. Nunc eleifend consectetur metus quis pulvinar. In vitae lacus eu nibh tincidunt sagittis ut id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque sagittis mauris rhoncus, maximus justo in, consequat dolor. Pellentesque ornare laoreet est vulputate vestibulum. Aliquam sit amet metus lorem.

Morbi tempus elit lorem, ut pulvinar nunc sagittis pharetra. Nulla mi sem, elementum non bibendum eget, viverra in purus. Vestibulum efficitur ex id nisi luctus egestas. Quisque in urna vitae leo consectetur ultricies sit amet at nunc. Cras porttitor neque at nisi ornare, mollis ornare dolor pharetra. Donec iaculis lacus orci, et pharetra eros imperdiet nec. Morbi leo nunc, placerat eget varius nec, volutpat ac velit. Phasellus pulvinar vulputate tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce elementum dui at ipsum hendrerit, vitae consectetur erat pulvinar. Sed vehicula sapien felis, id tristique dolor tempor feugiat. Aenean sit amet erat libero.

Nam posuere at mi ut porttitor. Vivamus dapibus vehicula mauris, commodo pretium nibh. Mauris turpis metus, vulputate iaculis nibh eu, maximus tincidunt nisl. Vivamus in mauris nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse convallis ornare finibus. Quisque leo ex, vulputate quis molestie auctor, congue nec arcu.

Praesent ac risus nec augue commodo semper eu eget quam. Donec aliquam sodales convallis. Etiam interdum eu nulla at tempor. Duis nec porttitor odio, consectetur tempor turpis. Sed consequat varius lorem vel fermentum. Maecenas dictum sapien vitae lobortis tempus. Aliquam iaculis vehicula velit, non tempus est varius nec. Nunc congue dolor nec sem gravida, nec tincidunt mi luctus. Nam ut porttitor diam.

Fusce interdum nisi a risus aliquet, non dictum metus cursus. Praesent imperdiet sapien orci, quis sodales metus aliquet id. Aliquam convallis pharetra erat. Fusce gravida diam ut tellus elementum sodales. Fusce varius congue neque, quis laoreet sapien blandit vestibulum. Donec congue libero sapien, nec varius risus viverra ut. Quisque eu maximus magna. Phasellus tortor nisi, tincidunt vitae dignissim nec, interdum vel mi. Ut accumsan urna finibus posuere mattis.
`;
