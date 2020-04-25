import React, { useCallback, useMemo, useRef, useState, useContext, useEffect } from 'react';
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

function DropZone({ item, index, shadowEnabled }) {
  const __item = item.item;
  const __isSelected = item.selected;
  const context = useContext(Context);
  const [dropState, setDropState] = useState(false);
  const [isInside, move] = useState(false);
  const [tag, setTag] = useState(null);
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
      console.log('changing list', { index, item }, data);
      context.handle(data.map(value => value.item), __item)
    }
  }, []);
  const translateX = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(0), []);
  const onDragGestureEvent = useMemo(() => Animated.event(
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

  const onDragStateChange = useCallback((e) => {
    if (e.nativeEvent.state === State.BEGAN) {
      //wrapper.current.setNativeProps({ zIndex: 500000 });
    } else if (e.nativeEvent.oldState === State.ACTIVE) {
      const config = { toValue: 0, useNativeDriver: true };
      Animated.parallel([
        Animated.spring(translateX, config),
        Animated.spring(translateY, config),
      ]).start(() => {
        //wrapper.current.setNativeProps({ zIndex: 1 })
      })
    }
  }, [context]);

  const [shadowTag, setShadowTag] = useState(null);
  const onShadowRef = useCallback(r => {
    if (r && r.getNode() && __item % 2 === 0) {
      setShadowTag(findNodeHandle(r.getNode()))
    }
  }, [item]);

  const ref = useRef();
  const longPressRef = useRef();
  const wrapper = useRef();

  const toggleSelection = useCallback((e) => {
    const { state } = e.nativeEvent;
    if (state === State.ACTIVE) {
      context.toggleSelection(ref, __item)
    }
  }, [ref, context]);

  useEffect(() => {
    const arr = [longPressRef];
    if (__isSelected) {
      arr.push(...context.refs);
    }
    ref.current && ref.current.setNativeProps({
      simultaneousHandlers: arr
    });
  })

  return (
    <DragGestureHandler
      simultaneousHandlers={longPressRef}
      ref={ref}
      onGestureEvent={onDragGestureEvent}
      onHandlerStateChange={onDragStateChange}
      types={__item % 2 === 0 ? [0, 1] : 1}
      data={{ index, item: __item }}
      shadowViewTag={shadowTag}
      dragMode={shadowEnabled ? 'move' : 'none'}
      shadowConfig={{
        offset: [-25, -25],
        margin: [50, 20]
      }}
    >
      <Animated.View collapsable={false} ref={wrapper}>
        <LongPressGestureHandler
          onHandlerStateChange={toggleSelection}
          ref={longPressRef}
        >
          <DropGestureHandler
            types={__item % 2 === 0 ? 0 : 1}
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
                },
                __isSelected && { borderColor: 'magenta', borderWidth: 5 },
                isInside && { backgroundColor: __item % 2 === 0 ? 'yellow' : 'red' } || dropState && { backgroundColor: 'blue' },
              ]}
            >
              <Text style={{ color: dropState ? 'white' : 'black' }}>{__item}</Text>
              <Animated.View
                collapsable={false}
                ref={onShadowRef}
                style={[
                  styles.box,
                  { borderRadius: 50, opacity: 0, position: 'absolute' }
                ]}
              >
                <Text style={{ color: dropState ? 'white' : 'black' }}>{__item}</Text>
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
  const selected = useRef([]);
  const [data, setData] = useState(new Array(50).fill(0).map((v, i) => ({ item: i + 1, selected: false })));
  const [isInside, move] = useState(false);
  const [tag, setTag] = useState(null);


  const context = useMemo(() => {
    return {
      get selected() {
        return selected.current;
      },
      set selected(value) {
        selected.current = value;
      },
      get refs() {
        return this.selected.map(value => value.ref);
      },
      handle(from, to) {
        from.length === 1 ? this.swap(from[0], to) : this.shift(from, to);
        this.selected = [];
      },
      shift(from, to) {
        const source = data.filter((val, i, arr) => {
          return from.some((v) => v === val.item);
        });
        const out = data.filter((val, i, arr) => {
          return !from.some((v) => v === val.item);
        });
        const index = out.findIndex((val, i, arr) => {
          return val.item === to;
        });
        out.splice(index, 0, ...source);
        setData(out.map(v => ({ ...v, selected: false })));
      },
      swap(from, to) {
        const out = data.map((val, i, arr) => {
          const { item } = val;
          console.log(item, from, to)
          if (item === from) return arr.find(v => v.item === to);
          if (item === to) return arr.find(v => v.item === from);
          return arr[i];
        }).map(v => ({ ...v, selected: false }));
        setData(out);
      },
      findItemIndex(item) {
        return this.selected.findIndex((value) => value.item === item);
      },
      toggleSelection(ref, item) {
        const index = this.findItemIndex(item);
        index === -1 ? this.selected.push({ ref, item }) : this.selected.splice(index, 1);
        const out = data.map(value => ({ ...value, selected: this.isSelected(value.item) }));
        setData(out);
      },
      isSelected(item) {
        return this.findItemIndex(item) !== -1;
      }
    }
  }, [data]);

  const numColumns = 5;

  return (
    <Context.Provider value={context}>
      <FlatList
        ListHeaderComponent={() => <>
          <Text style={{ fontSize: 20 }}>Drag & Drop has FINALLY arrived to React Native!</Text>
          <Text>Try swapping between the numbers, use LongPress for multi-selection.</Text>
          <Text>Even numbers can be swapped with any number.</Text>
          <Text>Odd numbers can be swapped only with odd numbers.</Text>
          <Text>Happy swapping</Text>
        </>}
        numColumns={numColumns}
        style={styles.scrollView}
        ref={scrollRef}
        simultaneousHandlers={dragRef}
        //onHandlerStateChange={e => console.log('scroll', e.nativeEvent)}
        data={data}
        renderItem={(data) => <DropZone {...data} shadowEnabled={data.index % numColumns !== 0} />}
        keyExtractor={(item, index) => `DropZone${item.item}`}
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
