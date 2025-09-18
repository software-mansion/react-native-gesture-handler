import { GestureRelations } from '../../v3/types';
import type IGestureHandler from '../handlers/IGestureHandler';

export default class InteractionManager {
  private static _instance: InteractionManager;
  private readonly waitForRelations: Map<number, number[]> = new Map();
  private readonly simultaneousRelations: Map<number, number[]> = new Map();
  private readonly blocksHandlersRelations: Map<number, number[]> = new Map();

  // Private becaues of singleton
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public configureInteractions(
    handler: IGestureHandler,
    config: GestureRelations
  ) {
    this.dropRelationsForHandlerWithTag(handler.handlerTag);

    if (config.waitFor) {
      const waitFor: number[] = [];
      config.waitFor.forEach((otherHandler): void => {
        waitFor.push(otherHandler);
      });

      this.waitForRelations.set(handler.handlerTag, waitFor);
    }

    if (config.simultaneousHandlers) {
      const simultaneousHandlers: number[] = [];
      config.simultaneousHandlers.forEach((otherHandler): void => {
        simultaneousHandlers.push(otherHandler);
      });

      this.simultaneousRelations.set(handler.handlerTag, simultaneousHandlers);
    }

    if (config.blocksHandlers) {
      const blocksHandlers: number[] = [];
      config.blocksHandlers.forEach((otherHandler): void => {
        blocksHandlers.push(otherHandler);
      });

      this.blocksHandlersRelations.set(handler.handlerTag, blocksHandlers);
    }
  }

  public shouldWaitForHandlerFailure(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.waitForRelations.get(
      handler.handlerTag
    );

    return (
      waitFor?.find((tag: number) => {
        return tag === otherHandler.handlerTag;
      }) !== undefined
    );
  }

  public shouldRecognizeSimultaneously(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    const simultaneousHandlers: number[] | undefined =
      this.simultaneousRelations.get(handler.handlerTag);

    return (
      simultaneousHandlers?.find((tag: number) => {
        return tag === otherHandler.handlerTag;
      }) !== undefined
    );
  }

  public shouldRequireHandlerToWaitForFailure(
    handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    const waitFor: number[] | undefined = this.blocksHandlersRelations.get(
      handler.handlerTag
    );

    return (
      waitFor?.find((tag: number) => {
        return tag === otherHandler.handlerTag;
      }) !== undefined
    );
  }

  public shouldHandlerBeCancelledBy(
    _handler: IGestureHandler,
    otherHandler: IGestureHandler
  ): boolean {
    // We check constructor name instead of using `instanceof` in order do avoid circular dependencies
    const isNativeHandler =
      otherHandler.constructor.name === 'NativeViewGestureHandler';
    const isActive = otherHandler.active;
    const isButton = otherHandler.isButton?.() === true;

    return isNativeHandler && isActive && !isButton;
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

  public static get instance(): InteractionManager {
    if (!this._instance) {
      this._instance = new InteractionManager();
    }

    return this._instance;
  }
}
