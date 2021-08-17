import { SimpleGesture } from './simpleGestures';

enum Relation {
  Simultaneous,
  Exclusive,
  After,
  RequireToFail,
}

type PendingGesture = {
  relation: Relation;
  gesture: SimpleGesture;
};

export class GestureBuilder {
  private pendingGestures: Array<PendingGesture> = [];

  constructor(base: SimpleGesture) {
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  private addGesture(gesture: PendingGesture): GestureBuilder {
    this.pendingGestures.push(gesture);
    return this;
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

  after(gesture: SimpleGesture): GestureBuilder {
    return this.addGesture({
      relation: Relation.After,
      gesture: gesture,
    });
  }

  requireToFail(gesture: SimpleGesture): GestureBuilder {
    this.pendingGestures.push({
      relation: Relation.RequireToFail,
      gesture: gesture,
    });

    return this;
  }

  build(): BuiltGesture {
    let result = new BuiltGesture(this.prepare);

    result.gestures = [];

    for (const pg of this.pendingGestures) {
      result.gestures.push(pg.gesture);
    }

    return result;
  }

  prepare = () => {
    let simultaneous = [];
    let after = [];
    let waitFor = [];

    for (let i = this.pendingGestures.length - 1; i >= 0; i--) {
      let pendingGesture = this.pendingGestures[i];
      pendingGesture.gesture.prepare();

      let newConfig = { ...pendingGesture.gesture.config };

      if (newConfig.simultaneousWith) {
        newConfig.simultaneousWith = [
          ...newConfig.simultaneousWith,
          ...simultaneous,
        ];
      } else {
        newConfig.simultaneousWith = [...simultaneous];
      }

      if (newConfig.requireToFail) {
        newConfig.requireToFail = [...newConfig.requireToFail, ...waitFor];
      } else {
        newConfig.requireToFail = [...waitFor];
      }

      if (newConfig.after) {
        newConfig.after = [...newConfig.after, ...after];
      } else {
        newConfig.after = [...after];
      }

      pendingGesture.gesture.config = newConfig;

      switch (pendingGesture.relation) {
        case Relation.Simultaneous:
          simultaneous.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.Exclusive:
          break;
        case Relation.After:
          after.push(pendingGesture.gesture.handlerTag);
          break;
        case Relation.RequireToFail:
          waitFor.push(pendingGesture.gesture.handlerTag);
          break;
      }
    }
  };
}

export class BuiltGesture {
  public gestures: Array<SimpleGesture> = [];
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
