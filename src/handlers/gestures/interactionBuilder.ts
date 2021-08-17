import { Gesture } from './gesture';
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

export class InteractionBuilder extends Gesture {
  private pendingGestures: PendingGesture[] = [];

  constructor(base: SimpleGesture) {
    super();
    this.addGesture({ relation: Relation.Exclusive, gesture: base });
  }

  simultaneousWith(gesture: SimpleGesture): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Simultaneous,
      gesture: gesture,
    });
  }

  exclusiveWith(gesture: SimpleGesture): InteractionBuilder {
    return this.addGesture({
      relation: Relation.Exclusive,
      gesture: gesture,
    });
  }

  requireToFail(gesture: SimpleGesture): InteractionBuilder {
    return this.addGesture({
      relation: Relation.RequireToFail,
      gesture: gesture,
    });
  }

  private addGesture(gesture: PendingGesture): InteractionBuilder {
    this.pendingGestures.push(gesture);
    return this;
  }

  configure(): SimpleGesture[] {
    return this.pendingGestures.map((pending) => pending.gesture);
  }

  prepare() {
    const simultaneousTags: number[] = [];
    const waitForTags: number[] = [];

    for (let i = this.pendingGestures.length - 1; i >= 0; i--) {
      const pendingGesture = this.pendingGestures[i];
      pendingGesture.gesture.prepare();

      const newConfig = { ...pendingGesture.gesture.config };

      newConfig.simultaneousWith = this.extendRelation(
        newConfig.simultaneousWith,
        simultaneousTags
      );
      newConfig.requireToFail = this.extendRelation(
        newConfig.requireToFail,
        waitForTags
      );

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
  }

  private extendRelation(
    currentRelation:
      | (number | SimpleGesture | React.RefObject<SimpleGesture>)[]
      | undefined,
    extendWith: number[]
  ) {
    if (currentRelation === undefined) {
      return [...extendWith];
    } else {
      return [...currentRelation, ...extendWith];
    }
  }

  initialize() {
    for (const pendingGesture of this.pendingGestures) {
      pendingGesture.gesture.initialize();
    }
  }
}
