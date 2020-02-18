import React, { Component, useRef, useState, useCallback, useEffect } from 'react';
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
import { LoremIpsum } from '../common';
import { PinchableBox } from '../scaleAndRotate/index';

export class DraggableBox extends Component {
  constructor(props) {
    super(props);
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 };
    this._onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
            translationY: this._translateY,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  _onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._translateX.setValue(0);
      this._translateY.setValue(0);
    }
  };


  _panRef = React.createRef();
  _dragRef = React.createRef();
  _tapRef = React.createRef();

  render() {
    return (
      <DragGestureHandler
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
        ref={this._dragRef}
        //waitFor={this._tapRef}
        //simultaneousHandlers={this._panRef}
        type={[0]}
        {...this.props}
        data={{ a: 'b' }}
        shadowEnabled={false}
      >
        <Animated.View
          collapsable={false}
        >
          <TapGestureHandler
            ref={this._tapRef}
            onGestureEvent={e => console.log('tap')}
            onHandlerStateChange={e => console.log('tap')}
            numberOfTaps={1}
          >
            <Animated.View
              collapsable={false}
              style={[
                styles.box,
                {
                  transform: [
                    { translateX: this._translateX },
                    { translateY: this._translateY },
                  ],
                },
                this.props.boxStyle,
              ]}
            />
          </TapGestureHandler>
        </Animated.View>
      </DragGestureHandler>

    );
  }
}

export default function DragExample(props) {
  const scrollRef = useRef();
  const dragRef = useRef();
  const shadowRef = useRef();
  const [dropState, setDropState] = useState(false);
  const [isInside, move] = useState(false);
  const [tag, setTag] = useState(null);
  const cb = useCallback(e => {
    const { dragState, state, oldState } = e.nativeEvent;
    console.log(e.nativeEvent)
    if (state == State.BEGAN) {
      setDropState(false)
    } else if (state == State.ACTIVE) {
      move(true)
    } else if (state == State.CANCELLED) {
      move(false)
    } else if (state == State.END) {
      setDropState(true)
    }
  });

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
      <LoremIpsum words={40} />
      <DragGestureHandler
        ref={dragRef}
        //simultaneousHandlers={scrollRef}
        type={[0]}
        data={{ a: 'b' }}
        shadowViewTag={tag}
      >
        <Animated.View
          style={[
            styles.box,
            props.boxStyle
          ]}
        >
          <Text>Drag Me</Text>
        </Animated.View>
      </DragGestureHandler>
      <Animated.Image
        ref={r => setTag(r && findNodeHandle(r) || null)}
        style={[
          styles.pinchableImage,
        ]}
        source={require('../scaleAndRotate/swmansion.png')}
      />
      <DropGestureHandler
        type={0}
        onHandlerStateChange={cb}
      >
        <View collapsable={false}>
          <DraggableBox />
        </View>
      </DropGestureHandler>
      <LoremIpsum words={40} />
      <DropGestureHandler
        type={0}
        onHandlerStateChange={cb}
      >
        <Animated.View
          style={[
            styles.box,
            props.boxStyle,
            isInside && { backgroundColor: dropState ? 'blue' : 'red' },
          ]}
        >
          <Text>{dropState ? `THANKS` : `Drop Here or don't`}</Text>
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
    width: 150,
    height: 150,
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
