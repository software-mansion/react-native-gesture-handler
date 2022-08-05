import GestureHandler, { Config } from '../handlers/GestureHandler';

export default class InteractionManager {
  private readonly waitForRelations: Map<number, number[]> = new Map();
  private readonly simultaneousRelations: Map<number, number[]> = new Map();

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
    const waitFor: number[] | undefined = this.waitForRelations.get(
      handler.getTag()
    );
    if (!waitFor) return false;

    let shouldWait = false;

    waitFor.forEach((tag: number) => {
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
    if (!simultaneousHandlers) return false;

    let shouldRecognizeSimultaneously = false;

    simultaneousHandlers.forEach((tag: number) => {
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
    return false;
  }

  public shouldHandlerBeCancelledBy(
    _handler: GestureHandler,
    _otherHandler: GestureHandler
  ): boolean {
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
