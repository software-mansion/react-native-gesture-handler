import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureDetector,
  Touchable,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../common';
import type { ConsoleLogEntry, ConsoleLogLevel } from './consoleLogs';
import {
  clearConsoleLogs,
  getConsoleLogsSnapshot,
  subscribeToConsoleLogs,
} from './consoleLogs';
import { observeReactNativeLogBox } from './reactNativeLogBox';

const HEADER_HEIGHT = 48;
const MIN_SHEET_HEIGHT = 320;
const MAX_SHEET_HEIGHT = 720;
const SHEET_HEIGHT_RATIO = 0.82;
const SPRING_CONFIG = {
  duration: 350,
};

export function useConsoleSheetCollapsedHeight() {
  const { bottom } = useSafeAreaInsets();

  return HEADER_HEIGHT + bottom;
}

const LEVEL_COLORS: Record<ConsoleLogLevel, string> = {
  debug: '#6B7280',
  log: '#1F2937',
  info: '#2563EB',
  warn: '#B45309',
  error: '#DC2626',
};

const LEVEL_BACKGROUNDS: Record<ConsoleLogLevel, string> = {
  debug: '#F3F4F6',
  log: '#FFFFFF',
  info: '#EFF6FF',
  warn: '#FFFBEB',
  error: '#FEF2F2',
};

export function ConsoleLogSheet() {
  const entries = useSyncExternalStore(
    subscribeToConsoleLogs,
    getConsoleLogsSnapshot,
    getConsoleLogsSnapshot
  );
  const { height: windowHeight } = useWindowDimensions();
  const collapsedHeight = useConsoleSheetCollapsedHeight();
  const sheetHeight = Math.min(
    windowHeight,
    MAX_SHEET_HEIGHT,
    Math.max(
      collapsedHeight,
      MIN_SHEET_HEIGHT,
      windowHeight * SHEET_HEIGHT_RATIO
    )
  );
  const closedOffset = Math.max(0, sheetHeight - collapsedHeight);
  const translateY = useSharedValue(closedOffset);
  const gestureStartOffset = useSharedValue(closedOffset);
  const isExpanded = useSharedValue(false);
  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [readThroughEntryId, setReadThroughEntryId] = useState(-1);
  const latestEntryId = entries[entries.length - 1]?.id ?? -1;
  const latestEntryIdRef = useRef(latestEntryId);
  latestEntryIdRef.current = latestEntryId;
  const markAllLogsRead = useCallback(() => {
    setReadThroughEntryId(latestEntryIdRef.current);
  }, []);
  const isReactNativeLogBoxVisible =
    useReactNativeLogBoxVisibility(markAllLogsRead);

  const updateExpandedState = useCallback(
    (nextExpanded: boolean) => {
      if (nextExpanded || expandedRef.current) {
        markAllLogsRead();
      }
      expandedRef.current = nextExpanded;
      setExpanded(nextExpanded);
    },
    [markAllLogsRead]
  );

  const animateTo = useCallback(
    (nextExpanded: boolean) => {
      updateExpandedState(nextExpanded);
      isExpanded.value = nextExpanded;
      translateY.value = withSpring(
        nextExpanded ? 0 : closedOffset,
        SPRING_CONFIG
      );
    },
    [closedOffset, isExpanded, translateY, updateExpandedState]
  );

  useEffect(() => {
    const nextExpanded = expandedRef.current;
    isExpanded.value = nextExpanded;
    translateY.value = nextExpanded ? 0 : closedOffset;
  }, [closedOffset, isExpanded, translateY]);

  const panGesture = usePanGesture({
    activeOffsetY: [-5, 5],
    onActivate: () => {
      cancelAnimation(translateY);
      gestureStartOffset.value = translateY.value;
    },
    onUpdate: (event) => {
      const nextOffset = gestureStartOffset.value + event.translationY;
      translateY.value = Math.max(0, Math.min(closedOffset, nextOffset));
    },
    onDeactivate: (event) => {
      const shouldExpand =
        event.velocityY < -350 ||
        (event.velocityY <= 350 && translateY.value < closedOffset / 2);

      isExpanded.value = shouldExpand;
      translateY.value = withSpring(
        shouldExpand ? 0 : closedOffset,
        SPRING_CONFIG
      );
      runOnJS(updateExpandedState)(shouldExpand);
    },
    onFinalize: (event) => {
      if (event.canceled) {
        translateY.value = withSpring(
          isExpanded.value ? 0 : closedOffset,
          SPRING_CONFIG
        );
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const newestEntries = useMemo(() => [...entries].reverse(), [entries]);
  const unreadCount =
    expanded || isReactNativeLogBoxVisible
      ? 0
      : entries.reduce(
          (count, entry) => count + Number(entry.id > readThroughEntryId),
          0
        );
  const expandAccessibilityLabel =
    unreadCount === 0
      ? 'Expand console'
      : `Expand console, ${unreadCount} unread ${
          unreadCount === 1 ? 'log' : 'logs'
        }`;

  if (isReactNativeLogBoxVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.sheet, { height: sheetHeight }, animatedSheetStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.header, { height: HEADER_HEIGHT }]}>
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? 'Collapse console' : expandAccessibilityLabel
            }
            onPress={() => animateTo(!expandedRef.current)}
            style={styles.headerTitle}>
            <TerminalIcon />
            <Text style={styles.title}>Console</Text>
          </Touchable>
          <Touchable
            accessibilityRole="button"
            disabled={entries.length === 0}
            activeOpacity={0.5}
            onPress={clearConsoleLogs}
            style={styles.clearButton}>
            <Text
              style={[
                styles.clearButtonText,
                entries.length === 0 && styles.clearButtonTextDisabled,
              ]}>
              Clear logs
            </Text>
          </Touchable>
          {unreadCount > 0 && (
            <View pointerEvents="none" style={styles.headerUnread}>
              <UnreadBadge count={unreadCount} />
            </View>
          )}
        </View>
      </GestureDetector>
      <FlatList
        data={newestEntries}
        keyExtractor={(entry) => entry.id.toString()}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={expanded}
        contentContainerStyle={
          newestEntries.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Console output will appear here.</Text>
        }
        renderItem={({ item }) => <ConsoleLogRow entry={item} />}
      />
    </Animated.View>
  );
}

function UnreadBadge({ count }: { count: number }) {
  return (
    <View style={styles.unreadBadge}>
      <View style={styles.unreadDot} />
      <Text style={styles.unreadText}>{count > 99 ? '99+' : count} new</Text>
    </View>
  );
}

function useReactNativeLogBoxVisibility(onSeen: () => void) {
  const [isVisible, setIsVisible] = useState(false);
  const wasVisible = useRef(false);

  useEffect(() => {
    // LogBox is rendered in a separate native surface, so z-index alone
    // cannot reliably keep its footer above app-owned positioned views.
    return observeReactNativeLogBox((nextIsVisible) => {
      if (nextIsVisible || wasVisible.current) {
        onSeen();
      }
      wasVisible.current = nextIsVisible;
      setIsVisible(nextIsVisible);
    });
  }, [onSeen]);

  return isVisible;
}

function TerminalIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 4.5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
        stroke={COLORS.NAVY}
        strokeWidth={1.8}
      />
      <Path
        d="m7 9 3 3-3 3m6 0h4"
        stroke={COLORS.NAVY}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ConsoleLogRow({ entry }: { entry: ConsoleLogEntry }) {
  return (
    <View
      style={[
        styles.logRow,
        {
          backgroundColor: LEVEL_BACKGROUNDS[entry.level],
          borderLeftColor: LEVEL_COLORS[entry.level],
        },
      ]}>
      <View style={styles.logMeta}>
        <Text style={[styles.level, { color: LEVEL_COLORS[entry.level] }]}>
          {entry.level.toUpperCase()}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(entry.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={[styles.message, { color: LEVEL_COLORS[entry.level] }]}>
        {entry.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: COLORS.offWhite,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.GRAY,
    backgroundColor: COLORS.headerSeparator,
  },
  headerTitle: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 8,
  },
  title: {
    color: COLORS.NAVY,
    fontSize: 15,
    fontWeight: '700',
  },
  clearButton: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  clearButtonText: {
    color: COLORS.RED,
    fontSize: 14,
    fontWeight: '700',
  },
  clearButtonTextDisabled: {
    color: COLORS.GRAY,
  },
  headerUnread: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: '#FEE2E2',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.RED,
  },
  unreadText: {
    color: COLORS.RED,
    fontSize: 10,
    fontWeight: '700',
  },
  list: {},
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
  logRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  level: {
    fontSize: 10,
    fontWeight: '800',
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 10,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});
