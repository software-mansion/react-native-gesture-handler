import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
  RawButton,
} from 'react-native-gesture-handler';

const UNDERLAY_PROPS = {
  underlayColor: 'red',
  activeUnderlayOpacity: 0.2,
  activeScale: 0.9,
  animationDuration: 200,
  minimumAnimationDuration: 100,
  rippleColor: 'transparent',
} as const;

export default function UnderlayEdgeCases() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.padded}>
            <Section title="Uniform border-radius">
              <Row>
                <RawButton
                  style={[buttonBase, styles.uniformSmall]}
                  {...UNDERLAY_PROPS}>
                  <Label>Small</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.uniformLarge]}
                  {...UNDERLAY_PROPS}>
                  <Label>Large</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.uniformPill]}
                  {...UNDERLAY_PROPS}>
                  <Label>Pill</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Per-corner radii">
              <Row>
                <RawButton
                  style={[buttonBase, styles.perCornerMixed]}
                  {...UNDERLAY_PROPS}>
                  <Label>Mixed</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.perCornerOneZero]}
                  {...UNDERLAY_PROPS}>
                  <Label>One zero</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.perCornerDiagonal]}
                  {...UNDERLAY_PROPS}>
                  <Label>Diagonal</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Logical radii (RTL-aware)">
              <Row>
                <RawButton
                  style={[buttonBase, styles.logicalStart]}
                  {...UNDERLAY_PROPS}>
                  <Label>Start</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.logicalEnd]}
                  {...UNDERLAY_PROPS}>
                  <Label>End</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.logicalMixed]}
                  {...UNDERLAY_PROPS}>
                  <Label>Mixed</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Radius exceeds bounds (CSS scaling)">
              <Row>
                <RawButton
                  style={[buttonBase, styles.oversizedUniform]}
                  {...UNDERLAY_PROPS}>
                  <Label>Uniform</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.oversizedUneven]}
                  {...UNDERLAY_PROPS}>
                  <Label>Uneven</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Uneven borders">
              <Row>
                <RawButton
                  style={[buttonBase, styles.unevenBorderThickBottom]}
                  {...UNDERLAY_PROPS}>
                  <Label>Thick bottom</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.unevenBorderThickLeft]}
                  {...UNDERLAY_PROPS}>
                  <Label>Thick left</Label>
                </RawButton>
              </Row>
              <Row>
                <RawButton
                  style={[buttonBase, styles.unevenBorderAllDifferent]}
                  {...UNDERLAY_PROPS}>
                  <Label>All different</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.unevenBorderWithRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>+ per-corner</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Uneven borders + oversized radius">
              <Row>
                <RawButton
                  style={[buttonBase, styles.unevenOversized]}
                  {...UNDERLAY_PROPS}>
                  <Label>Thick bottom + big radius</Label>
                </RawButton>
              </Row>
              <Row>
                <RawButton
                  style={[buttonBase, styles.unevenOversizedMixed]}
                  {...UNDERLAY_PROPS}>
                  <Label>Mixed corners + thick border</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Zero / no radius with borders">
              <Row>
                <RawButton
                  style={[buttonBase, styles.noBorderRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>No radius</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.zeroBorderRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>Explicit 0</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.someZeroCorners]}
                  {...UNDERLAY_PROPS}>
                  <Label>Some 0</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Inner radius becomes 0 (radius < border)">
              <Row>
                <RawButton
                  style={[buttonBase, styles.radiusLessThanBorder]}
                  {...UNDERLAY_PROPS}>
                  <Label>r=5, bw=10</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.radiusEqualsBorder]}
                  {...UNDERLAY_PROPS}>
                  <Label>r=10, bw=10</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.radiusSlightlyMore]}
                  {...UNDERLAY_PROPS}>
                  <Label>r=12, bw=10</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Elliptical inner corners (uneven border + uniform radius)">
              <Row>
                <RawButton
                  style={[buttonBase, styles.ellipticalInner]}
                  {...UNDERLAY_PROPS}>
                  <Label>bw:5 / bb:16 / r:20</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.ellipticalInnerLarge]}
                  {...UNDERLAY_PROPS}>
                  <Label>bw:2 / bb:20 / r:24</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="No border (radius only)">
              <Row>
                <RawButton
                  style={[buttonBase, styles.noBorderWithRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>Radius only</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.noBorderPill]}
                  {...UNDERLAY_PROPS}>
                  <Label>Pill, no border</Label>
                </RawButton>
              </Row>
            </Section>

            <Section title="Padding interaction">
              <Row>
                <RawButton
                  style={[buttonBase, styles.paddingSmallRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>Padding + small r</Label>
                </RawButton>
                <RawButton
                  style={[buttonBase, styles.paddingLargeRadius]}
                  {...UNDERLAY_PROPS}>
                  <Label>Padding + large r</Label>
                </RawButton>
              </Row>
            </Section>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const buttonBase = {
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  padded: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
  },
  uniformSmall: {
    flex: 1,
    height: 70,
    backgroundColor: '#FFD61E',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  uniformLarge: {
    flex: 1,
    height: 70,
    backgroundColor: '#38ACDD',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000',
  },
  uniformPill: {
    flex: 1,
    height: 70,
    backgroundColor: '#57B495',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#000',
  },
  perCornerMixed: {
    flex: 1,
    height: 80,
    backgroundColor: '#FF6259',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 20,
    borderWidth: 3,
    borderColor: '#000',
  },
  perCornerOneZero: {
    flex: 1,
    height: 80,
    backgroundColor: '#782AEB',
    borderRadius: 16,
    borderTopRightRadius: 0,
    borderWidth: 3,
    borderColor: '#000',
  },
  perCornerDiagonal: {
    flex: 1,
    height: 80,
    backgroundColor: '#38ACDD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
  },
  logicalStart: {
    flex: 1,
    height: 80,
    backgroundColor: '#57B495',
    borderTopStartRadius: 24,
    borderBottomStartRadius: 24,
    borderWidth: 3,
    borderColor: '#000',
  },
  logicalEnd: {
    flex: 1,
    height: 80,
    backgroundColor: '#FFD61E',
    borderTopEndRadius: 24,
    borderBottomEndRadius: 24,
    borderWidth: 3,
    borderColor: '#000',
  },
  logicalMixed: {
    flex: 1,
    height: 80,
    backgroundColor: '#FF6259',
    borderTopStartRadius: 20,
    borderBottomEndRadius: 20,
    borderTopEndRadius: 0,
    borderBottomStartRadius: 0,
    borderWidth: 3,
    borderColor: '#000',
  },
  oversizedUniform: {
    flex: 1,
    height: 80,
    backgroundColor: '#782AEB',
    borderRadius: 200,
    borderWidth: 3,
    borderColor: '#000',
  },
  oversizedUneven: {
    flex: 1,
    height: 80,
    backgroundColor: '#38ACDD',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 200,
    borderWidth: 3,
    borderColor: '#000',
  },
  unevenBorderThickBottom: {
    flex: 1,
    height: 90,
    backgroundColor: '#FFD61E',
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 16,
    borderColor: '#000',
  },
  unevenBorderThickLeft: {
    flex: 1,
    height: 90,
    backgroundColor: '#57B495',
    borderRadius: 16,
    borderWidth: 3,
    borderLeftWidth: 16,
    borderColor: '#000',
  },
  unevenBorderAllDifferent: {
    flex: 1,
    height: 90,
    backgroundColor: '#FF6259',
    borderRadius: 12,
    borderTopWidth: 2,
    borderRightWidth: 6,
    borderBottomWidth: 14,
    borderLeftWidth: 10,
    borderColor: '#000',
  },
  unevenBorderWithRadius: {
    flex: 1,
    height: 90,
    backgroundColor: '#782AEB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 32,
    borderWidth: 5,
    borderBottomWidth: 16,
    borderColor: '#000',
  },
  unevenOversized: {
    flex: 1,
    height: 90,
    backgroundColor: '#38ACDD',
    borderRadius: 200,
    borderWidth: 3,
    borderBottomWidth: 20,
    borderColor: '#000',
  },
  unevenOversizedMixed: {
    flex: 1,
    height: 90,
    backgroundColor: '#FFD61E',
    borderRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 32,
    borderWidth: 5,
    borderBottomWidth: 16,
    borderColor: '#000',
  },
  noBorderRadius: {
    flex: 1,
    height: 70,
    backgroundColor: '#57B495',
    borderWidth: 3,
    borderColor: '#000',
  },
  zeroBorderRadius: {
    flex: 1,
    height: 70,
    backgroundColor: '#FF6259',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#000',
  },
  someZeroCorners: {
    flex: 1,
    height: 70,
    backgroundColor: '#782AEB',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 3,
    borderColor: '#000',
  },
  radiusLessThanBorder: {
    flex: 1,
    height: 80,
    backgroundColor: '#38ACDD',
    borderRadius: 5,
    borderWidth: 10,
    borderColor: '#000',
  },
  radiusEqualsBorder: {
    flex: 1,
    height: 80,
    backgroundColor: '#FFD61E',
    borderRadius: 10,
    borderWidth: 10,
    borderColor: '#000',
  },
  radiusSlightlyMore: {
    flex: 1,
    height: 80,
    backgroundColor: '#57B495',
    borderRadius: 12,
    borderWidth: 10,
    borderColor: '#000',
  },
  ellipticalInner: {
    flex: 1,
    height: 90,
    backgroundColor: '#FF6259',
    borderRadius: 20,
    borderWidth: 5,
    borderBottomWidth: 16,
    borderColor: '#000',
  },
  ellipticalInnerLarge: {
    flex: 1,
    height: 90,
    backgroundColor: '#782AEB',
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 20,
    borderColor: '#000',
  },
  noBorderWithRadius: {
    flex: 1,
    height: 70,
    backgroundColor: '#38ACDD',
    borderRadius: 16,
  },
  noBorderPill: {
    flex: 1,
    height: 70,
    backgroundColor: '#57B495',
    borderRadius: 999,
  },
  paddingSmallRadius: {
    flex: 1,
    height: 80,
    backgroundColor: '#FFD61E',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
  },
  paddingLargeRadius: {
    flex: 1,
    height: 80,
    backgroundColor: '#FF6259',
    borderRadius: 30,
    borderWidth: 3,
    borderBottomWidth: 12,
    borderColor: '#000',
    padding: 16,
  },
});
