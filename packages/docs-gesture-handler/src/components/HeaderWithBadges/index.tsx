import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';
import clsx from 'clsx';

type HeaderWithBadgesProps = {
  platforms: string[];
  version?: string;
  children?: React.ReactNode;
};

type Platform = 'android' | 'ios' | 'web';

type PlatformBadgeProps = {
  platform: Platform;
};

type VersionBadgeProps = {
  version: string;
};

const platformNameMap: Record<Platform, string> = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
};

export function VersionBadge({ version }: VersionBadgeProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <div
      className={clsx(
        styles.badge,
        styles.versionBadge,
        isDark ? styles.versionBadgeDark : styles.versionBadgeLight
      )}>
      Available from {version}
    </div>
  );
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  let platformBadgeStyle;

  switch (platform) {
    case 'android':
      platformBadgeStyle = styles.androidBadge;
      break;
    case 'ios':
      platformBadgeStyle = styles.iosBadge;
      break;
    case 'web':
      platformBadgeStyle = styles.webBadge;
      break;
    default:
      platformBadgeStyle = {};
  }

  return (
    <div className={clsx(styles.badge, platformBadgeStyle)}>
      {platformNameMap[platform]}
    </div>
  );
}

export default function HeaderWithBadges({
  platforms,
  version,
  children,
}: HeaderWithBadgesProps) {
  return (
    <div className={clsx(styles.headerWithBadges)}>
      {children}

      {platforms
        ?.map((platform) => platform.toLowerCase() as Platform)
        .sort()
        .map((platform) => (
          <PlatformBadge key={platform} platform={platform} />
        ))}

      {version && <VersionBadge version={version} />}
    </div>
  );
}
