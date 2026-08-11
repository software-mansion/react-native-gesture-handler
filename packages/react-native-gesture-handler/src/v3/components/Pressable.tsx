import React, { useRef } from 'react';

import type { PressableProps } from '../../components/Pressable/PressableProps';
import PressableWithTouchable from './PressableWithTouchable';
import StatefulPressable from './StatefulPressable';

/**
 * `Pressable` dispatches between two implementations:
 *
 * - {@link StatefulPressable} — the state-machine engine, used whenever any of
 *   the `simultaneousWith` / `requireToFail` / `block` relation props is passed,
 *   since coordinating the press with an external gesture needs the composed
 *   gesture recognizers.
 * - {@link PressableWithTouchable} — the simpler engine built on the native
 *   button `Touchable`, used for everything else (the common case).
 *
 * The choice is made once, at mount, so conditionally adding or removing a
 * relation prop later cannot swap engines mid-life and lose the current press.
 */
const Pressable = (props: PressableProps) => {
  const usesRelations = useRef(
    props.simultaneousWith != null ||
      props.requireToFail != null ||
      props.block != null
  ).current;

  return usesRelations ? (
    <StatefulPressable {...props} />
  ) : (
    <PressableWithTouchable {...props} />
  );
};

export default Pressable;
