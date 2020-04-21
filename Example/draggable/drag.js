import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, findNodeHandle, Image, processColor, I18nManager } from 'react-native';

import {
  ScrollView,
  State,
  DragGestureHandler,
  DropGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum, LOREM_IPSUM } from '../common';
import { PinchableBox } from '../scaleAndRotate/index';
I18nManager.allowRTL(true);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const dropZoneReg = [];

function useDraggaable() {
  const translateX = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
  const [shadowTag, setShadowTag] = useState(null);
  const [shadowEnabled, setShadowEnabled] = useState(true);
  //const onShadowRef = useCallback(r => setShadowTag(r && findNodeHandle(r) || null), []);
  const shadowRef = useRef();
  const onGestureEvent = useMemo(() =>
    Animated.event(
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
      const config = { toValue: 0, useNativeDriver: true };
      Animated.parallel([
        Animated.spring(translateX, config),
        Animated.spring(translateY, config)
      ]).start()
    }
  }, [translateX, translateY]);


  const extractStyle = useCallback((...transformations) => {
    return {
      transform: [
        { translateX },
        { translateY },
        ...transformations
      ],
    }
  }, [translateX, translateY]);

  return { onGestureEvent, onHandlerStateChange, extractStyle, shadowTag, shadowRef, shadowEnabled, setShadowEnabled }
}

function useDropZone() {
  const [dropState, setDropState] = useState(-1);
  const dragRef = useRef();
  const [tag, setTag] = useState(null);
  const [text, setText] = useState(null);
  const onHandlerStateChange = useCallback(e => {
    const { state, oldState, data, dragTarget, dropTarget, sourceAppID } = e.nativeEvent;
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
    } else if (state == State.END /*&& oldState == State.ACTIVE*/) {
      console.log(`dropping ${JSON.stringify(data)} to ${dropTarget} from ${dragTarget}`, sourceAppID ? `appID: ${sourceAppID}` : '', State.print(oldState))
      setDropState(1);
      setTimeout(() => setDropState(-1), 1000)
      if (data) {
        const datum = data.find((value) => value.text || value.rawData);
        setText(datum.text || datum.rawData);
        const found = dropZoneReg.find((val) => dragTarget && val.tag === dragTarget);
        found && found.setText('I feel light')
      }
    }
  }, [tag]);
  const onRef = useCallback(r => {
    setTag(r && findNodeHandle(r) || null);
    dragRef.current = r;
  }, []);
  const dropStyle = useMemo(() => {
    let color;
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
  const reg = { dropState, tag, text, setText, onHandlerStateChange, onRef, dropStyle, setDropState, dragRef };
  useMemo(() => {
    const index = dropZoneReg.findIndex((val) => val.tag === tag);
    index > -1 && dropZoneReg.splice(index, 1);
    dropZoneReg.push(reg);
  }, [tag]);
  return reg;
}

export default function DragExample(props) {
  const scrollRef = useRef();
  const dropRef3 = useRef();
  const panRef = useRef();
  const pinchRef = useRef();
  const rotationRef = useRef();
  const dropZone1 = useDropZone();
  const dropZone2 = useDropZone();
  const dropZone3 = useDropZone();
  const textDropZone1 = useDropZone();
  const innerDropZone = useDropZone();
  const draggable1 = useDraggaable();
  const draggable2 = useDraggaable();
  const shadowViewRef = useRef();
  const [color, setColor] = useState('black');
  const [displayShadowImage, setDisplayShadowImage] = useState(false);

  const scrollX = useMemo(() => new Animated.Value(0), []);
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const onScroll = useMemo(() => Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: {
            scrollX,
            scrollY
          }
        },
      },
    ],
    { useNativeDriver: USE_NATIVE_DRIVER }
  ));

  useEffect(() => {
    setTimeout(() => scrollRef.current && scrollRef.current.scrollTo({ x: 0, y: 150 }), 50);
    const t = setInterval(() => {
      const rgb = new Array(3).fill(0).map(() => Math.random() * 255);
      setColor(`rgb(${rgb.join(',')})`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setDisplayShadowImage(!displayShadowImage);
    }, 1000);
    return () => clearInterval(t);
  }, [displayShadowImage]);

  useEffect(() => {
    if (dropZone3.text) {
      setTimeout(() => dropZone3.setText(null), 1000)
    }
  }, [dropZone3.text]);

  return (
    <ScrollView
      style={styles.default}
      ref={scrollRef}
      contentOffset={{ x: 0, y: 50 }}
      disallowInterruption
      //shouldActivateOnStart
      //onHandlerStateChange={e => console.log('scroll', e.nativeEvent)}
      waitFor={dropZoneReg.map(val => val.dragRef).filter(r => r !== innerDropZone.dragRef)}
      simultaneousHandlers={innerDropZone.dragRef}
    //onScroll={onScroll}
    >
      <Animated.Image
        ref={shadowViewRef}
        style={[
          styles.pinchableImage,
        ]}
        source={require('../scaleAndRotate/swmansion.png')}
      />
      <LoremIpsum words={40} />
      <DragGestureHandler
        ref={innerDropZone.onRef}
        types={[0, 1]}
        data={{ a: 'b', text: innerDropZone.text }}
        //shadowViewTag={draggable1.shadowTag}
        shadow={shadowViewRef}
        waitFor={scrollRef}
      >
        <DropGestureHandler
          types={[2, 3]}
          onHandlerStateChange={dropZone3.onHandlerStateChange}
          ref={dropRef3}
        >
          <Animated.View
            style={[
              styles.box,
              dropZone3.dropStyle
            ]}
          >
            {dropZone3.text &&
              <Text style={{ fontWeight: 'bold' }}>
                You MISSED
              </Text>
            }
            <DropGestureHandler
              types={[2, 3]}
              onHandlerStateChange={innerDropZone.onHandlerStateChange}
            >
              <Text
                style={[innerDropZone.dropStyle, { padding: 20 }]}
                numberOfLines={5}
                ellipsizeMode='tail'>
                {innerDropZone.text || 'Drag Me'}
              </Text>
            </DropGestureHandler>
          </Animated.View>
        </DropGestureHandler>
      </DragGestureHandler>
      <DragGestureHandler
        onGestureEvent={draggable1.onGestureEvent}
        onHandlerStateChange={draggable1.onHandlerStateChange}
        types={[0, 2, 3]}
        ref={dropZone1.onRef}
        data={{
          a: ['b', 'foo', 'bar'],
          text: dropZone1.text || 'I\'m hungry',
          nativeProps: {
            source: require('../scaleAndRotate/swmansion.png'),
            width: 250,
            backgroundColor: processColor('gold')
          }
        }}
        shadow={() => (
          <Animated.View
            collapsable={false}
            style={styles.dragShadowWrapper}
          >
            <Animated.View
              style={[styles.dragShadow, { backgroundColor: color }]}
            />
            {displayShadowImage ?
              <Animated.View style={[styles.dragShadow, { backgroundColor: color }]} /> :
              <Image source={require('../scaleAndRotate/swmansion.png')} />}
          </Animated.View>
        )}
        dragMode={draggable1.shadowEnabled ? 'copy' : 'none'}
        simultaneousHandlers={[dropZone3.dragRef, dropZone2.dragRef]}
      //simultaneousHandlers={dropZoneReg.map(val => val.dragRef)}
      >
        <Animated.View collapsable={false}>
          <DropGestureHandler
            types={[1]}
            onHandlerStateChange={dropZone1.onHandlerStateChange}
          >
            <Animated.View collapsable={false}>
              <TapGestureHandler
                ref={this._tapRef}
                onGestureEvent={() => console.log('tap')}
                onHandlerStateChange={e => {
                  const { state, oldState } = e.nativeEvent;
                  if (state === State.END && oldState === State.ACTIVE) {
                    const text = dropZone1.text;
                    dropZone1.setText(!draggable1.shadowEnabled ? 'shadow enabled' : 'shadow disabled');
                    draggable1.setShadowEnabled(!draggable1.shadowEnabled);
                    setTimeout(() => {
                      dropZone1.setText(text);
                    }, 1000);
                  }
                }}
                numberOfTaps={1}
              >
                <Animated.View
                  style={[
                    styles.pane,
                    draggable1.extractStyle(),
                    dropZone1.dropStyle
                  ]}
                >
                  <Text
                    numberOfLines={5}
                    ellipsizeMode='tail'>
                    {dropZone1.text || 'I\'m hungry, tap me to change the way I drag'}
                  </Text>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </DropGestureHandler>
        </Animated.View>
      </DragGestureHandler>
      <DragGestureHandler
        types={[1, 2]}
        data={{ foo: 'bar', text: LOREM_IPSUM }}
        ref={textDropZone1.onRef}
        dragMode="move"
      >
        <DropGestureHandler
          types={[0]}
          onHandlerStateChange={textDropZone1.onHandlerStateChange}
        >
          <Animated.View style={textDropZone1.dropStyle}>
            <LoremIpsum words={40} />
          </Animated.View>
        </DropGestureHandler>
      </DragGestureHandler>
      <DragGestureHandler
        simultaneousHandlers={dropZoneReg.map(val => val.dragRef)}
        dragMode="move-restore"
        shadowConfig={{
          opacity: [0.3, 1],
          margin: [20, 30],
          offset: [50, -50],
          //multiShadowEnabled: false
        }}
      >
        <DropGestureHandler
          types={[0, 1]}
          onHandlerStateChange={dropZone2.onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.box,
              props.boxStyle,
              dropZone2.dropStyle
            ]}
          >
            <Text>{dropZone2.dropState === 1 ? `THANKS` || dropZone2.text : `Drop Here or don't`}</Text>

          </Animated.View>
        </DropGestureHandler>
      </DragGestureHandler>
      <DragGestureHandler
        types={[1, 2]}
        data={{ foo: 'bar', text: LOREM_IPSUM }}
        ref={textDropZone1.onRef}
        simultaneousHandlers={[panRef, pinchRef, rotationRef]}
        onGestureEvent={draggable2.onGestureEvent}
        onHandlerStateChange={draggable2.onHandlerStateChange}
        dragMode={draggable2.shadowEnabled ? 'move' : 'none'}
      >
        <Animated.View style={[{ flex: 1, height: 500 }, draggable2.extractStyle()]}>
          <PinchableBox
            ref={r => {
              if (r) {
                panRef.current = r.panRef;
                pinchRef.current = r.pinchRef;
                rotationRef.current = r.rotationRef;
              }
            }}
          />
        </Animated.View>
      </DragGestureHandler>
      <LoremIpsum />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  default: {
    flex: 1,
  },
  box: {
    width: 120,
    height: 120,
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
  dragShadow: {
    width: 50,
    height: 50,
  },
  dragShadowWrapper: {
    backgroundColor: 'pink',
    padding: 10,
    position: 'absolute',
    opacity: 0
  }
});
