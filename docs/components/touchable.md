> **Note**
>
> This section refers to new `Touchable` component, meant to replace both buttons and touchables. If you are looking for documentation for the deprecated touchable components, check out the [Legacy Touchables](/docs/components/legacy-touchables) section.

`Touchable` is a versatile new component introduced in Gesture Handler 3 to supersede previous button implementations. Designed for maximum flexibility, it provides a highly customizable interface for native touch handling while ensuring consistent behavior across platforms.

`Touchable` provides a simple interface for the common animations like opacity, underlay, and scale, implemented entirely on the platform. On Android, it also exposes the native ripple effect on press (turned off by default).

If the provided animations are not sufficient, it's possible to use `Touchable` to create fully custom interactions using either [Reanimated](https://docs.swmansion.com/react-native-reanimated/) or [Animated API](https://reactnative.dev/docs/animated).

## Replacing old buttons

If you were using `RectButton` or `BorderlessButton` in your app, you should replace them with `Touchable`. Check out the full code in the [example](#example) section below.

### RectButton

To replace `RectButton` with `Touchable`, simply add `activeUnderlayOpacity={0.105}` to your `Touchable`. This will animate the underlay when the button is pressed.

```tsx
<Touchable
  ...
  activeUnderlayOpacity={0.105}/>
```

### BorderlessButton

Replacing `BorderlessButton` with `Touchable` is as easy as replacing `RectButton`. Just add `activeOpacity={0.3}` to your `Touchable`. This will animate the whole component when the button is pressed.

```tsx
<Touchable
  ...
  activeOpacity={0.3}/>
```

## Migrating from legacy Touchable variants

If you were using the specialized touchable components (`TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`, or `TouchableNativeFeedback`), you can replicate their behavior with the unified `Touchable` component.

### TouchableOpacity

To replace `TouchableOpacity`, add `activeOpacity={0.2}`.

```tsx
<Touchable
  ...
  activeOpacity={0.2}/>
```

### TouchableHighlight

To replace `TouchableHighlight`, add `activeUnderlayOpacity={1}`.

```tsx
<Touchable
  ...
  activeUnderlayOpacity={1}/>
```

### TouchableWithoutFeedback

To replace `TouchableWithoutFeedback`, use a plain `Touchable`.

```tsx
<Touchable ... />
```

### TouchableNativeFeedback

To replicate `TouchableNativeFeedback` behavior, use the [`androidRipple`](#androidripple) prop. Make sure to set `foreground={true}`.

```tsx
<Touchable
  ...
  androidRipple={{
    foreground: true,
  }}/>
```

## Example

In this example we will demonstrate how to recreate `RectButton` and `BorderlessButton` effects using the `Touchable` component.

## Properties

### activeOpacity

```ts
activeOpacity?: number;
```

Defines the opacity of the whole component when the button is active.

### defaultOpacity

```ts
defaultOpacity?: number;
```

Defines the opacity of the whole component when the button is active. By default set to `1`.

### activeUnderlayOpacity

```ts
activeUnderlayOpacity?: number;
```

Defines the opacity of the underlay when the button is active. By default set to `0`.

### defaultUnderlayOpacity

```ts
defaultUnderlayOpacity?: number;
```

Defines the initial opacity of underlay when the button is inactive. By default set to `0`.

### underlayColor

```ts
underlayColor?: string;
```

Background color of the underlay. This only takes effect when `activeUnderlayOpacity` or `defaultUnderlayOpacity` is set.

### exclusive

```ts
exclusive?: boolean;
```

Defines whether pressing this button prevents other buttons exported by Gesture Handler from being pressed. By default set to `true`.

### touchSoundDisabled

```ts
touchSoundDisabled?: boolean;
```

If set to `true`, the system will not play a sound when the button is pressed.

### onPressIn

Triggered when the button gets pressed (analogous to `onPressIn` in `Pressable` from RN core).

### onPressOut

Triggered when the button gets released or the pointer moves outside of the button area (analogous to `onPressOut` in `Pressable` from RN core).

### onPress

```ts
onPress?: (pointerInside: boolean) => void;
```

Triggered when the button gets pressed (analogous to `onPress` in `Pressable` from RN core).

### onLongPress

```ts
onLongPress?: () => void;
```

Triggered when the button gets pressed for at least [`delayLongPress`](#delaylongpress) milliseconds.

### delayLongPress

```ts
delayLongPress?: number;
```

Defines the delay, in milliseconds, after which the [`onLongPress`](#onlongpress) callback gets called. By default set to `600`.

### androidRipple

Configuration for the ripple effect on Android. If not provided, the ripple effect will be disabled. If `{}` is provided, the ripple effect will be enabled with default configuration.
