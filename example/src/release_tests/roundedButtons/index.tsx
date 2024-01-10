import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
  RectButton,
} from 'react-native-gesture-handler';

const MyButton = RectButton;

export default function ComplexUI() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Avatars />
          <View style={styles.paddedContainer}>
            <Gallery />
            <Gallery />
            <Gallery />
            <Gallery />
            <Gallery />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
const colors = ['#782AEB', '#38ACDD', '#57B495', '#FF6259', '#FFD61E'];

function Avatars() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {colors.map((color) => (
        <MyButton
          key={color}
          style={[styles.avatars, { backgroundColor: color }]}>
          <Text style={styles.avatarLabel}>{color.slice(1, 3)}</Text>
        </MyButton>
      ))}
    </ScrollView>
  );
}

function Gallery() {
  return (
    <View style={[styles.container, styles.gap, styles.marginBottom]}>
      <MyButton style={styles.fullWidthButton} />
      <View style={[styles.row, styles.gap]}>
        <MyButton style={styles.leftButton} />
        <MyButton style={styles.rightButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marginBottom: {
    marginBottom: 20,
  },
  paddedContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 24,
    color: 'black',
  },
  gap: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#232736',
    marginVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  listItemLabel: {
    fontSize: 20,
    flex: 1,
    color: 'white',
    marginLeft: 20,
  },
  listItemIcon: {
    fontSize: 32,
  },
  row: {
    flexDirection: 'row',
  },
  avatars: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: '#001A72',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 30,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#F8F9FF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullWidthButton: {
    width: '100%',
    height: 160,
    backgroundColor: '#FF6259',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderWidth: 1,
  },
  leftButton: {
    flex: 1,
    height: 160,
    backgroundColor: '#FFD61E',
    borderBottomLeftRadius: 30,
    borderWidth: 5,
  },
  rightButton: {
    flex: 1,
    backgroundColor: '#782AEB',
    height: 160,
    borderBottomRightRadius: 30,
    borderWidth: 8,
  },
});
