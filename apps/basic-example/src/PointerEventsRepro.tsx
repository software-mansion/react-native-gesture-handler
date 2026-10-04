import * as React from 'react';
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from 'react-native-gesture-handler';

export default function PointerEventsRepro() {
  const [mode, setMode] =
    React.useState<ViewProps['pointerEvents']>('box-none');
  const [plain, setPlain] = React.useState(false);
  const [background, setBackground] = React.useState(0);
  const [child, setChild] = React.useState(0);
  const [gesture, setGesture] = React.useState(0);
  const tap = useTapGesture({
    runOnJS: true,
    onActivate: () => setGesture((n) => n + 1),
  });
  const Wrapper = plain ? View : GestureHandlerRootView;
  return (
    <GestureHandlerRootView style={styles.screen}>
      <Text>Root pointerEvents regression</Text>
      <Text testID="status">
        {plain ? 'View' : 'Root'} / {mode ?? 'unset'} / background {background}{' '}
        / child {child} / gesture {gesture}
      </Text>
      <Button
        title={plain ? 'Use Root' : 'Use View'}
        onPress={() => setPlain(!plain)}
      />
      <View style={styles.controls}>
        {(['auto', 'none', 'box-only', 'box-none', undefined] as const).map(
          (value) => (
            <Button
              key={value ?? 'unset'}
              title={value ?? 'unset'}
              onPress={() => setMode(value)}
            />
          )
        )}
      </View>
      <Button
        title="Reset counts"
        onPress={() => {
          setBackground(0);
          setChild(0);
          setGesture(0);
        }}
      />
      <View style={styles.area}>
        <Pressable
          accessibilityLabel="Background"
          style={StyleSheet.absoluteFill}
          onPress={() => setBackground((n) => n + 1)}>
          <Text style={{ marginTop: 250 }}>Background</Text>
        </Pressable>
        <Wrapper pointerEvents={mode} style={styles.overlay}>
          <View pointerEvents="none" style={styles.side}>
            <Text>Empty side</Text>
          </View>
          <Pressable
            accessibilityLabel="Child press"
            style={styles.child}
            onPress={() => setChild((n) => n + 1)}>
            <Text>Child press</Text>
          </Pressable>
          <GestureDetector gesture={tap}>
            <View
              accessible
              accessibilityLabel="Child gesture"
              style={styles.child}>
              <Text>Child gesture</Text>
            </View>
          </GestureDetector>
        </Wrapper>
      </View>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 48, backgroundColor: 'white' },
  controls: { flexDirection: 'row', flexWrap: 'wrap' },
  area: { height: 350, margin: 16, backgroundColor: '#ddf' },
  overlay: { height: 230, backgroundColor: '#fdd8', alignItems: 'center' },
  side: { position: 'absolute', left: 4, top: 90, width: 70 },
  child: {
    width: 160,
    height: 75,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9d9',
  },
});
