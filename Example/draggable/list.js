import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { DragGestureHandler, DropGestureHandler, FlatList, State } from 'react-native-gesture-handler';
import { USE_NATIVE_DRIVER } from '../config';

function DropZone({ item, index, shadowEnabled, swap }) {
  const [dropState, setDropState] = useState(false);
  const [isInside, move] = useState(false);
  const cb = useCallback(e => {
    const { dragState, state, oldState, data } = e.nativeEvent;
    if (state == State.BEGAN) {
      setDropState(false)
    } else if (state == State.ACTIVE) {
      move(true)
    } else if (state == State.CANCELLED) {
      move(false)
    } else if (state == State.END) {
      setDropState(true)
      console.log('swapping', index, data.index);
      swap(index, data.index)
    }
  });
  const translateX = useMemo(() => new Animated.Value(0));
  const translateY = useMemo(() => new Animated.Value(0));
  const onGestureEvent = useMemo(() => Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: USE_NATIVE_DRIVER }
  ));
  const onHandlerStateChange = useCallback((e) => {
    translateX.setValue(0);
    translateY.setValue(0);
    if (e.nativeEvent.state === State.END) {
      console.log(e.nativeEvent)
    }
  });

  return (
    <DragGestureHandler
      //simultaneousHandlers={scrollRef}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      type={item % 2 === 0 ? [0, 1] : 1}
      data={{ index, item }}
      //shadowViewTag={tag}
      shadowEnabled={shadowEnabled}
    >
      <Animated.View collapsable={false}>
        <DropGestureHandler
          type={item % 2 === 0 ? 0 : 1}
          onHandlerStateChange={cb}
        >
          <Animated.View
            style={[
              styles.box,
              !shadowEnabled && {
                transform: [
                  { translateX: translateX },
                  { translateY: translateY },
                ],
                zIndex: 500000
              },
              isInside && { backgroundColor: item % 2 === 0 ? 'yellow' : 'red' } || dropState && { backgroundColor: 'blue' },
            ]}
          >
            <Text style={{ color: dropState ? 'white' : 'black' }}>{item}</Text>
          </Animated.View>
        </DropGestureHandler>
      </Animated.View>
    </DragGestureHandler>

  )
}

export default function DragExample(props) {
  const scrollRef = useRef();
  const dragRef = useRef();
  const shadowRef = useRef();
  const [data, setData] = useState(new Array(50).fill(0).map((v, i) => i + 1));
  const [isInside, move] = useState(false);
  const [tag, setTag] = useState(null);

  const swap = useCallback((from, to) => {
    const out = data.map((val, i, arr) => {
      if (i === from) return arr[to];
      if (i === to) return arr[from];
      return arr[i];
    });
    setData(out);
  }, [data]);

  return (
    <FlatList
      ListHeaderComponent={() => <>
        <Text style={{ fontSize: 20 }}>Drag & Drop has FINALLY arrived to React Native!</Text>
        <Text>Try swapping between the numbers.</Text>
        <Text>Even numbers can be swapped with any number.</Text>
        <Text>Odd numbers can be swapped only on with odd numbers.</Text>
        <Text>Happy swapping</Text>
      </>}
      numColumns={5}
      style={styles.scrollView}
      ref={scrollRef}
      simultaneousHandlers={dragRef}
      //onHandlerStateChange={e => console.log('scroll', e.nativeEvent)}
      data={data}
      renderItem={(data) => <DropZone {...data} shadowEnabled={true} swap={swap} />}
      keyExtractor={(item, index) => `DropZone${item}`}
    />
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinchableImage: {
    width: 250,
    height: 250,
    opacity: 0,
    position: 'absolute'
  },
});
