import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { COLORS } from './colors';

declare const performance: {
  now: () => number;
};

function ParentViewFlattenedDemo() {
  const tap = Gesture.Tap().onStart(() =>
    console.log(performance.now(), 'tap!')
  );

  return (
    <>
      <Text>Parent view flattened</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap}>
          <InnerFlattenedParent />
        </GestureDetector>
      </View>
    </>
  );
}

function InnerFlattenedParent() {
  return (
    <View style={[styles.boxWrapper]}>
      {/* parent view will be collapsed */}
      <View style={[styles.box, { backgroundColor: COLORS.NAVY }]} />
    </View>
  );
}

function ParentViewNotFlattenedCollapsableTrueDemo() {
  const tap = Gesture.Tap().onStart(() => {
    console.log(performance.now(), 'tap!');
  });

  return (
    <>
      <Text>Parent view not flattened, collapsable=true</Text>
      <Text>(child moved to the same level as parent)</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap}>
          <InnerNotFlattenedParentCollapsable />
        </GestureDetector>
      </View>
    </>
  );
}

function InnerNotFlattenedParentCollapsable() {
  return (
    <View style={[styles.boxWrapper, { backgroundColor: COLORS.KINDA_BLUE }]}>
      <View style={[styles.box, { backgroundColor: COLORS.NAVY }]} />
    </View>
  );
}

function ParentViewNotFlattenedCollapsableFalseDemo() {
  const tap = Gesture.Tap().onStart(() =>
    console.log(performance.now(), 'tap!')
  );

  return (
    <>
      <Text>Parent view not flattened, collapsable=false</Text>
      <Text>(structure doesn&apos;t change)</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap}>
          <InnerNotFlattenedParentNotCollapsable />
        </GestureDetector>
      </View>
    </>
  );
}

function InnerNotFlattenedParentNotCollapsable() {
  return (
    <View
      style={[styles.boxWrapper, { backgroundColor: COLORS.KINDA_BLUE }]}
      collapsable={false}>
      <View style={[styles.box, { backgroundColor: COLORS.NAVY }]} />
    </View>
  );
}

function ParentAnimatedViewDemo() {
  const tap = Gesture.Tap().onStart(() =>
    console.log(performance.now(), 'tap!')
  );

  return (
    <>
      <Text>Parent is Animated.View</Text>
      <View style={styles.borderedBox}>
        <GestureDetector gesture={tap}>
          <InnerParentAnimatedView />
        </GestureDetector>
      </View>
    </>
  );
}

function InnerParentAnimatedView() {
  return (
    <Animated.View style={[styles.boxWrapper]}>
      <View style={[styles.box, { backgroundColor: COLORS.NAVY }]} />
    </Animated.View>
  );
}

export default function ViewFlatteningScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>
        Fabric comes with a brand new advanced view flattening mechanism. Not
        only some of the views may gets collapsed but also the structure of
        native views hierarchy may differ from the React component tree.
      </Text>
      <ParentViewFlattenedDemo />
      <ParentViewNotFlattenedCollapsableTrueDemo />
      <ParentViewNotFlattenedCollapsableFalseDemo />
      <ParentAnimatedViewDemo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  borderedBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'gray',
    margin: 5,
  },
  boxWrapper: {
    padding: 17,
    margin: 15,
  },
  box: {
    width: 25,
    height: 25,
  },
});
