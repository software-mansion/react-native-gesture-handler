import React from 'react';
import { StyleSheet } from 'react-native';
import { useColorMode } from '@docusaurus/theme-common';

const COLORS = {
  SWM_OFF_WHITE: '#f8f9ff',
  SWM_PURPLE_LIGHT_100: '#782aeb',
  SWM_NAVY_LIGHT_60: '#6676aa',
  SWM_NAVY: '#232736',
};

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
      style={{
        ...styles.badge,
        ...styles.versionBadge,
        ...(isDark ? styles.versionBadgeDark : styles.versionBadgeLight),
      }}>
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
    marginLeft: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
  },

  versionBadgeLight: {
    borderColor: COLORS.SWM_PURPLE_LIGHT_100,
    backgroundColor: COLORS.SWM_OFF_WHITE,
    color: COLORS.SWM_PURPLE_LIGHT_100,
  },

  versionBadgeDark: {
    borderColor: COLORS.SWM_NAVY_LIGHT_60,
    backgroundColor: COLORS.SWM_NAVY,
    color: COLORS.SWM_OFF_WHITE,
  },
});
