import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import {
  GestureHandlerRootView,
  Clickable,
  ClickableProps,
  ClickableOpacityMode,
  ClickableAnimationTarget,
} from 'react-native-gesture-handler';

type ButtonWrapperProps = ClickableProps & {
  name: string;
  color: string;
  [key: string]: any;
};

export const COLORS = {
  PURPLE: '#7d63d9',
  NAVY: '#17327a',
  RED: '#b53645',
  YELLOW: '#c98d1f',
  GREEN: '#167a5f',
  GRAY: '#7f879b',
  KINDA_RED: '#d97973',
  KINDA_YELLOW: '#d6b24a',
  KINDA_GREEN: '#4f9a84',
  KINDA_BLUE: '#5f97c8',
};

function ButtonWrapper({ name, color, ...rest }: ButtonWrapperProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{name}</Text>

      <Clickable
        style={[styles.button, { backgroundColor: color }]}
        onPress={() => console.log(`[${name}] onPress`)}
        onLongPress={() => console.log(`[${name}] onLongPress`)}
        {...rest}>
        <Text style={styles.buttonText}>Click me!</Text>
      </Clickable>
    </View>
  );
}

export default function ClickableExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ButtonWrapper name="Clickable (BaseButton)" color={COLORS.PURPLE} />

        <ButtonWrapper
          name="Clickable (RectButton)"
          color={COLORS.NAVY}
          activeOpacity={0.105}
          opacityMode={ClickableOpacityMode.INCREASE}
          animationTarget={ClickableAnimationTarget.UNDERLAY}
        />

        <ButtonWrapper
          name="Clickable (BorderlessButton)"
          activeOpacity={0.3}
          opacityMode={ClickableOpacityMode.DECREASE}
          animationTarget={ClickableAnimationTarget.COMPONENT}
          color={COLORS.RED}
        />

        <ButtonWrapper
          name="Android ripple"
          color={COLORS.KINDA_GREEN}
          rippleColor={'blue'}
          rippleRadius={100}
        />

        <ButtonWrapper
          name="Android ripple (borderless)"
          color={COLORS.KINDA_BLUE}
          borderless
          rippleColor={'blue'}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  button: {
    width: 200,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
