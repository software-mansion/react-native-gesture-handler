type ReactNativeLogBoxState = Readonly<{
  selectedLogIndex: number;
}>;

type ReactNativeLogBoxSubscription = Readonly<{
  unsubscribe: () => void;
}>;

type ReactNativeLogBoxData = Readonly<{
  observe: (
    observer: (state: ReactNativeLogBoxState) => void
  ) => ReactNativeLogBoxSubscription;
}>;

export function observeReactNativeLogBox(
  observer: (isVisible: boolean) => void
) {
  if (!__DEV__) {
    return () => undefined;
  }

  try {
    const logBoxData =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('react-native/Libraries/LogBox/Data/LogBoxData') as ReactNativeLogBoxData;
    const subscription = logBoxData.observe(({ selectedLogIndex }) => {
      observer(selectedLogIndex >= 0);
    });

    return () => subscription.unsubscribe();
  } catch {
    return () => undefined;
  }
}
