import React from 'react';
import { StyleSheet } from 'react-native';

type HeaderWithBadgeProps = {
  platforms: string[];
  children?: React.ReactNode;
};

type Platform = 'android' | 'ios' | 'web';

const platformNameMap: Record<Platform, string> = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
};

export function Badge({ platform }: { platform: Platform }) {
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
    <div style={{ ...styles.badge, ...platformBadgeStyle }}>
      {platformNameMap[platform]}
    </div>
  );
}

export default function HeaderWithBadge({
  platforms,
  children,
}: HeaderWithBadgeProps) {
  return (
    <div style={styles.container}>
      {children}

      {platforms
        .map((platform) => platform.toLowerCase() as Platform)
        .sort()
        .map((platform) => (
          <Badge key={platform} platform={platform} />
        ))}
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
    backgroundColor: '#34a853',
  },

  iosBadge: {
    backgroundColor: '#000000',
  },

  webBadge: {
    backgroundColor: '#1067c4',
  },
});
