import { NativeTouchEvent } from 'react-native';
import GestureHandler from '../handlers/GestureHandler';

import NodeManager from './NodeManager';

export default class GestureStateManager {
  private gestureHandler: GestureHandler;
  private event!: NativeTouchEvent;

  constructor(handlerTag: number) {
    this.gestureHandler = NodeManager.getHandler(handlerTag);
  }

  public begin() {
    this.gestureHandler.begin(this.event);
  }
  public activate() {
    this.gestureHandler.activate(this.event);
  }
  public fail() {
    this.gestureHandler.fail(this.event);
  }
  public end() {
    this.gestureHandler.end(this.event);
  }

  public update(event: NativeTouchEvent) {
    this.event = event;
  }
}
