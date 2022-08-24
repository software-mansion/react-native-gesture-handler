import GestureHandler from '../handlers/GestureHandler';
import { Config, Handler } from '../interfaces';

export default class InteractionManager {
  private readonly waitForRelations: Map<number, number[]> = new Map();
  private readonly simultaneousRelations: Map<number, number[]> = new Map();

  public configureInteractions(handler: GestureHandler, config: Config) {
    this.dropRelationsForHandlerWithTag(handler.getTag());

    if (config.waitFor) {
      const waitFor: number[] = [];
      config.waitFor.forEach((otherHandler: Handler): void => {
        // New API reference
        if (typeof otherHandler === 'number') {
          waitFor.push(otherHandler);
        } else {
          // Old API reference
          waitFor.push(otherHandler.handlerTag);
        }
      });

      this.waitForRelations.set(handler.getTag(), waitFor);
    }

    if (config.simultaneousHandlers) {
      const simultaneousHandlers: number[] = [];
      config.simultaneousHandlers.forEach((otherHandler: Handler): void => {
        if (typeof otherHandler === 'number') {
          simultaneousHandlers.push(otherHandler);
        } else {
          simultaneousHandlers.push(otherHandler.handlerTag);
        }
      });

      this.simultaneousRelations.set(handler.getTag(), simultaneousHandlers);
    }
    handler.setInteractionManager(this);
  }

  public shouldWaitForHandlerFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.waitForRelations.get(
      handler.getTag()
    );
    if (!waitFor) {
      return false;
    }

    let shouldWait = false;

    waitFor.forEach((tag: number): void => {
      if (tag === otherHandler.getTag()) {
        shouldWait = true;
        return; //Returns from callback
      }
    });

    return shouldWait;
  }

  public shouldRecognizeSimultaneously(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const simultaneousHandlers:
      | number[]
      | undefined = this.simultaneousRelations.get(handler.getTag());
    if (!simultaneousHandlers) {
      return false;
    }

    let shouldRecognizeSimultaneously = false;

    simultaneousHandlers.forEach((tag: number): void => {
      if (tag === otherHandler.getTag()) {
        shouldRecognizeSimultaneously = true;
        return;
      }
    });

    return shouldRecognizeSimultaneously;
  }

  public shouldRequireHandlerToWaitForFailure(
    _handler: GestureHandler,
    _otherHandler: GestureHandler
  ): boolean {
    //TODO: Implement logic
    return false;
  }

  public shouldHandlerBeCancelledBy(
    _handler: GestureHandler,
    _otherHandler: GestureHandler
  ): boolean {
    //TODO: Implement logic
    return false;
  }

  public dropRelationsForHandlerWithTag(handlerTag: number): void {
    this.waitForRelations.delete(handlerTag);
    this.simultaneousRelations.delete(handlerTag);
  }

  public reset() {
    this.waitForRelations.clear();
    this.simultaneousRelations.clear();
  }
}
