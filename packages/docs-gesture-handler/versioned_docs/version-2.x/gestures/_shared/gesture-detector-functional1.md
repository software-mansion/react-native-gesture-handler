```jsx
export default function Example() {
  const tap = Gesture.Tap().onStart(() => {
    console.log('tap');
  });

  return (
    <GestureDetector gesture={tap}>
      <FunctionalComponent>
        <View style={styles.box} />
      </FunctionalComponent>
    </GestureDetector>
  );
}

function FunctionalComponent(props) {
  return <View collapsable={false}>{props.children}</View>;
}
```
