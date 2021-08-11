import React from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import {
  GestureMonitor,
  Gesture,
  useGesture,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useAnimatedGesture } from '../useAnimatedGesture';

const window = Dimensions.get('window');

export default function CalculatorUI() {
  const outputOffset = useSharedValue(0);
  const [history, setHistory] = useState([]);
  const [expression, setExpression] = useState('');

  function measure(e) {
    outputOffset.value = -e.nativeEvent.layout.height;
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

function Output(props) {
  const layout = useRef({});
  const scrollView = useRef();
  const drag = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const [opened, setOpened] = useState(false);

  function measure(e) {
    layout.current = e.nativeEvent.layout;
  }

  function open() {
    drag.value = withTiming(-props.offset.value, { duration: 300 });
    dragOffset.value = -props.offset.value;

    setOpened(true);
  }

  function close() {
    drag.value = withTiming(0, { duration: 300 });
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
        let value = dragOffset.value + e.translationY;

        if (value > -props.offset.value) {
          drag.value = -props.offset.value;
        } else if (value < 0) {
          drag.value = 0;
        } else {
          drag.value = value;
        }
      })
      .setOnEnd((e, s) => {
        'worklet';
        let value = dragOffset.value + e.translationY;

        if (opened) {
          if (value < -props.offset.value - 100) runOnJS(close)();
          else runOnJS(open)();
        } else {
          if (value > 100) runOnJS(open)();
          else runOnJS(close)();
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
          ref={(ref) => {
            if (!opened && ref) ref.scrollToEnd({ animated: false });
            scrollView.current = ref;
          }}
          enabled={opened}
          contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexGrow: 1 }} />

          {props.history.map((exp, index) => {
            return <Expression expression={exp} key={index} />;
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

function Expression(props) {
  return (
    <View style={styles.expression}>
      <View style={{ flexDirection: 'column' }}>
        <Text style={styles.expressionText}>{props.expression}</Text>
        <Text style={styles.expressionResult}>{props.expression}</Text>
      </View>
    </View>
  );
}

function Input(props) {
  const translationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: props.offset.value }],
    };
  });

  function append(symbol) {
    if (symbol == '<') {
      props.setHistory((h) => [...h, props.expression]);
      props.setExpression((e) => '');
    } else {
      props.setExpression((e) => e + symbol);
    }
  }

  return (
    <Animated.View
      style={[styles.input, translationStyle]}
      onLayout={props.measure}>
      <NumPad append={append} />
      <Operations append={append} />
    </Animated.View>
  );
}

function NumPad(props) {
  let buttons = [7, 8, 9, 4, 5, 6, 1, 2, 3, '<', 0, '.'];
  return (
    <View style={styles.numPad}>
      {buttons.map((text) => {
        return <Button text={text} key={text} append={props.append} />;
      })}
    </View>
  );
}

function Operations(props) {
  const layout = useSharedValue({});
  const drag = useSharedValue(0);
  const dragOffset = useSharedValue(0);
  const [opened, setOpened] = useState(false);

  function open() {
    let margin = window.width - layout.value.x;

    dragOffset.value = -layout.value.width + margin;
    drag.value = withTiming(-layout.value.width + margin, { duration: 300 });

    setOpened(true);
  }

  function close() {
    dragOffset.value = 0;
    drag.value = withTiming(0, { duration: 300 });

    setOpened(false);
  }

  const dragGesture = useAnimatedGesture(
    Gesture.pan()
      .setRef(useRef())
      .setOnUpdate((e) => {
        'worklet';
        let margin = window.width - layout.value.x;
        let value = dragOffset.value + e.translationX;

        if (value < -layout.value.width + margin) {
          drag.value = -layout.value.width + margin;
        } else if (value > 0) {
          drag.value = 0;
        } else {
          drag.value = value;
        }
      })
      .setOnEnd((e, s) => {
        'worklet';
        let margin = window.width - layout.value.x;
        let value = dragOffset.value + e.translationX;

        if (opened) {
          if (value > -layout.value.width + margin + 75) runOnJS(close)();
          else runOnJS(open)();
        } else {
          if (value < -75) runOnJS(open)();
          else runOnJS(close)();
        }
      })
  );

  const translationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value }],
    };
  });

  function measure(e) {
    layout.value = e.nativeEvent.layout;
  }

  return (
    <GestureMonitor gesture={dragGesture}>
      <Animated.View
        style={[styles.operations, translationStyle]}
        onLayout={measure}></Animated.View>
    </GestureMonitor>
  );
}

function Button(props) {
  const alpha = useSharedValue(0);

  const backgroundStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(200, 200, 200, ${alpha.value})`,
    };
  });

  const tapHandler = useAnimatedGesture(
    Gesture.tap()
      .setOnEnd((e, s) => {
        'worklet';
        alpha.value = withTiming(0, { duration: 100 });

        if (s) {
          runOnJS(props.append)(props.text);
        }
      })
      .setOnBegan((e) => {
        'worklet';
        alpha.value = withTiming(0.75, { duration: 100 });
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 30,
  },
  expressionText: {
    fontSize: 35,
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
