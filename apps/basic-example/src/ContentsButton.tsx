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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Avatars />
          <View style={styles.paddedContainer}>
            <Gallery />
            <SizeConstraints />
            <FlexboxTests />
            <PositioningTests />
            <SpacingTests />
            <VisualEffects />
            <ComplexCombinations />
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
    <View style={[styles.section]}>
      <Text style={styles.sectionTitle}>Basic Gallery</Text>
      <View style={[styles.gap]}>
        <MyButton style={styles.fullWidthButton} />
        <View style={[styles.row, styles.gap]}>
          <MyButton style={styles.leftButton} />
          <MyButton style={styles.rightButton} />
        </View>
        <MyButton style={[styles.fullWidthButton, { borderRadius: 20 }]} />
      </View>
    </View>
  );
}

function SizeConstraints() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Size Constraints</Text>
      <View style={[styles.row, styles.gap]}>
        <MyButton style={styles.minMaxButton}>
          <Text style={styles.buttonText}>Min/Max</Text>
        </MyButton>
        <MyButton style={styles.aspectRatioButton}>
          <Text style={styles.buttonText}>1:1</Text>
        </MyButton>
        <MyButton style={styles.flexGrowButton}>
          <Text style={styles.buttonText}>Flex</Text>
        </MyButton>
      </View>
    </View>
  );
}

function FlexboxTests() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Flexbox Layouts</Text>
      <View style={styles.flexContainer}>
        <MyButton style={styles.flexStart}>
          <Text style={styles.buttonText}>Start</Text>
        </MyButton>
        <MyButton style={styles.flexCenter}>
          <Text style={styles.buttonText}>Center</Text>
        </MyButton>
        <MyButton style={styles.flexEnd}>
          <Text style={styles.buttonText}>End</Text>
        </MyButton>
      </View>
      <View style={styles.flexWrapContainer}>
        <MyButton style={styles.wrapItem}>
          <Text style={styles.buttonText}>Wrap 1</Text>
        </MyButton>
        <MyButton style={styles.wrapItem}>
          <Text style={styles.buttonText}>Wrap 2</Text>
        </MyButton>
        <MyButton style={styles.wrapItem}>
          <Text style={styles.buttonText}>Wrap 3</Text>
        </MyButton>
        <MyButton style={styles.wrapItem}>
          <Text style={styles.buttonText}>Wrap 4</Text>
        </MyButton>
      </View>
    </View>
  );
}

function PositioningTests() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Positioning</Text>
      <View style={styles.positionContainer}>
        <MyButton style={styles.zIndexButton}>
          <Text style={styles.buttonText}>Z-Index</Text>
        </MyButton>
        <MyButton style={styles.absoluteButton}>
          <Text style={styles.buttonText}>Absolute</Text>
        </MyButton>
        <MyButton style={styles.relativeButton}>
          <Text style={styles.buttonText}>Relative</Text>
        </MyButton>
      </View>
    </View>
  );
}

function SpacingTests() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spacing & Overflow</Text>
      <View style={[styles.row, styles.gap]}>
        <MyButton style={styles.paddingButton}>
          <Text style={styles.buttonText}>Padding</Text>
        </MyButton>
        <MyButton style={styles.marginButton}>
          <Text style={styles.buttonText}>Margin</Text>
        </MyButton>
        <MyButton style={styles.overflowButton}>
          <Text style={styles.longText}>Overflow Hidden Test</Text>
        </MyButton>
      </View>
    </View>
  );
}

function VisualEffects() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Visual Effects</Text>
      <View style={[styles.row, styles.gap]}>
        <MyButton style={styles.shadowButton}>
          <Text style={styles.buttonText}>Shadow</Text>
        </MyButton>
        <MyButton style={styles.opacityButton}>
          <Text style={styles.buttonText}>Opacity</Text>
        </MyButton>
      </View>
    </View>
  );
}

function ComplexCombinations() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Complex Combinations</Text>
      <View style={styles.complexGrid}>
        <MyButton style={styles.complexButton1}>
          <Text style={styles.buttonText}>Complex 1</Text>
        </MyButton>
        <MyButton style={styles.complexButton2}>
          <Text style={styles.buttonText}>Complex 2</Text>
        </MyButton>
        <MyButton style={styles.complexButton3}>
          <Text style={styles.buttonText}>Complex 3</Text>
        </MyButton>
        <MyButton style={styles.complexButton4}>
          <Text style={styles.buttonText}>Complex 4</Text>
        </MyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  paddedContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  gap: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
  },

  // Avatar styles
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

  // Gallery styles
  fullWidthButton: {
    width: '100%',
    height: 160,
    backgroundColor: '#FF6259',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderWidth: 1,
    borderColor: '#000',
  },
  leftButton: {
    flex: 1,
    height: 160,
    backgroundColor: '#FFD61E',
    borderBottomLeftRadius: 30,
    borderWidth: 5,
    borderColor: '#000',
  },
  rightButton: {
    flex: 1,
    backgroundColor: '#782AEB',
    height: 160,
    borderBottomRightRadius: 30,
    borderWidth: 8,
    borderColor: '#000',
  },

  // Size constraint styles
  minMaxButton: {
    minWidth: 80,
    maxWidth: 120,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: '#38ACDD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aspectRatioButton: {
    width: 80,
    aspectRatio: 1,
    backgroundColor: '#57B495',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexGrowButton: {
    flexGrow: 1,
    height: 60,
    backgroundColor: '#FF6259',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Flexbox styles
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  flexStart: {
    alignSelf: 'flex-start',
    backgroundColor: '#782AEB',
    padding: 10,
    borderRadius: 5,
  },
  flexCenter: {
    alignSelf: 'center',
    backgroundColor: '#38ACDD',
    padding: 10,
    borderRadius: 5,
  },
  flexEnd: {
    alignSelf: 'flex-end',
    backgroundColor: '#57B495',
    padding: 10,
    borderRadius: 5,
  },
  flexWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  wrapItem: {
    width: '48%',
    height: 50,
    backgroundColor: '#FFD61E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Positioning styles
  positionContainer: {
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    position: 'relative',
  },
  absoluteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6259',
    padding: 8,
    borderRadius: 5,
  },
  relativeButton: {
    position: 'relative',
    top: 20,
    left: 20,
    backgroundColor: '#782AEB',
    padding: 8,
    borderRadius: 5,
  },
  zIndexButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: '#57B495',
    padding: 8,
    borderRadius: 5,
  },

  // Spacing styles
  paddingButton: {
    flex: 1,
    backgroundColor: '#38ACDD',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginButton: {
    flex: 1,
    backgroundColor: '#FFD61E',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#782AEB',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Visual effect styles
  shadowButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#FF6259',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  opacityButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#782AEB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },

  // Complex combination styles
  complexGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  complexButton1: {
    width: '48%',
    height: 100,
    backgroundColor: '#FF6259',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#782AEB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 5,
  },
  complexButton2: {
    width: '48%',
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: '#38ACDD',
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  complexButton3: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: '#57B495',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFD61E',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
    marginTop: 10,
  },
  complexButton4: {
    width: '48%',
    height: 80,
    backgroundColor: '#FFD61E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6259',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#782AEB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 10,
  },

  // Text styles
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  longText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
