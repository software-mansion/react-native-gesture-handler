import React from 'react';
import { StyleSheet } from 'react-native';

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
  return (
    <div style={{ ...styles.badge, ...styles.versionBadge }}>{version}</div>
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

  return <div style={{ ...styles.badge, ...platformBadge }}>{platform}</div>;
}

export default function HeaderWithBadges({
  platforms,
  version,
  children,
}: HeaderWithBadgesProps) {
  return (
    <div style={styles.container}>
      {children}

      {platforms?.map((platform) => (
        <PlatformBadge key={platform} platform={platform} />
      ))}

      {version && <VersionBadge version={version} />}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  badge: {
    borderRadius: 10,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    paddingRight: 10,
    color: 'white',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  androidBadge: {
    backgroundColor: '#0f8142',
  },

  iosBadge: {
    backgroundColor: '#000000',
  },

  webBadge: {
    backgroundColor: '#1067c4',
  },

  versionBadge: {
    backgroundColor: '#DB7093',
  },
});
