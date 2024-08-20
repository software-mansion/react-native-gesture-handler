import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Euler } from 'three';

export default function App() {
  const [beginCount, setBeginCount] = useState(0);
  const [startCount, setStartCount] = useState(0);
  const [endCount, setEndCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [upCount, setUpCount] = useState(0);
  const [rotation, _setRotation] = useState({ x: 0, y: 1, z: 2 });

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
    })
    .onTouchesDown(() => {
      console.log('down');
      setDownCount(downCount + 1);
    })
    .onTouchesUp(() => {
      console.log('up');
      setUpCount(upCount + 1);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <Canvas
            style={{
              flex: 1,
            }}>
            <directionalLight
              position={[0, 0, 5]}
              rotation={new Euler(0.2, 0.2, 0)}
            />
            <mesh
              onClick={() => {
                console.log('mesh click');
              }}
              rotation={new Euler(rotation.y, rotation.x, rotation.z)}>
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
        <Text>Down count: {downCount}</Text>
        <Text>Up count: {upCount}</Text>
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
