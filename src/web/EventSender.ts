import { ActionType } from '../ActionType';
import { State } from '../State';

interface NativeEvent extends Record<string, any> {
  numberOfPointers: number;
  state: State;
  pointerInside: boolean | undefined;
  handlerTag: number;
  target: number;
  oldState?: State;
}

interface ResultEvent extends Record<string, any> {
  nativeEvent: NativeEvent;
  timeStamp: number;
}

export default class EventSender {
  public static sendEvent(
    event: ResultEvent,
    onAction: any,
    actionType: ActionType
  ) {
    this.invokeNullableMethod(onAction, event);
  }

  private static invokeNullableMethod(
    method:
      | ((event: ResultEvent) => void)
      | { __getHandler: () => (event: ResultEvent) => void }
      | { __nodeConfig: { argMapping: ResultEvent } },
    event: ResultEvent
  ): void {
    if (!method) return;

    if (typeof method === 'function') {
      method(event);
      return;
    }

    if ('__getHandler' in method && typeof method.__getHandler === 'function') {
      const handler = method.__getHandler();
      this.invokeNullableMethod(handler, event);
      return;
    }

    if ('__nodeConfig' in method) {
      const { argMapping } = method.__nodeConfig;
      if (!Array.isArray(argMapping)) return;

      for (const [index, [key, value]] of argMapping.entries()) {
        if (!(key in event.nativeEvent)) continue;

        const nativeValue = event.nativeEvent[key];

        if (value?.setValue) {
          //Reanimated API
          value.setValue(nativeValue);
        } else {
          //RN Animated API
          method.__nodeConfig.argMapping[index] = [key, nativeValue];
        }
      }

      return;
    }
  }
}
