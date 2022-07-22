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
      this.waitForRelations.set(handler.getTag(), config.waitFor);
    }

    if (config.simultaneousHandlers) {
      this.simultaneousRelations.set(
        handler.getTag(),
        config.simultaneousHandlers
      );
    }
  }

  public shouldWaitForHandlerFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    this.waitForRelations.get(handler.getTag())!.forEach((tag: number) => {
      if (tag === otherHandler.getTag()) return true;
    });

    return false;
  }

  public shouldRequireHandlerToWaitForFailure(): boolean {
    return false;
  }

  public shouldHandlerBeCancelledBy(): boolean {
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
