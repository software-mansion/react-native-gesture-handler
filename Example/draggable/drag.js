import React, { Component, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View, Text, findNodeHandle } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  DragGestureHandler,
  DropGestureHandler,
  TapGestureHandler
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum, LOREM_IPSUM } from '../common';
import { PinchableBox } from '../scaleAndRotate/index';

const dropZoneReg = [];

function useDraggaable() {
  const translateX = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
  const [shadowTag, setShadowTag] = useState(null);
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const onShadowRef = useCallback(r => setShadowTag(r && findNodeHandle(r) || null), []);
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
  ), [translateX, translateY]);

  const onHandlerStateChange = useCallback((event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      translateX.setValue(0);
      translateY.setValue(0);
    }
  }, [translateX, translateY]);

  const style = useMemo(() => {
    return {
      transform: [
        { translateX },
        { translateY },
      ],
    }
  }, [translateX, translateY]);

  return { onGestureEvent, onHandlerStateChange, style, shadowTag, onShadowRef, shadowEnabled, setShadowEnabled }
}

function useDropZone(other) {
  const [dropState, setDropState] = useState(-1);
  const [tag, setTag] = useState(null);
  const [text, setText] = useState(null);
  const onHandlerStateChange = useCallback(e => {
    const { dragState, state, oldState, data, dragTarget } = e.nativeEvent;
    //console.log(e.nativeEvent)
    if (state == State.BEGAN) {
      //setDropState(false);
    } else if (state == State.ACTIVE) {
      setDropState(0);
      if (oldState == State.BEGAN) {
        dropZoneReg.forEach(val => {
          if (val === dragTarget) return;
          //val.setDropState(-1);
        });
      }
    } else if (state == State.CANCELLED) {
      setDropState(-1);
    } else if (state == State.END) {
      setDropState(1);
      setTimeout(() => setDropState(-1), 1000)
      if (data.text) {
        setText(data.text);
        const found = dropZoneReg.find((val) => dragTarget && val.tag === dragTarget);
        found && found.setText('I feel light')
      }
    }
  }, [tag]);
  const onRef = useCallback(r => setTag(r && findNodeHandle(r) || null), []);
  const dropStyle = useMemo(() => {
    let color;
    console.log(dropState)
    switch (dropState) {
      case -1:
        color = 'plum'
        break;
      case 0:
        color = 'red'
        break;
      case 1:
        color = 'blue'
        break;
    }
    return { backgroundColor: color };
  }, [dropState]);
  const reg = { dropState, tag, text, setText, onHandlerStateChange, onRef, dropStyle, setDropState };
  useMemo(() => {
    const index = dropZoneReg.findIndex((val) => val.tag === tag);
    index > -1 && dropZoneReg.splice(index, 1);
    dropZoneReg.push(reg);
  }, [tag]);
  return reg;
}

export default function DragExample(props) {
  const scrollRef = useRef();
  const dragRef = useRef();
  const dropRef3 = useRef();
  const dropZone1 = useDropZone();
  const dropZone2 = useDropZone();
  const dropZone3 = useDropZone();
  const textDropZone1 = useDropZone(dropZone1);
  const draggable1 = useDraggaable();

  useEffect(() => {
    setTimeout(() => scrollRef.current && scrollRef.current.scrollTo({ x: 0, y: 150 }), 50)
  }, [])

  return (
    <ScrollView
      style={styles.scrollView}
      ref={scrollRef}
      simultaneousHandlers={dragRef}
      contentOffset={{ x: 0, y: 50 }}
      onHandlerStateChange={e => console.log('scroll', e.nativeEvent)}
    >
      <Animated.Image
        ref={draggable1.onShadowRef}
        style={[
          styles.pinchableImage,
        ]}
        source={require('../scaleAndRotate/swmansion.png')}
      />
      <LoremIpsum words={40} />
      <DragGestureHandler
        ref={dropZone3.onRef}
        type={[0, 1]}
        data={{ a: 'b', text: dropZone3.text }}
        shadowViewTag={draggable1.shadowTag}
      >
        <DropGestureHandler
          type={[2, 3]}
          onHandlerStateChange={dropZone3.onHandlerStateChange}
          ref={dropRef3}
        >
          <Animated.View
            style={[
              styles.box,
              dropZone3.dropStyle
            ]}
          >
            <Text numberOfLines={5} ellipsizeMode='tail'>{dropZone3.text || 'Drag Me'}</Text>
          </Animated.View>
        </DropGestureHandler>
      </DragGestureHandler>
      <DragGestureHandler
        onGestureEvent={draggable1.onGestureEvent}
        onHandlerStateChange={draggable1.onHandlerStateChange}
        type={[0, 2, 3]}
        text={dropZone1.text || 'I\'m hungry'}
        ref={dropZone1.onRef}
        //waitFor={this._tapRef}
        //simultaneousHandlers={this._panRef}
        data={{ a: 'b', text: dropZone1.text || 'I\'m hungry' }}
        shadowEnabled={draggable1.shadowEnabled}
      >
        <Animated.View collapsable={false}>
          <DropGestureHandler
            type={[1]}
            onHandlerStateChange={dropZone1.onHandlerStateChange}
          >
            <Animated.View collapsable={false}>
              <TapGestureHandler
                ref={this._tapRef}
                onGestureEvent={e => console.log('tap')}
                onHandlerStateChange={e => {
                  const { state, oldState } = e.nativeEvent;
                  if (state === State.END && oldState === State.ACTIVE) {
                    const text = dropZone1.text;
                    dropZone1.setText(!draggable1.shadowEnabled ? 'shadow enabled' : 'shadow disabled');
                    draggable1.setShadowEnabled(!draggable1.shadowEnabled);
                    setTimeout(() => {
                      dropZone1.setText(text)
                    }, 1000);
                  }
                }}
                numberOfTaps={1}
              >
                <Animated.View
                  style={[
                    styles.pane,
                    draggable1.style,
                    dropZone1.dropStyle
                  ]}
                >
                  <Text numberOfLines={5} ellipsizeMode='tail'>{dropZone1.text || 'I\'m hungry'}</Text>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </DropGestureHandler>
        </Animated.View>
      </DragGestureHandler>
      <DragGestureHandler
        type={[1, 2]}
        data={{ foo: 'bar', text: LOREM_IPSUM }}
        ref={textDropZone1.onRef}
      >
        <DropGestureHandler
          type={[0]}
          onHandlerStateChange={textDropZone1.onHandlerStateChange}
        >
          <Animated.View style={textDropZone1.dropStyle}>
            <LoremIpsum words={40} />
          </Animated.View>
        </DropGestureHandler>
      </DragGestureHandler>
      <DropGestureHandler
        type={[0, 1]}
        onHandlerStateChange={dropZone2.onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.box,
            props.boxStyle,
            dropZone2.dropStyle,
          ]}
        >
          <Text>{dropZone2.dropState === 1 ? `THANKS` || dropZone2.text : `Drop Here or don't`}</Text>
        </Animated.View>
      </DropGestureHandler>
      <LoremIpsum />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 75,
    height: 75,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pane: {
    //flex: 1,
    height: 100,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    //zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
    //overflow: 'hidden'
  },
  pinchableImage: {
    width: 250,
    height: 250,
    opacity: 0,
    position: 'absolute'
  },
});
