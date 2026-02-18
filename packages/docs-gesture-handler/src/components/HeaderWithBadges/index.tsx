import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';
import clsx from 'clsx';

type HeaderWithBadgesProps = {
  platforms?: ('android' | 'iOS' | 'web')[];
  version?: string;
  children?: React.ReactNode;
};

type PlatformBadgeProps = {
  platform: 'android' | 'iOS' | 'web';
};

type VersionBadgeProps = {
  version: string;
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
  const platformBadge =
    platform === 'android'
      ? styles.androidBadge
      : platform === 'iOS'
        ? styles.iosBadge
        : platform === 'web'
          ? styles.webBadge
          : {};

  return <div className={clsx(styles.badge, platformBadge)}>{platform}</div>;
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
        ?.sort()
        .map((platform) => (
          <PlatformBadge key={platform} platform={platform} />
        ))}

      {version && <VersionBadge version={version} />}
    </div>
  );
}
