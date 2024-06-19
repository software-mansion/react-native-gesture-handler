import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { Pressable as GesturizedPressable } from 'react-native-gesture-handler';

export default function Example() {
  const pressIn = (event: any) => {
    console.log(`[${event}] Pressable pressed in`);
  };

  const pressOut = (event: any) => {
    console.log(`[${event}] Pressable pressed out`);
  };

  const press = (event: any) => {
    console.log(`[${event}] Pressable pressed`);
  };

  const hoverIn = (event: any) => {
    console.log(`[${event}] Hovered in`);
  };

  const hoverOut = (event: any) => {
    console.log(`[${event}] Hovered out`);
  };

  const focus = (event: any) => {
    console.log(`[${event}] Focused pressable`);
  };

  const blur = (event: any) => {
    console.log(`[${event}] Blurred pressable`);
  };

  const longPress = (event: any) => {
    console.log(`[${event}] Long pressed`);
  };

  return (
    <>
      <View style={styles.container}>
        <GesturizedPressable
          style={styles.pressable}
          onPressIn={() => pressIn('GH')}
          onPressOut={() => pressOut('GH')}
          onPress={() => press('GH')}
          onHoverIn={() => hoverIn('GH')}
          onHoverOut={() => hoverOut('GH')}
          onFocus={() => focus('GH')}
          onBlur={() => blur('GH')}
          onLongPress={() => longPress('GH')}>
          <View style={styles.textWrapper}>
            <Text style={styles.text}>Gesturized press!</Text>
          </View>
        </GesturizedPressable>
      </View>
      <View style={styles.container}>
        <Pressable
          style={styles.pressable}
          onPressIn={() => pressIn('P')}
          onPressOut={() => pressOut('P')}
          onPress={() => press('P')}
          onHoverIn={() => hoverIn('P')}
          onHoverOut={() => hoverOut('P')}
          onFocus={() => focus('P')}
          onBlur={() => blur('P')}
          onLongPress={() => longPress('P')}>
          <View style={styles.textWrapper}>
            <Text style={styles.text}>Legacy press!</Text>
          </View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  pressable: {
    backgroundColor: 'mediumpurple',
    width: 120,
    height: 120,
    margin: 'auto',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#F5FCFF',
  },
});
