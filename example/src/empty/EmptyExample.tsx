import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function App() {
  const [beginCount, setBeginCount] = useState(0);
  const [startCount, setStartCount] = useState(0);
  const [endCount, setEndCount] = useState(0);
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onBegin(() => {
      console.log('begin');
      setBeginCount(beginCount + 1);
    })
    .onStart(() => {
      console.log('start');
      setStartCount(startCount + 1);
    })
    .onEnd(() => {
      console.log('end');
      setEndCount(endCount + 1);
    });
  return (
    <View style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Canvas
            style={{
              flex: 1,
            }}>
            <ambientLight intensity={1} />
            <directionalLight color="red" position={[0, 0, 5]} />
            <mesh
              onClick={() => {
                console.log('mesh click');
              }}>
              <boxGeometry />
              <meshStandardMaterial color={'#ff0000'} />
            </mesh>
          </Canvas>
        </View>
      </GestureDetector>
      <View style={styles.counters}>
        <Text>Begin count: {beginCount}</Text>
        <Text>Start count: {startCount}</Text>
        <Text>End count: {endCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
  counters: {
    position: 'absolute',
    backgroundColor: 'white',
  },
});
