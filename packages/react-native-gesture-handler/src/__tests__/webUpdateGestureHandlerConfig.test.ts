import RNGestureHandlerModule from '../RNGestureHandlerModule.web';
import NodeManager from '../web/tools/NodeManager';

const HANDLER_TAG = 4680;

afterEach(() => {
  NodeManager.dropGestureHandler(HANDLER_TAG);
});

describe('[Web] updateGestureHandlerConfig', () => {
  test('updates the config of an existing handler', () => {
    RNGestureHandlerModule.createGestureHandler(
      'TapGestureHandler',
      HANDLER_TAG,
      {}
    );

    RNGestureHandlerModule.updateGestureHandlerConfig(HANDLER_TAG, {
      enabled: false,
    });

    expect(NodeManager.getHandler(HANDLER_TAG).enabled).toBe(false);
  });

  test('ignores an update for a dropped handler', () => {
    RNGestureHandlerModule.createGestureHandler(
      'TapGestureHandler',
      HANDLER_TAG,
      {}
    );
    RNGestureHandlerModule.dropGestureHandler(HANDLER_TAG);

    expect(() =>
      RNGestureHandlerModule.updateGestureHandlerConfig(HANDLER_TAG, {
        enabled: false,
      })
    ).not.toThrow();
    expect(NodeManager.hasHandler(HANDLER_TAG)).toBe(false);
  });
});
