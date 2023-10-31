import GestureHandler from '../handlers/GestureHandler';
import { Config, Handler } from '../interfaces';

export default class InteractionManager {
  private static instance: InteractionManager;
  private readonly waitForRelations: Map<number, number[]> = new Map();
  private readonly simultaneousRelations: Map<number, number[]> = new Map();
  private readonly blocksHandlersRelations: Map<number, number[]> = new Map();

  // Private becaues of singleton
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

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

    if (config.blocksHandlers) {
      const blocksHandlers: number[] = [];
      config.blocksHandlers.forEach((otherHandler: Handler): void => {
        if (typeof otherHandler === 'number') {
          blocksHandlers.push(otherHandler);
        } else {
          blocksHandlers.push(otherHandler.handlerTag);
        }
      });

      this.blocksHandlersRelations.set(handler.getTag(), blocksHandlers);
    }
  }

  public shouldWaitForHandlerFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.waitForRelations.get(
      handler.getTag()
    );

    return (
      waitFor?.find((tag: number) => {
        return tag === otherHandler.getTag();
      }) !== undefined
    );
  }

  public shouldRecognizeSimultaneously(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const simultaneousHandlers: number[] | undefined =
      this.simultaneousRelations.get(handler.getTag());

    return (
      simultaneousHandlers?.find((tag: number) => {
        return tag === otherHandler.getTag();
      }) !== undefined
    );
  }

  public shouldRequireHandlerToWaitForFailure(
    handler: GestureHandler,
    otherHandler: GestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.blocksHandlersRelations.get(
      handler.getTag()
    );

    return (
      waitFor?.find((tag: number) => {
        return tag === otherHandler.getTag();
      }) !== undefined
    );
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
    this.blocksHandlersRelations.delete(handlerTag);
  }

  public reset() {
    this.waitForRelations.clear();
    this.simultaneousRelations.clear();
    this.blocksHandlersRelations.clear();
  }

  public static getInstance(): InteractionManager {
    if (!this.instance) {
      this.instance = new InteractionManager();
    }

    return this.instance;
  }
}
