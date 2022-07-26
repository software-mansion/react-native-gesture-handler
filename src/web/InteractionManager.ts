import GestureHandler, { Config } from './GestureHandler';

export default class InteractionManager {
  private readonly waitForRelations: Map<number, number[]> = new Map();
  private readonly simultaneousRelations: Map<number, number[]> = new Map();

  public dropRelationsForHandlerWithTag(handlerTag: number): void {
    this.waitForRelations.delete(handlerTag);
    this.simultaneousRelations.delete(handlerTag);
  }

  public configureInteractions(handler: GestureHandler, config: Config) {
    handler.setInteractionManager(this);

    if (config.waitFor) {
      const waitFor: number[] = [];
      config.waitFor.forEach((handler) => {
        waitFor.push(handler.handlerTag);
      });

      this.waitForRelations.set(handler.getTag(), waitFor);
    }

    if (config.simultaneousHandlers) {
      const simultaneousHandlers: number[] = [];
      config.simultaneousHandlers.forEach((handler) => {
        simultaneousHandlers.push(handler.handlerTag);
      });

      this.simultaneousRelations.set(handler.getTag(), simultaneousHandlers);
    }
  }

  public shouldWaitForHandlerFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const waitFor = this.waitForRelations.get(handler.getTag());
    let ans = false;

    if (waitFor) {
      waitFor.forEach((tag: number) => {
        if (tag === otherHandler.getTag()) {
          ans = true;
          return;
        }
      });
    }

    return ans;
  }

  public shouldRequireHandlerToWaitForFailure(
    _handler: GestureHandler,
    _otherHandler: GestureHandler
  ): boolean {
    return false;
  }

  public shouldHandlerBeCancelledBy(
    _handler: GestureHandler,
    _otherHandler: GestureHandler
  ): boolean {
    return false;
  }

  public shouldRecognizeSimultaneously(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    this.simultaneousRelations.get(handler.getTag())!.forEach((tag) => {
      if (tag === otherHandler.getTag()) return true;
    });

    return false;
  }

  public reset() {
    this.waitForRelations.clear();
    this.simultaneousRelations.clear();
  }
}
