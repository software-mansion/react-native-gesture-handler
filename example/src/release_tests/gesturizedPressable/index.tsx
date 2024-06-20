import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { Pressable as GesturizedPressable } from 'react-native-gesture-handler';

export default function Example() {
  const pressIn = (id: any) => {
    console.log(`[${id}] Pressable pressed in`);
  };

  const pressOut = (id: any) => {
    console.log(`[${id}] Pressable pressed out`);
  };

  const press = (id: any) => {
    console.log(`[${id}] Pressable pressed`);
  };

  const hoverIn = (id: any) => {
    console.log(`[${id}] Hovered in`);
  };

  const hoverOut = (id: any) => {
    console.log(`[${id}] Hovered out`);
  };

  const focus = (id: any) => {
    console.log(`[${id}] Focused pressable`);
  };

  const blur = (id: any) => {
    console.log(`[${id}] Blurred pressable`);
  };

  const longPress = (id: any) => {
    console.log(`[${id}] Long pressed`);
  };

  const hitSlop = 40;
  const pressRetentionOffset = 40;

  return (
    <View style={styles.container}>
      <View style={styles.slopIndicator}>
        <Text>Hit Slop</Text>
      </View>
      <View style={styles.retentionIndicator}>
        <Text>Retention Offset</Text>
      </View>
      <GesturizedPressable
        style={styles.pressable}
        hitSlop={hitSlop}
        pressRetentionOffset={pressRetentionOffset}
        onPressIn={() => pressIn('GH')}
        onPressOut={() => pressOut('GH')}
        onPress={() => press('GH')}
        onHoverIn={() => hoverIn('GH')}
        onHoverOut={() => hoverOut('GH')}
        onLongPress={() => longPress('GH')}>
        <View style={styles.textWrapper}>
          <Text style={styles.text}>Gesturized press!</Text>
        </View>
      </GesturizedPressable>
      <Pressable
        style={styles.pressable}
        hitSlop={hitSlop} // ios only, check android
        pressRetentionOffset={pressRetentionOffset} // counts relative to hitSlop
        onPressIn={() => pressIn('P')}
        onPressOut={() => pressOut('P')}
        onPress={() => press('P')}
        onHoverIn={() => hoverIn('P')}
        onHoverOut={() => hoverOut('P')}
        onLongPress={() => longPress('P')}
        onFocus={() => focus('P')} // web only
        onBlur={() => blur('P')} // web only
      >
        <View style={styles.textWrapper}>
          <Text style={styles.text}>Legacy press!</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    gap: 60,
  },
  pressable: {
    backgroundColor: 'mediumpurple',
    width: 120,
    height: 120,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F5FCFF',
  },
  slopIndicator: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: 380,
    width: 200,
    padding: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  retentionIndicator: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: 440,
    width: 280,
    padding: 4,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
