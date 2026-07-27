import type { BannerZone } from '@swmansion/t-rex-ui';

export const TOP_BAR_BANNER = {
  rotateIntervalMs: 4000,
  hiddenPaths: [
    // '/react-native-gesture-handler/docs',
    '/react-native-gesture-handler/search',
  ] as string[],
  zones: [
    {
      zoneId: 'react-native-gesture-handler-topbar-1',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#782aeb',
    },
    {
      zoneId: 'react-native-gesture-handler-topbar-2',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#782aeb',
    },
    {
      zoneId: 'react-native-gesture-handler-topbar-3',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#782aeb',
    },
  ] satisfies BannerZone[],
};
