import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

export default function EmptyExample() {
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
    <View style={styles.pressRectContainer}>
      <View style={styles.hitRectContainer}>
        <View style={styles.pressableWrapper}>
          <Pressable
            style={styles.pressable}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={press}
            onHoverIn={hoverIn}
            onHoverOut={hoverOut}
            onLongPress={longPress}
            hitSlop={20}
            pressRetentionOffset={20}>
            <View style={styles.textWrapper}>
              <Text style={styles.text}>Pressable!</Text>
            </View>
          </Pressable>
        </View>
        <Text style={styles.rectText}>Hit Rect</Text>
      </View>
      <Text style={styles.rectText}>Press Rect</Text>
    </View>
  );
}

const BG_COLOR = '#F5FCFF';

const styles = StyleSheet.create({
  pressRectContainer: {
    backgroundColor: '#FFD6E0',
    padding: 20,
    width: 200,
    height: 200,
    margin: 'auto',
  },
  hitRectContainer: {
    backgroundColor: '#F29DC3',
    padding: 20,
    width: 160,
    height: 160,
    margin: 'auto',
  },
  rectText: {
    color: BG_COLOR,
    fontWeight: '700',
    position: 'absolute',
    right: 5,
    bottom: 2,
  },
  pressableWrapper: {
    backgroundColor: 'mediumpurple',
  },
  pressable: {
    width: 120,
    height: 120,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: BG_COLOR,
  },
});
