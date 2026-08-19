import { MountRegistry } from '../mountRegistry';

const flushMountBatch = () =>
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });

const asGesture = (handlerTag: number) => ({ handlerTag }) as never;

describe('MountRegistry mount batching', () => {
  test('notifies listeners once per tick with the set of mounted tags', async () => {
    const listener = jest.fn<void, [ReadonlySet<number>]>();
    const unsubscribe = MountRegistry.addMountListener(listener);

    MountRegistry.gestureWillMount(asGesture(1));
    MountRegistry.gestureWillMount(asGesture(2));
    MountRegistry.gestureWillMount(asGesture(3));

    // Nothing is dispatched synchronously — this is what turns the N x N
    // notification storm into a single pass.
    expect(listener).not.toHaveBeenCalled();

    await flushMountBatch();

    expect(listener).toHaveBeenCalledTimes(1);
    expect([...listener.mock.calls[0][0]].sort()).toEqual([1, 2, 3]);

    unsubscribe();
  });

  test('old API handlers join the same batch', async () => {
    const listener = jest.fn<void, [ReadonlySet<number>]>();
    const unsubscribe = MountRegistry.addMountListener(listener);

    MountRegistry.gestureWillMount(asGesture(10));
    MountRegistry.gestureHandlerWillMount(asGesture(11));

    await flushMountBatch();

    expect(listener).toHaveBeenCalledTimes(1);
    expect([...listener.mock.calls[0][0]].sort()).toEqual([10, 11]);

    unsubscribe();
  });

  test('a later tick starts a new batch', async () => {
    const listener = jest.fn<void, [ReadonlySet<number>]>();
    const unsubscribe = MountRegistry.addMountListener(listener);

    MountRegistry.gestureWillMount(asGesture(20));
    await flushMountBatch();
    MountRegistry.gestureWillMount(asGesture(21));
    await flushMountBatch();

    expect(listener).toHaveBeenCalledTimes(2);
    expect([...listener.mock.calls[0][0]]).toEqual([20]);
    expect([...listener.mock.calls[1][0]]).toEqual([21]);

    unsubscribe();
  });

  test('unsubscribed listeners do not receive further batches', async () => {
    const listener = jest.fn<void, [ReadonlySet<number>]>();
    const unsubscribe = MountRegistry.addMountListener(listener);
    unsubscribe();

    MountRegistry.gestureWillMount(asGesture(30));
    await flushMountBatch();

    expect(listener).not.toHaveBeenCalled();
  });

  test('unmount notifications stay synchronous and per-gesture', () => {
    const listener = jest.fn();
    const unsubscribe = MountRegistry.addUnmountListener(listener);

    const gesture = asGesture(40);
    MountRegistry.gestureWillUnmount(gesture);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(gesture);

    unsubscribe();
  });
});
