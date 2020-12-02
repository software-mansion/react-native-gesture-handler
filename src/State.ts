/* GESTURE HANDLER STATE */

const StateTypes: Record<string, number> = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

const State = {
  // for some reason using spread operator resolves in wrong type
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
  print: (state: number) => {
    const keys = Object.keys(StateTypes);
    for (const key of keys) {
      if (state === StateTypes[key]) {
        return key;
      }
    }
  },
};

export default State;
