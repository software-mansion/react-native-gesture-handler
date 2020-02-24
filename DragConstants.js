import RNGestureHandlerModule from './RNGestureHandlerModule';

export const DragMode = RNGestureHandlerModule.DragMode;

const DragState = {
  BEGAN: 1,
  ACTIVE: 2,
  DROP: 3,
  END: 4,
  ENTERED: 5,
  EXITED: 6
};

DragState.print = state => {
  const keys = Object.keys(DragState);
  for (let i = 0; i < keys.length; i++) {
    if (state === DragState[keys[i]]) {
      return keys[i];
    }
  }
};

export default DragState;
