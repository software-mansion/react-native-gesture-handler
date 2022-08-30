import GestureHandler from '../handlers/GestureHandler';

import NodeManager from './NodeManager';

export default class GestureStateManager {
  private gestureHandler: GestureHandler;

  constructor(handlerTag: number) {
    this.gestureHandler = NodeManager.getHandler(handlerTag);
  }

  public begin() {
    this.gestureHandler.begin();
  }
  public activate() {
    this.gestureHandler.activate();
  }
  public fail() {
    this.gestureHandler.fail();
  }
  public end() {
    this.gestureHandler.end();
  }
}
