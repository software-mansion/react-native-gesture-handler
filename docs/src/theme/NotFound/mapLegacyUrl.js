// not the most elegant way but the most fool-proof for sure
// [from , to]
const siteMap = [
  ['/installation', '/fundamentals/installation'],
  ['/quickstart', '/fundamentals/quickstart'],
  ['/gesture-composition', '/fundamentals/gesture-composition'],
  ['/manual-gestures', '/fundamentals/manual-gestures'],
  ['/under-the-hood/states-events', '/fundamentals/states-events'],
  ['/api/gestures/gesture-detector', '/gestures/gesture-detector'],
  ['/api/gestures/gesture', '/gestures/gesture'],
  ['/api/gestures/pan-gesture', '/gestures/pan-gesture'],
  ['/api/gestures/tap-gesture', '/gestures/tap-gesture'],
  ['/api/gestures/long-press-gesture', '/gestures/long-press-gesture'],
  ['/api/gestures/rotation-gesture', '/gestures/rotation-gesture'],
  ['/api/gestures/pinch-gesture', '/gestures/pinch-gesture'],
  ['/api/gestures/fling-gesture', '/gestures/fling-gesture'],
  ['/api/gestures/hover-gesture', '/gestures/hover-gesture'],
  ['/api/gestures/force-touch-gesture', '/gestures/force-touch-gesture'],
  ['/api/gestures/native-gesture', '/gestures/native-gesture'],
  ['/api/gestures/manual-gesture', '/gestures/manual-gesture'],
  ['/api/gestures/composed-gestures', '/gestures/composed-gestures'],
  ['/api/gestures/touch-events', '/gestures/touch-events'],
  ['/api/gestures/state-manager', '/gestures/state-manager'],
  ['/api/components/buttons', '/components/buttons'],
  ['/api/components/swipeable', '/components/drawer-layout'],
  ['/api/components/touchables', '/components/swipeable'],
  ['/api/components/drawer-layout', '/components/touchables'],
  [
    '/gesture-handlers/basics/about-handlers',
    '/gesture-handlers/about-handlers',
  ],
  ['/under-the-hood/states-events', '/gesture-handlers/states-events'],
  ['/gesture-handlers/basics/interactions', '/gesture-handlers/interactions'],
  ['/gesture-handlers/api/common-gh', '/gesture-handlers/common-gh'],
  ['/gesture-handlers/api/pan-gh', '/gesture-handlers/pan-gh'],
  ['/gesture-handlers/api/tap-gh', '/gesture-handlers/tap-gh'],
  ['/gesture-handlers/api/longpress-gh', '/gesture-handlers/longpress-gh'],
  ['/gesture-handlers/api/rotation-gh', '/gesture-handlers/rotation-gh'],
  ['/gesture-handlers/api/fling-gh', '/gesture-handlers/fling-gh'],
  ['/gesture-handlers/api/pinch-gh', '/gesture-handlers/pinch-gh'],
  ['/gesture-handlers/api/force-gh', '/gesture-handlers/force-gh'],
  ['/gesture-handlers/api/nativeview-gh', '/gesture-handlers/nativeview-gh'],
  [
    '/gesture-handlers/api/create-native-wrapper',
    '/gesture-handlers/create-native-wrapper',
  ],
  ['/troubleshooting', '/guides/troubleshooting'],
  // ['/guides/migrating-off-rnghenabledroot', '/guides/migrating-off-rnghenabledroot'],
  // ['/guides/testing', '/guides/testing'],
  // ['/guides/upgrading-to-2', '/guides/upgrading-to-2'],
  // ['/under-the-hood/how-does-it-work', '/under-the-hood/how-does-it-work'],
  ['/gesture-handlers/basics/state', '/under-the-hood/state'],
];

const legacyVersions = [
  {
    from: '/docs/1.10.3',
    to: '/docs/1.x',
  },
  {
    from: '/docs/2.0.0',
    to: '/docs',
  },
  {
    from: '/docs/2.1.1',
    to: '/docs',
  },
  {
    from: '/docs/2.3.0',
    to: '/docs',
  },
  {
    from: '/docs/2.4.0',
    to: '/docs',
  },
  {
    from: '/docs/next',
    to: '/docs',
  },
  {
    from: '/docs',
    to: '/docs',
  },
];

function handleLegacyVersions(pathname) {
  const redirect = legacyVersions.find(({ from }) => pathname.match(from));

  const redirectTo = redirect
    ? pathname.replace(redirect.from, redirect.to)
    : null;

  return redirectTo;
}

// Example pathname:
// '/react-native-gesture-handler/docs/2.1.1/gesture-composition'
// '/react-native-gesture-handler/docs/2.3.0/gesture-handlers/basics/interactions#simultaneous-recognition'
function handleSiteMap(pathname, hash) {
  const element = siteMap.find(([from]) => {
    return pathname.match(from);
  });

  const [redirectFromEnding, redirectToEnding] = element ?? [];

  if (redirectFromEnding === undefined) return null;

  const redirectTo = pathname.replace(redirectFromEnding, redirectToEnding);

  return redirectTo + hash;
}

// Returns null if pathname is not legacy and doesn't need to be redirected
export function mapLegacyUrl(location) {
  const resolvedVersionPathname = handleLegacyVersions(location.pathname);

  if (!resolvedVersionPathname) return null;

  return handleSiteMap(resolvedVersionPathname, location.hash);
}
