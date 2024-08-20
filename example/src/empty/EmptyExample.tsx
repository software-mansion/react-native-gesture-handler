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
    x: 0,
    y: (45 / 180) * Math.PI,
    z: (45 / 180) * Math.PI,
  });

  const tap = Gesture.Tap()
    .runOnJS(true)
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
      setCanceledCount(upCount + 1);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tap}>
        <View style={styles.background}>
          <Canvas>
            <directionalLight
              position={[0, 0, 5]}
              rotation={new Euler(0.2, 0.2, 0)}
            />
            <mesh rotation={new Euler(rotation.y, rotation.x, rotation.z)}>
              <mesh
                onClick={() => {
                  console.log('red click');
                }}
                position={new Vector3(0, 0, 1)}>
                <boxGeometry />
                <meshStandardMaterial color={'#ff0000'} />
              </mesh>
              <mesh
                onClick={() => {
                  console.log('blue click');
                }}
                position={new Vector3(1, 0, 0)}>
                <boxGeometry />
                <meshStandardMaterial color={'#0000ff'} />
              </mesh>
              <mesh
                onClick={() => {
                  console.log('green click');
                }}
                position={new Vector3(0, 1, 0)}>
                <boxGeometry />
                <meshStandardMaterial color={'#00ff00'} />
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
