import React, { useCallback, useMemo, useRef, useState, useContext } from 'react';
import { Animated, StyleSheet, Text, findNodeHandle } from 'react-native';
import { DragGestureHandler, DropGestureHandler, FlatList, State, LongPressGestureHandler } from 'react-native-gesture-handler';
import { USE_NATIVE_DRIVER } from '../config';

Context = React.createContext({
  refs: [],
  add(ref) {
    this.refs.indexOf(ref) === -1 && this.refs.push(ref);
  },
  remove(ref) {
    this.refs.indexOf(ref) !== -1 && this.refs.splice(this.refs.indexOf(ref), 1);
  },
  handle(from, to) {

  }
});

function DropZone({ item, index, shadowEnabled, swap, bulkMove }) {
  const context = useContext(Context);
  const [dropState, setDropState] = useState(false);
  const [isInside, move] = useState(false);
  const [tag, setTag] = useState(null);
  const [selected, setSelected] = useState(false);
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
      console.log('swapping', { index, item }, data);
      //swap(index, data.index)
      bulkMove([data[0].item], item);
    }
  }, []);
  const translateX = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
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
  ), []);

  const onHandlerStateChange = useCallback((e) => {
    translateX.setValue(0);
    translateY.setValue(0);
    if (e.nativeEvent.state === State.END) {
      context.refs = [];
      //console.log(e.nativeEvent)
    }
  }, [context]);

  const [shadowTag, setShadowTag] = useState(null);
  const onShadowRef = useCallback(r => {
    if (r && r.getNode() && item % 2 === 0) {
      setShadowTag(findNodeHandle(r.getNode()))
    }
  }, [item]);

  const ref = useRef();
  const longPressRef = useRef();

  const toggleSelection = useCallback((e) => {
    const { state } = e.nativeEvent;
    if (state === State.ACTIVE) {
      const rr = [longPressRef];
      if (!context.isSelected(ref)) {
        rr.push(...context.refs);
        context.add(ref)
      } else {
        context.remove(ref);
      }
      ref.current && ref.current.setNativeProps({
        simultaneousHandlers: rr
      })
      context.toggleSelection(ref);
    }
  }, [selected, ref, context]);

  return (
    <DragGestureHandler
      simultaneousHandlers={longPressRef}
      ref={ref}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      types={item % 2 === 0 ? [0, 1] : 1}
      data={{ index, item }}
      shadowViewTag={shadowTag}
      shadowEnabled={shadowEnabled}
    >
      <Animated.View collapsable={false}>
        <LongPressGestureHandler
          onHandlerStateChange={toggleSelection}
          ref={longPressRef}
        >
          <DropGestureHandler
            types={item % 2 === 0 ? 0 : 1}
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
                context.isSelected(ref) && { borderColor: 'magenta', borderWidth: 5 },
                isInside && { backgroundColor: item % 2 === 0 ? 'yellow' : 'red' } || dropState && { backgroundColor: 'blue' },
              ]}
            >
              <Text style={{ color: dropState ? 'white' : 'black' }}>{item}</Text>
              <Animated.View
                collapsable={false}
                ref={onShadowRef}
                style={[
                  styles.box,
                  { borderRadius: 50, opacity: 0, position: 'absolute' }
                ]}
              >
                <Text style={{ color: dropState ? 'white' : 'black' }}>{item}</Text>
              </Animated.View>
            </Animated.View>
          </DropGestureHandler>
        </LongPressGestureHandler>
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

  const bulkMove = useCallback((from, to) => {
    const source = data.filter((val, i, arr) => {
      return from.some((v) => v === val);
    });
    const out = data.filter((val, i, arr) => {
      return !source.some((v) => v === val);
    });
    const index = out.findIndex((val, i, arr) => {
      return val === to;
    });
    out.splice(index + 1, 0, ...source);
    setData(out);
  }, [data]);

  const context = useMemo(() => {
    return {
      refs: [],
      selected: [],
      add(ref) {
        this.refs.indexOf(ref) === -1 && this.refs.push(ref);
        console.log('add', this.refs.length)
      },
      remove(ref) {
        this.refs.indexOf(ref) !== -1 && this.refs.splice(this.refs.indexOf(ref), 1);
      },
      handle(from, to) {
        bulkMove(Array.isArray(from) ? from : [from], to);
        //swap(Array.isArray(from) ? from[0] : from, to);
      },
      toggleSelection(ref) {
        this.selected.indexOf(ref) === -1 ? this.selected.push(ref) : this.refs.splice(this.refs.indexOf(ref), 1);
      },
      isSelected(ref) {
        return ref.current && this.selected.indexOf(ref) > -1;
      }
    }
  }, [])

  return (
    <Context.Provider value={context}>
      <FlatList
        ListHeaderComponent={() => <>
          <Text style={{ fontSize: 20 }}>Drag & Drop has FINALLY arrived to React Native!</Text>
          <Text>Try swapping between the numbers.</Text>
          <Text>Even numbers can be swapped with any number.</Text>
          <Text>Odd numbers can be swapped only with odd numbers.</Text>
          <Text>Happy swapping</Text>
        </>}
        numColumns={5}
        style={styles.scrollView}
        ref={scrollRef}
        simultaneousHandlers={dragRef}
        //onHandlerStateChange={e => console.log('scroll', e.nativeEvent)}
        data={data}
        renderItem={(data) => <DropZone {...data} shadowEnabled={true} swap={swap} bulkMove={bulkMove} />}
        keyExtractor={(item, index) => `DropZone${item}`}
      />
    </Context.Provider>
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
