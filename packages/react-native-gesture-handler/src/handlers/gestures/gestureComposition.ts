import { BaseGesture, Gesture, GestureRef, GestureType } from './gesture';

function extendRelation(
  currentRelation: GestureRef[] | undefined,
  extendWith: GestureType[]
) {
  if (currentRelation === undefined) {
    return [...extendWith];
  } else {
    return [...currentRelation, ...extendWith];
  }
}

export class ComposedGesture extends Gesture {
  protected gestures: Gesture[] = [];
  protected simultaneousGestures: GestureType[] = [];
  protected requireGesturesToFail: GestureType[] = [];

  constructor(...gestures: Gesture[]) {
    super();
    this.gestures = gestures;
  }

  protected prepareSingleGesture(
    gesture: Gesture,
    simultaneousGestures: GestureType[],
    requireGesturesToFail: GestureType[]
  ) {
    if (gesture instanceof BaseGesture) {
      const newConfig = { ...gesture.config };

      // No need to extend `blocksHandlers` here, because it's not changed in composition.
      // The same effect is achieved by reversing the order of 2 gestures in `Exclusive`
      newConfig.simultaneousWith = extendRelation(
        newConfig.simultaneousWith,
        simultaneousGestures
      );
      newConfig.requireToFail = extendRelation(
        newConfig.requireToFail,
        requireGesturesToFail
      );

      gesture.config = newConfig;
    } else if (gesture instanceof ComposedGesture) {
      gesture.simultaneousGestures = simultaneousGestures;
      gesture.requireGesturesToFail = requireGesturesToFail;
      gesture.prepare();
    }
  }

  prepare() {
    for (const gesture of this.gestures) {
      this.prepareSingleGesture(
        gesture,
        this.simultaneousGestures,
        this.requireGesturesToFail
      );
    }
  }

  initialize() {
    for (const gesture of this.gestures) {
      gesture.initialize();
    }
  }

  toGestureArray(): GestureType[] {
    return this.gestures.flatMap((gesture) => gesture.toGestureArray());
  }
}

export class SimultaneousGesture extends ComposedGesture {
  override prepare() {
    // This piece of magic works something like this:
    // for every gesture in the array
    const simultaneousArrays = this.gestures.map((gesture) =>
      // we take the array it's in
      this.gestures
        // and make a copy without it
        .filter((x) => x !== gesture)
        // then we flatmap the result to get list of raw (not composed) gestures
        // this way we don't make the gestures simultaneous with themselves, which is
        // important when the gesture is `ExclusiveGesture` - we don't want to make
        // exclusive gestures simultaneous
        .flatMap((x) => x.toGestureArray())
    );

    for (let i = 0; i < this.gestures.length; i++) {
      this.prepareSingleGesture(
        this.gestures[i],
        simultaneousArrays[i],
        this.requireGesturesToFail
      );
    }
  }
}

export class ExclusiveGesture extends ComposedGesture {
  override prepare() {
    // Transforms the array of gestures into array of grouped raw (not composed) gestures
    // i.e. [gesture1, gesture2, ComposedGesture(gesture3, gesture4)] -> [[gesture1], [gesture2], [gesture3, gesture4]]
    const gestureArrays = this.gestures.map((gesture) =>
      gesture.toGestureArray()
    );

    let requireToFail: GestureType[] = [];

    for (let i = 0; i < this.gestures.length; i++) {
      this.prepareSingleGesture(
        this.gestures[i],
        this.simultaneousGestures,
        this.requireGesturesToFail.concat(requireToFail)
      );

      // Every group gets to wait for all groups before it
      requireToFail = requireToFail.concat(gestureArrays[i]);
    }
  }
}

export type ComposedGestureType = InstanceType<typeof ComposedGesture>;
export type RaceGestureType = ComposedGestureType;
export type SimultaneousGestureType = InstanceType<typeof SimultaneousGesture>;
export type ExclusiveGestureType = InstanceType<typeof ExclusiveGesture>;
