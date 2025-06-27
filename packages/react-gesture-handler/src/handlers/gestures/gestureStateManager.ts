export interface GestureStateManagerType {
  begin: () => void;
  activate: () => void;
  fail: () => void;
  end: () => void;
}

function create(_handlerTag: number): GestureStateManagerType {
  'worklet';
  return {
    begin: () => {
      //
    },

    activate: () => {
      //
    },

    fail: () => {
      //
    },

    end: () => {
      //
    },
  };
}

export const GestureStateManager = {
  create,
};
