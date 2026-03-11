import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import {
  GestureHandlerRootView,
  Clickable,
  ClickableProps,
} from 'react-native-gesture-handler';

type ButtonWrapperProps = ClickableProps & {
  name: string;
  color: string;
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
  ANDROID: '#34a853',
  WEB: '#1067c4',
};

function ClickableWrapper({ name, color, ...rest }: ButtonWrapperProps) {
  return (
    <Clickable
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => console.log(`[${name}] onPress`)}
      onLongPress={() => console.log(`[${name}] onLongPress`)}
      {...rest}>
      <Text style={styles.buttonText}>{name}</Text>
    </Clickable>
  );
}

export default function ClickableExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Buttons replacements</Text>
          <Text>New component that replaces all buttons and pressables.</Text>

          <View style={styles.row}>
            <ClickableWrapper name="Base" color={COLORS.PURPLE} />

            <ClickableWrapper
              name="Rect"
              color={COLORS.WEB}
              underlayActiveOpacity={0.105}
            />

            <ClickableWrapper
              name="Borderless"
              activeOpacity={0.3}
              color={COLORS.RED}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Custom animations</Text>
          <Text>Animated overlay.</Text>

          <View style={styles.row}>
            <ClickableWrapper
              name="Click me!"
              color={COLORS.YELLOW}
              underlayActiveOpacity={0.3}
            />

            <ClickableWrapper
              name="Click me!"
              color={COLORS.NAVY}
              underlayInitialOpacity={0.7}
              underlayActiveOpacity={0.5}
              underlayColor="#217838"
            />
          </View>

          <Text>Animated component.</Text>

          <View style={styles.row}>
            <ClickableWrapper
              name="Click me!"
              color={COLORS.KINDA_BLUE}
              initialOpacity={0.3}
              activeOpacity={0.7}
            />

            <ClickableWrapper
              name="Click me!"
              color={COLORS.KINDA_RED}
              initialOpacity={0.7}
              activeOpacity={0.5}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Android ripple</Text>
          <Text>Configurable ripple effect on Clickable component.</Text>

          <View style={styles.row}>
            <ClickableWrapper
              name="Default"
              color={COLORS.ANDROID}
              androidRipple={{}}
            />

            <ClickableWrapper
              name="Borderless"
              color={COLORS.ANDROID}
              androidRipple={{
                color: COLORS.KINDA_BLUE,
                borderless: true,
                radius: 55,
              }}
            />
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  button: {
    width: 110,
    height: 50,
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
