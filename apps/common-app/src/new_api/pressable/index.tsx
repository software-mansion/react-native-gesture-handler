import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

const SECTION_RADIUS = 40;
const BASE_SIZE = 120;

export default function PressableExample() {
  const pressIn = () => {
    console.log('Pressable pressed in');
  };

  const pressOut = () => {
    console.log('Pressable pressed out');
  };

  const press = () => {
    console.log('Pressable pressed');
  };

  const hoverIn = () => {
    console.log('Hovered in');
  };

  const hoverOut = () => {
    console.log('Hovered out');
  };

  const longPress = () => {
    console.log('Long pressed');
  };
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.pressRectContainer}>
        <View style={styles.hitRectContainer}>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.highlight : styles.pressable
            }
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={press}
            onHoverIn={hoverIn}
            onHoverOut={hoverOut}
            onLongPress={longPress}
            hitSlop={SECTION_RADIUS}
            pressRetentionOffset={SECTION_RADIUS}>
            <View style={styles.textWrapper}>
              <Text style={styles.text}>Pressable!</Text>
            </View>
          </Pressable>
          <Text style={styles.rectText}>Hit Rect</Text>
        </View>
        <Text style={styles.rectText}>Press Rect</Text>
      </View>
    </View>
  );
}

const BACKGROUND_COLOR = '#F5FCFF';

const styles = StyleSheet.create({
  pressRectContainer: {
    backgroundColor: '#FFD6E0',
    padding: SECTION_RADIUS,
    width: BASE_SIZE + 4 * SECTION_RADIUS,
    height: BASE_SIZE + 4 * SECTION_RADIUS,
    margin: 'auto',
  },
  hitRectContainer: {
    backgroundColor: '#F29DC3',
    padding: SECTION_RADIUS,
    width: BASE_SIZE + 2 * SECTION_RADIUS,
    height: BASE_SIZE + 2 * SECTION_RADIUS,
    margin: 'auto',
  },
  rectText: {
    color: BACKGROUND_COLOR,
    fontWeight: '700',
    position: 'absolute',
    right: 5,
    bottom: 2,
  },
  pressable: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    backgroundColor: 'mediumpurple',
  },
  highlight: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    backgroundColor: 'red',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: BACKGROUND_COLOR,
  },
});
