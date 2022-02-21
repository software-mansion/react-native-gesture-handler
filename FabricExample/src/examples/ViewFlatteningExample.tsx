import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {StyleSheet, Text, View, Animated} from 'react-native';

import React, {useState} from 'react';

export default function ViewFlatteningExample() {
  const [state, setState] = useState(1);

  const tap1 = Gesture.Tap().onStart(() => console.log('tap!'));
  const tap2 = Gesture.Tap().onStart(() => {
    setState(state + 1);
    console.log('tap!');
  });
  const tap3 = Gesture.Tap().onStart(() => console.log('tap!'));
  const tap4 = Gesture.Tap().onStart(() => console.log('tap!'));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text>Parent view flattened</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap1} autowrapWithNonCollapsable>
          <FlattenedParent />
        </GestureDetector>
      </View>

      <Text>
        Parent view not flattened, collapsable=true - child moved to the same
        level as parent
      </Text>

      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap2} autowrapWithNonCollapsable>
          <NotFlattenedParentCollapsable state={state} />
        </GestureDetector>
      </View>

      <Text>
        Parent view not flattened, collapsable=false - structure doesn't change
      </Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap3}>
          <NotFlattenedParentNotCollapsable />
        </GestureDetector>
      </View>

      <Text>Parent is Animated.View</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap4}>
          <ParentAnimatedView />
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

function FlattenedParent() {
  return (
    <View style={[styles.boxWrapper]}>
      <View style={[styles.box, {backgroundColor: 'red'}]} />
    </View>
  );
}

function NotFlattenedParentCollapsable(props) {
  return (
    <View style={[styles.boxWrapper, {backgroundColor: 'cyan'}]}>
      <View style={[styles.box, {backgroundColor: 'red'}]}>
        <Text>{props.state}</Text>
      </View>
    </View>
  );
}

function NotFlattenedParentNotCollapsable() {
  return (
    <View
      style={[styles.boxWrapper, {backgroundColor: 'cyan'}]}
      collapsable={false}
    >
      <View style={[styles.box, {backgroundColor: 'red'}]} />
    </View>
  );
}

function ParentAnimatedView() {
  return (
    <Animated.View style={[styles.boxWrapper]}>
      <View style={[styles.box, {backgroundColor: 'red'}]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  boxWrapper: {
    padding: 10,
    margin: 10,
  },
  box: {
    width: 50,
    height: 50,
    marginRight: 50,
  },
});
