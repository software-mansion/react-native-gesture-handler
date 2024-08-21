import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Euler, Vector3 } from 'three';

export default function App() {
  const [beginCount, setBeginCount] = useState(0);
  const [startCount, setStartCount] = useState(0);
  const [endCount, setEndCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [upCount, setUpCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);
  const [rotation, _setRotation] = useState({
    x: (0 / 180) * Math.PI,
    y: (55 / 180) * Math.PI,
    z: (45 / 180) * Math.PI,
  });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(99999)
    .maxDuration(99999)
    .maxDelay(99999)
    .onBegin(() => {
      //console.log('begin');
      setBeginCount(beginCount + 1);
    })
    .onStart(() => {
      //console.log('start');
      setStartCount(startCount + 1);
    })
    .onEnd(() => {
      //console.log('end');
      setEndCount(endCount + 1);
    })
    .onTouchesDown(() => {
      console.log('down');
      setDownCount(downCount + 1);
    })
    .onTouchesUp(() => {
      console.log('up');
      setUpCount(upCount + 1);
    })
    .onTouchesCancelled(() => {
      console.log('cancelled');
      setCanceledCount(canceledCount + 1);
    });

  // const native = Gesture.Native();
  // native.simultaneousWithExternalGesture(tap);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={styles.background}>
          <Canvas>
            <directionalLight position={[-0.5, 0.5, 0.8]} />
            <ambientLight intensity={0.5} />
            <mesh rotation={new Euler(rotation.y, rotation.x, rotation.z)}>
              <mesh
                onClick={() => {
                  console.log('red click');
                }}
                position={new Vector3(0, 0, 1)}>
                <boxGeometry />
                <meshStandardMaterial color={'#f00'} />
              </mesh>
              <mesh
                onClick={() => {
                  console.log('blue click');
                }}
                position={new Vector3(1, 0, 0)}>
                <boxGeometry />
                <meshStandardMaterial color={'#00f'} />
              </mesh>
              <mesh
                onClick={() => {
                  console.log('green click');
                }}
                position={new Vector3(0, 1, 0)}>
                <boxGeometry />
                <meshStandardMaterial color={'#0f0'} />
              </mesh>
              <mesh
                onClick={() => {
                  console.log('white click');
                }}
                position={new Vector3(0, 0, 0)}
                scale={2}>
                <boxGeometry />
                <meshStandardMaterial color={'#fff'} />
              </mesh>
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
        <Text>Canceled count: {canceledCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
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
