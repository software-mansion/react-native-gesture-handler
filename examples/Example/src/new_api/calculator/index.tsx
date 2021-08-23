import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  LayoutChangeEvent,
  LayoutRectangle,
} from 'react-native';
import {
  GestureMonitor,
  Gesture,
  ScrollView,
  useAnimatedGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const DRAG_ANIMATION_DURATION = 300;
const TAP_ANIMATION_DURATION = 100;
const window = Dimensions.get('window');

export default function CalculatorUI() {
  const outputOffset = useSharedValue(0);
  const [history, setHistory] = useState(Array<string>());
  const [expression, setExpression] = useState('');

  function measure({
    nativeEvent: {
      layout: { height },
    },
  }: LayoutChangeEvent) {
    outputOffset.value = -height;
  }

  return (
    <View style={styles.home}>
      <Output offset={outputOffset} expression={expression} history={history} />
      <Input
        offset={outputOffset}
        measure={measure}
        expression={expression}
        setExpression={setExpression}
        setHistory={setHistory}
      />
    </View>
  );
}

interface OutputProps {
  offset: Animated.SharedValue<number>;
  expression: string;
  history: string[];
}

function Output(props: OutputProps) {
  const layout = useRef({});
  const scrollView = useRef<ScrollView>();
  const drag = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const [opened, setOpened] = useState(false);

  function measure({ nativeEvent: { layout: newLayout } }: LayoutChangeEvent) {
    layout.current = newLayout;
  }

  function open() {
    drag.value = withTiming(-props.offset.value, {
      duration: DRAG_ANIMATION_DURATION,
    });
    dragOffset.value = -props.offset.value;

    setOpened(true);
  }

  function close() {
    drag.value = withTiming(0, { duration: DRAG_ANIMATION_DURATION });
    dragOffset.value = 0;

    setOpened(false);
  }

  const translationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: props.offset.value + drag.value }],
    };
  });

  const dragGesture = useAnimatedGesture(
    Gesture.pan()
      .setOnUpdate((e) => {
        'worklet';
        const translatedOffset = dragOffset.value + e.translationY;

        if (translatedOffset > -props.offset.value) {
          drag.value = -props.offset.value;
        } else if (translatedOffset < 0) {
          drag.value = 0;
        } else {
          drag.value = translatedOffset;
        }
      })
      .setOnEnd((e) => {
        'worklet';
        const translatedOffset = dragOffset.value + e.translationY;

        if (opened) {
          if (translatedOffset < -props.offset.value - 100) {
            runOnJS(close)();
          } else {
            runOnJS(open)();
          }
        } else {
          if (translatedOffset > 100) {
            runOnJS(open)();
          } else {
            runOnJS(close)();
          }
        }
      })
  );

  scrollView.current?.scrollToEnd({ animated: true });

  return (
    <GestureMonitor gesture={dragGesture}>
      <Animated.View
        style={[styles.output, translationStyle]}
        onLayout={measure}>
        <ScrollView
          ref={(ref: ScrollView) => {
            if (!opened && ref) {
              ref.scrollToEnd({ animated: false });
            }
            scrollView.current = ref;
          }}
          enabled={opened}
          contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexGrow: 1 }} />

          {props.history.map((exp: string) => {
            return <Expression expression={exp} key={exp} />;
          })}

          <Expression expression={props.expression} />
        </ScrollView>
        <View style={styles.handleView}>
          <View style={styles.handle} />
        </View>
      </Animated.View>
    </GestureMonitor>
  );
}

interface ExpressionProps {
  expression: string;
}

function Expression({ expression }: ExpressionProps) {
  return (
    <View style={styles.expression}>
      <Text style={styles.expressionText}>{expression}</Text>
      <Text style={styles.expressionResult}>{expression}</Text>
    </View>
  );
}

interface InputProps {
  setHistory: Dispatch<SetStateAction<string[]>>;
  setExpression: Dispatch<SetStateAction<string>>;
  measure: (e: LayoutChangeEvent) => void;
  offset: Animated.SharedValue<number>;
  expression: string;
}

function Input(props: InputProps) {
  const translationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: props.offset.value }],
    };
  });

  function append(symbol: string) {
    if (symbol === '<') {
      props.setHistory((h) => [...h, props.expression]);
      props.setExpression((_e) => '');
    } else {
      props.setExpression((e) => e + symbol);
    }
  }

  return (
    <Animated.View
      style={[styles.input, translationStyle]}
      onLayout={props.measure}>
      <NumPad append={append} />
      <Operations />
    </Animated.View>
  );
}

interface NumPadProps {
  append: (text: string) => void;
}

function NumPad({ append }: NumPadProps) {
  const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '<', '0', '.'];
  return (
    <View style={styles.numPad}>
      {buttons.map((text) => {
        return <Button text={text} key={text} append={append} />;
      })}
    </View>
  );
}

function Operations() {
  const layout = useSharedValue<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const drag = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const [opened, setOpened] = useState(false);

  function open() {
    const margin = window.width - layout.value.x;

    drag.value = withTiming(-layout.value.width + margin, {
      duration: DRAG_ANIMATION_DURATION,
    });
    dragOffset.value = -layout.value.width + margin;

    setOpened(true);
  }

  function close() {
    drag.value = withTiming(0, { duration: DRAG_ANIMATION_DURATION });
    dragOffset.value = 0;

    setOpened(false);
  }

  const dragGesture = useAnimatedGesture(
    Gesture.pan()
      .setOnUpdate((e) => {
        'worklet';
        const margin = window.width - layout.value.x;
        const translatedOffset = dragOffset.value + e.translationX;

        if (translatedOffset < -layout.value.width + margin) {
          drag.value = -layout.value.width + margin;
        } else if (translatedOffset > 0) {
          drag.value = 0;
        } else {
          drag.value = translatedOffset;
        }
      })
      .setOnEnd((e) => {
        'worklet';
        const margin = window.width - layout.value.x;
        const translatedOffset = dragOffset.value + e.translationX;

        if (opened) {
          if (translatedOffset > -layout.value.width + margin + 75) {
            runOnJS(close)();
          } else {
            runOnJS(open)();
          }
        } else {
          if (translatedOffset < -75) {
            runOnJS(open)();
          } else {
            runOnJS(close)();
          }
        }
      })
  );

  const translationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value }],
    };
  });

  function measure({ nativeEvent: { layout: newLayout } }: LayoutChangeEvent) {
    layout.value = newLayout;
  }

  return (
    <GestureMonitor gesture={dragGesture}>
      <Animated.View
        style={[styles.operations, translationStyle]}
        onLayout={measure}
      />
    </GestureMonitor>
  );
}

interface ButtonProps {
  text: string;
  append: (text: string) => void;
}

function Button(props: ButtonProps) {
  const alpha = useSharedValue(0);

  const backgroundStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(200, 200, 200, ${alpha.value})`,
    };
  });

  const tapHandler = useAnimatedGesture(
    Gesture.tap()
      .setOnEnd((_e, s) => {
        'worklet';
        alpha.value = withTiming(0, { duration: TAP_ANIMATION_DURATION });

        if (s) {
          runOnJS(props.append)(props.text);
        }
      })
      .setOnBegan((_e) => {
        'worklet';
        alpha.value = withTiming(0.75, { duration: TAP_ANIMATION_DURATION });
      })
  );

  return (
    <GestureMonitor gesture={tapHandler}>
      <Animated.View style={styles.button}>
        <Animated.View style={[styles.buttonTextContainer, backgroundStyles]}>
          <Text style={styles.buttonText}>{props.text}</Text>
        </Animated.View>
      </Animated.View>
    </GestureMonitor>
  );
}

const styles = StyleSheet.create({
  home: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 0,
  },
  numPad: {
    width: '92%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  output: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  expression: {
    width: '100%',
    flexDirection: 'column',
    padding: 30,
  },
  expressionText: {
    fontSize: 35,
    alignSelf: 'flex-end',
  },
  expressionResult: {
    fontSize: 24,
    alignSelf: 'flex-end',
    color: 'rgb(64, 64, 64)',
  },
  handleView: {
    width: '100%',
    height: 50,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  handle: {
    width: 50,
    height: 8,
    backgroundColor: 'rgb(200, 200, 200)',
    alignSelf: 'center',
    borderRadius: 10,
  },
  input: {
    display: 'flex',
    flexDirection: 'row',
  },
  operations: {
    backgroundColor: 'blue',
    width: '86%',
  },
  button: {
    width: '33.33%',
    height: '33.33%',
    aspectRatio: 1,
    padding: 15,
  },
  buttonText: {
    alignSelf: 'center',
    fontSize: 25,
  },
  buttonTextContainer: {
    borderRadius: 150,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
});
