import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

export default function NestedPressableExample() {
  const pressIn = (name: string) => {
    console.log(`${name} Pressable pressed in`);
  };

  const pressOut = (name: string) => {
    console.log(`${name} Pressable pressed out`);
  };

  const press = (name: string) => {
    console.log(`${name} Pressable pressed`);
  };

  const hoverIn = (name: string) => {
    console.log(`${name} Hovered in`);
  };

  const hoverOut = (name: string) => {
    console.log(`${name} Hovered out`);
  };

  const longPress = (name: string) => {
    console.log(`${name} Long pressed`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Pressable
        style={({ pressed }) => [
          styles.pressableFirstLayer,
          pressed && styles.highlight,
        ]}
        onPressIn={() => pressIn('First')}
        onPressOut={() => pressOut('First')}
        onPress={() => press('First')}
        onHoverIn={() => hoverIn('First')}
        onHoverOut={() => hoverOut('First')}
        onLongPress={() => longPress('First')}>
        <Pressable
          style={({ pressed }) => [
            styles.pressableSecondLayer,
            pressed && styles.highlight,
          ]}
          onPressIn={() => pressIn('Second')}
          onPressOut={() => pressOut('Second')}
          onPress={() => press('Second')}
          onHoverIn={() => hoverIn('Second')}
          onHoverOut={() => hoverOut('Second')}
          onLongPress={() => longPress('Second')}>
          <Pressable
            style={({ pressed }) => [
              styles.pressableThirdLayer,
              pressed && styles.highlight,
            ]}
            onPressIn={() => pressIn('Third')}
            onPressOut={() => pressOut('Third')}
            onPress={() => press('Third')}
            onHoverIn={() => hoverIn('Third')}
            onHoverOut={() => hoverOut('Third')}
            onLongPress={() => longPress('Third')}>
            <Text style={styles.rectText}>Third Pressable</Text>
          </Pressable>
          <Text style={styles.rectText}>Second Pressable</Text>
        </Pressable>
        <Text style={styles.rectText}>First Pressable</Text>
      </Pressable>
    </View>
  );
}

const BACKGROUND_COLOR = '#F5FCFF';

const styles = StyleSheet.create({
  pressableFirstLayer: {
    backgroundColor: '#FFD6E0',
    padding: 40,
    margin: 'auto',
  },
  pressableSecondLayer: {
    backgroundColor: '#F29DC3',
    padding: 40,
    margin: 'auto',
  },
  pressableThirdLayer: {
    width: 160,
    height: 160,
    margin: 'auto',
    backgroundColor: 'mediumpurple',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  },
  rectText: {
    color: BACKGROUND_COLOR,
    fontWeight: '700',
    position: 'absolute',
    right: 5,
    bottom: 2,
  },
  highlight: {
    backgroundColor: 'red',
  },
});
