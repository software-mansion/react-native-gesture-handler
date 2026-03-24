import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useIsScreenReaderEnabled() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await AccessibilityInfo.isScreenReaderEnabled();
        setIsEnabled(res);
      } catch (error) {
        console.warn('Could not read accessibility info: defaulting to false');
      }
    };

    checkStatus();

    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setIsEnabled(enabled);
      }
    );

    return () => {
      listener.remove();
    };
  }, []);
  return isEnabled;
}
