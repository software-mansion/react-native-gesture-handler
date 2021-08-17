import { SimpleGesture } from './simpleGestures';

enum Relation {
  Simultaneous,
  Exclusive,
  RequireToFail,
}

type PendingGesture = {
  relation: Relation;
  gesture: SimpleGesture;
};

export class GestureBuilder {
  private pendingGestures: PendingGesture[] = [];

  constructor(base: SimpleGesture) {
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(gesture: SimpleGesture): GestureBuilder {
    return this.addGesture({
      relation: Relation.Simultaneous,
      gesture: gesture,
    });
  }

  exclusiveWith(gesture: SimpleGesture): GestureBuilder {
    return this.addGesture({
      relation: Relation.Exclusive,
      gesture: gesture,
    });
  }

  requireToFail(gesture: SimpleGesture): GestureBuilder {
    return this.addGesture({
      relation: Relation.RequireToFail,
      gesture: gesture,
    });
  }

  private addGesture(gesture: PendingGesture): GestureBuilder {
    this.pendingGestures.push(gesture);
    return this;
  }

  configure(): GestureConfig {
    const gesturesConfig = new GestureConfig(this.prepare);
    gesturesConfig.gestures = this.pendingGestures.map(
      (pending) => pending.gesture
    );
    return gesturesConfig;
  }

  prepare = () => {
    const simultaneousTags: number[] = [];
    const waitForTags: number[] = [];

    for (let i = this.pendingGestures.length - 1; i >= 0; i--) {
      const pendingGesture = this.pendingGestures[i];
      pendingGesture.gesture.prepare();

      const newConfig = { ...pendingGesture.gesture.config };

      if (newConfig.simultaneousWith) {
        newConfig.simultaneousWith = [
          ...newConfig.simultaneousWith,
          ...simultaneousTags,
        ];
      } else {
        newConfig.simultaneousWith = [...simultaneousTags];
      }

      if (newConfig.requireToFail) {
        newConfig.requireToFail = [...newConfig.requireToFail, ...waitForTags];
      } else {
        newConfig.requireToFail = [...waitForTags];
      }

      pendingGesture.gesture.config = newConfig;

      switch (pendingGesture.relation) {
        case Relation.Simultaneous:
          simultaneousTags.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.Exclusive:
          break;
        case Relation.RequireToFail:
          waitForTags.push(pendingGesture.gesture.handlerTag);
          break;
      }
    }
  };
}

export class GestureConfig {
  public gestures: SimpleGesture[] = [];
  private prepareCallback: () => void;

  constructor(prepareCallback: () => void) {
    this.prepareCallback = prepareCallback;
  }

  initialize() {
    for (const gesture of this.gestures) {
      gesture.initialize();
    }
  }

  prepare() {
    this.prepareCallback();
  }
}
