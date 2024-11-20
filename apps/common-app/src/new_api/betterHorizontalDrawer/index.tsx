import React, { useRef, useState } from 'react';

import { StyleSheet, Text, View, TextInput } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';
import {
  DrawerLayoutController,
  DrawerLayout,
} from './BetterHorizonatalDrawer';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

type DrawerType = 'front' | 'back' | 'slide';

const TYPES: DrawerType[] = ['front', 'back', 'back', 'slide'];
const PARALLAX = [false, false, true, false];

interface PageProps {
  fromLeft: boolean;
  type: DrawerType;
  parallaxOn: boolean;
  flipSide: () => void;
  nextType: () => void;
  openDrawer: () => void;
}

function Page({
  fromLeft,
  type,
  parallaxOn,
  flipSide,
  nextType,
  openDrawer,
}: PageProps) {
  return (
    <View style={styles.page}>
      <Text style={styles.pageText}>Hi 👋</Text>
      <RectButton style={styles.rectButton} onPress={flipSide}>
        <Text style={styles.rectButtonText}>
          Drawer to the {fromLeft ? 'left' : 'right'}! {'->'} Flip
        </Text>
      </RectButton>
      <RectButton style={styles.rectButton} onPress={nextType}>
        <Text style={styles.rectButtonText}>
          Type {type} {parallaxOn && 'with parallax!'} -&gt; Next
        </Text>
      </RectButton>
      <RectButton style={styles.rectButton} onPress={openDrawer}>
        <Text style={styles.rectButtonText}>Open drawer</Text>
      </RectButton>
      <TextInput
        style={styles.pageInput}
        placeholder="Just an input field to test kb dismiss mode"
      />
    </View>
  );
}

function DrawerContent(
  offset: Animated.SharedValue<number>,
  parallax: boolean,
  fromLeft: boolean
) {
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: parallax
          ? interpolate(offset.value, [0, 1], [fromLeft ? -50 : 50, 0])
          : 0,
      },
    ],
  }));

  return (
    <Animated.View style={[styles.drawerContainer, animatedStyles]}>
      <Text style={styles.drawerText}>
        {parallax ? 'Drawer with parallax' : 'Drawer'}
      </Text>
    </Animated.View>
  );
}

export default function Example() {
  const [onLeft, setOnLeft] = useState(true);
  const [type, setType] = useState(0);
  const controller = useRef<DrawerLayoutController>(null);

  return (
    <View style={styles.container}>
      <DrawerLayout
        drawerPosition={onLeft ? 'left' : 'right'}
        drawerType={TYPES[type]}
        renderNavigationView={(offset) => {
          return DrawerContent(offset, PARALLAX[type], onLeft);
        }}
        keyboardDismissMode="on-drag"
        drawerBackgroundColor="white"
        ref={controller}>
        <Page
          fromLeft={onLeft}
          flipSide={() => {
            setOnLeft(!onLeft);
          }}
          type={TYPES[type]}
          nextType={() => {
            setType((type + 1) % TYPES.length);
          }}
          parallaxOn={PARALLAX[type]}
          openDrawer={() => {
            controller.current?.open();
          }}
        />
      </DrawerLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: 'gray',
  },
  pageText: {
    fontSize: 21,
    color: 'white',
  },
  rectButton: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
  },
  rectButtonText: {
    backgroundColor: 'transparent',
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 10,
  },
  pageInput: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#eee',
  },
  drawerText: {
    margin: 10,
    fontSize: 15,
    textAlign: 'left',
  },
});
