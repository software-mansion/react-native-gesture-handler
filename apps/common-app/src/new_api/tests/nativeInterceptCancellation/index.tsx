import React, { useState } from 'react';
import {
  DrawerLayoutAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, useIndexedLogger } from '../../../common';

// A native view takes over the touch without the root ever seeing a
// disallow-intercept request. The framework still sends ACTION_CANCEL to the
// tap's detector, which is what cancels the tap below.
// - Pager: swipe the inner pager starting on the box. The inner pager host
//   asks its ancestors not to intercept on DOWN, so the pager's own request on
//   MOVE stops at the already flagged page view and never reaches the root.
// - Drawer: swipe the drawer open from the right edge starting on the box.
//   DrawerLayout intercepts on MOVE and never requests at all. With gesture
//   navigation the system back swipe takes the edge, use 3-button navigation.
// In both cases the pager / drawer moves and the tap count stays the same.

type Mode = 'pager' | 'drawer';

type TapBoxProps = {
  count: number;
  onTap: () => void;
  log: (message: string) => void;
};

function TapBox({ count, onTap, log }: TapBoxProps) {
  const colorProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLORS.NAVY, COLORS.KINDA_BLUE]
    ),
  }));

  const tap = useTapGesture({
    onBegin: () => {
      log('onBegin');
      colorProgress.value = withTiming(1, { duration: 100 });
    },
    onActivate: () => {
      log('onActivate');
      scheduleOnRN(onTap);
    },
    onDeactivate: () => {
      log('onDeactivate');
    },
    onFinalize: () => {
      log('onFinalize');
      colorProgress.value = withTiming(0, { duration: 100 });
    },
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View testID="tap-box" style={[styles.box, animatedStyle]}>
        <Text style={styles.boxText}>Tap count: {count}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function PagerMode(props: TapBoxProps) {
  return (
    <PagerView style={styles.flex} initialPage={0}>
      <View key="outer-1" style={styles.flex}>
        <PagerView style={styles.flex} initialPage={0}>
          <View key="inner-1" style={styles.flex}>
            <TapBox {...props} />
          </View>
          <View key="inner-2" style={[styles.flex, styles.center]}>
            <Text testID="inner-page-2">Inner page 2</Text>
          </View>
        </PagerView>
      </View>
      <View key="outer-2" style={[styles.flex, styles.center]}>
        <Text>Outer page 2</Text>
      </View>
    </PagerView>
  );
}

function DrawerMode(props: TapBoxProps) {
  return (
    <DrawerLayoutAndroid
      style={styles.flex}
      drawerWidth={300}
      drawerPosition="right"
      renderNavigationView={() => (
        <View testID="drawer-panel" style={[styles.flex, styles.center]}>
          <Text>Drawer</Text>
        </View>
      )}>
      <TapBox {...props} />
    </DrawerLayoutAndroid>
  );
}

export default function NativeInterceptCancellationExample() {
  const [mode, setMode] = useState<Mode>('pager');
  const [count, setCount] = useState(0);
  const log = useIndexedLogger();

  const boxProps = {
    count,
    log,
    onTap: () => setCount((c) => c + 1),
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.hint}>
          Swipe the pager or drag the drawer open from the right edge, starting
          on the box. The count must not change.
        </Text>
        <View style={styles.buttons}>
          <ModeButton mode="pager" current={mode} onSelect={setMode} />
          <ModeButton mode="drawer" current={mode} onSelect={setMode} />
        </View>
      </View>
      {mode === 'pager' ? (
        <PagerMode {...boxProps} />
      ) : (
        <DrawerMode {...boxProps} />
      )}
    </View>
  );
}

type ModeButtonProps = {
  mode: Mode;
  current: Mode;
  onSelect: (mode: Mode) => void;
};

function ModeButton({ mode, current, onSelect }: ModeButtonProps) {
  return (
    <Pressable
      testID={`mode-${mode}`}
      style={[styles.button, mode === current && styles.buttonActive]}
      onPress={() => onSelect(mode)}>
      <Text style={styles.buttonText}>
        {mode === 'pager' ? 'Pager' : 'Drawer'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    padding: 12,
    gap: 8,
    backgroundColor: COLORS.offWhite,
  },
  hint: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 14,
  },
  buttons: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: COLORS.KINDA_YELLOW,
  },
  buttonActive: { backgroundColor: COLORS.YELLOW },
  buttonText: { fontWeight: '600', color: COLORS.NAVY },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
});
