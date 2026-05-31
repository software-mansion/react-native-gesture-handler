import type { MutableRefObject } from 'react';
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import findNodeHandle from '../../findNodeHandle';
import type {
  PressableDimensions,
  PressableEvent,
  PressableProps,
} from './PressableProps';
import {
  getPressableAccessibilityActions,
  isUserHandledAccessibilityAction,
  makeSyntheticPressableEvent,
} from './utils';

type UsePressableAccessibilityParams = {
  accessibilityActions: PressableProps['accessibilityActions'];
  dimensions: MutableRefObject<PressableDimensions>;
  disabled: PressableProps['disabled'];
  handlePressIn: (event: PressableEvent) => void;
  handlePressOut: (event: PressableEvent) => void;
  onAccessibilityAction: PressableProps['onAccessibilityAction'];
  onLongPress: PressableProps['onLongPress'];
  onPress: PressableProps['onPress'];
};

const getAccessibilityActionTargetId = (
  event: Parameters<NonNullable<PressableProps['onAccessibilityAction']>>[0]
) => {
  if (event.target == null) {
    return 0;
  }

  return (
    findNodeHandle(
      event.target as unknown as Parameters<typeof findNodeHandle>[0]
    ) ?? 0
  );
};

function usePressableAccessibility({
  accessibilityActions: userAccessibilityActions,
  dimensions,
  disabled,
  handlePressIn,
  handlePressOut,
  onAccessibilityAction: userOnAccessibilityAction,
  onLongPress,
  onPress,
}: UsePressableAccessibilityParams) {
  const shouldUsePressableAccessibilityActions =
    Platform.OS === 'android' &&
    disabled !== true &&
    (onPress != null || onLongPress != null);
  const accessibilityActions = useMemo(
    () =>
      shouldUsePressableAccessibilityActions
        ? getPressableAccessibilityActions(
            userAccessibilityActions,
            onPress,
            onLongPress
          )
        : userAccessibilityActions,
    [
      onLongPress,
      onPress,
      shouldUsePressableAccessibilityActions,
      userAccessibilityActions,
    ]
  );
  const handleAccessibilityAction = useCallback<
    NonNullable<PressableProps['onAccessibilityAction']>
  >(
    (event) => {
      const actionName = event.nativeEvent.actionName;
      const shouldHandleAction =
        shouldUsePressableAccessibilityActions &&
        !isUserHandledAccessibilityAction(
          actionName,
          userAccessibilityActions,
          userOnAccessibilityAction
        );
      const targetId = getAccessibilityActionTargetId(event);

      if (shouldHandleAction && actionName === 'activate' && onPress) {
        const timestamp = Date.now();
        handlePressIn(
          makeSyntheticPressableEvent(dimensions.current, timestamp, targetId)
        );
        handlePressOut(
          makeSyntheticPressableEvent(
            dimensions.current,
            timestamp + 1,
            targetId
          )
        );
      } else if (shouldHandleAction && actionName === 'longpress') {
        onLongPress?.(
          makeSyntheticPressableEvent(dimensions.current, undefined, targetId)
        );
      }

      userOnAccessibilityAction?.(event);
    },
    [
      dimensions,
      handlePressIn,
      handlePressOut,
      onLongPress,
      onPress,
      shouldUsePressableAccessibilityActions,
      userAccessibilityActions,
      userOnAccessibilityAction,
    ]
  );
  const onAccessibilityAction = shouldUsePressableAccessibilityActions
    ? handleAccessibilityAction
    : userOnAccessibilityAction;

  return { accessibilityActions, onAccessibilityAction };
}

export { usePressableAccessibility };
