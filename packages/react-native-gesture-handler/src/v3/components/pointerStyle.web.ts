import type { ViewStyle } from 'react-native';

// react-native-web sets `cursor: 'pointer'` on its interactive components
// (Pressable, TouchableOpacity, …) but not on `View`, which the native button
// renders — so the Touchable-based Pressable adds it here to match RN Pressable.
export const pointerStyle: ViewStyle = { cursor: 'pointer' };
