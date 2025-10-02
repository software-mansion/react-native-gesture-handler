import { GestureRelations, SingleGestureName } from '../../v3/types';
import type IGestureHandler from '../handlers/IGestureHandler';
import { Config, Handler } from '../interfaces';

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
    config: GestureRelations | Config
  ) {
    this.dropRelationsForHandlerWithTag(handler.handlerTag);

    if (config.waitFor) {
      const waitFor: number[] = [];
      config.waitFor.forEach((otherHandler: Handler | number) => {
        waitFor.push(
          typeof otherHandler === 'number'
            ? otherHandler
            : otherHandler.handlerTag
        );
      });

      this.waitForRelations.set(handler.handlerTag, waitFor);
    }

    if (config.simultaneousHandlers) {
      const simultaneousHandlers: number[] = [];
      config.simultaneousHandlers.forEach((otherHandler: Handler | number) => {
        simultaneousHandlers.push(
          typeof otherHandler === 'number'
            ? otherHandler
            : otherHandler.handlerTag
        );
      });

      this.simultaneousRelations.set(handler.handlerTag, simultaneousHandlers);
    }

    if (config.blocksHandlers) {
      const blocksHandlers: number[] = [];
      config.blocksHandlers.forEach((otherHandler: Handler | number) => {
        blocksHandlers.push(
          typeof otherHandler === 'number'
            ? otherHandler
            : otherHandler.handlerTag
        );
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
    const isNativeHandler = otherHandler.name === SingleGestureName.Native;
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
