import React from 'react';
import { StyleSheet } from 'react-native';

interface HeaderWithBadgeProps {
  platforms: ('android' | 'iOS' | 'web')[];
  children?: React.ReactNode;
}

export function Badge({ platform }: { platform: 'android' | 'iOS' | 'web' }) {
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

export default function HeaderWithBadge({
  platforms,
  children,
}: HeaderWithBadgeProps) {
  return (
    <div style={styles.container}>
      {children}

      {platforms.sort().map((platform) => (
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
