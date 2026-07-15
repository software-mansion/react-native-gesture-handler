import type React from 'react';

import { Touchable as BoundTouchable } from '../../binding';
import type { TouchableProps } from './TouchableProps';

// The Touchable component itself lives in core (v3/press/Touchable) and is
// bound by createGestureHandlerAPI; the react-native pieces reach it through
// the port's press kit (GestureHandlerButton plus the androidRipple/TV prop
// mapping in binding.ts). This module only narrows the loose core prop type
// to the public react-native one — values like ColorValue are opaque strings
// to core and pass through to the host button untouched.
export const Touchable = BoundTouchable as unknown as (
  props: TouchableProps
) => React.JSX.Element;
