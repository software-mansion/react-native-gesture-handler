import type { PropsWithChildren } from 'react';
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  Touchable,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { COLORS } from '../common';
import type { ConsoleLogEntry, ConsoleLogLevel } from './consoleLogs';
import {
  clearConsoleLogs,
  getConsoleLogsSnapshot,
  subscribeToConsoleLogs,
} from './consoleLogs';
import { observeReactNativeLogBox } from './reactNativeLogBox';

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

type ConsoleModalContextValue = {
  openConsole: () => void;
  unreadCount: number;
};

const ConsoleModalContext = createContext<ConsoleModalContextValue | null>(
  null
);

export function ConsoleModalProvider({ children }: PropsWithChildren) {
  const entries = useSyncExternalStore(
    subscribeToConsoleLogs,
    getConsoleLogsSnapshot,
    getConsoleLogsSnapshot
  );
  const [visible, setVisible] = useState(false);
  const [readThroughEntryId, setReadThroughEntryId] = useState(-1);
  const latestEntryId = entries[entries.length - 1]?.id ?? -1;
  const latestEntryIdRef = useRef(latestEntryId);
  latestEntryIdRef.current = latestEntryId;

  const markAllLogsRead = useCallback(() => {
    setReadThroughEntryId(latestEntryIdRef.current);
  }, []);

  const openConsole = useCallback(() => {
    markAllLogsRead();
    setVisible(true);
  }, [markAllLogsRead]);

  const closeConsole = useCallback(() => {
    markAllLogsRead();
    setVisible(false);
  }, [markAllLogsRead]);

  const isReactNativeLogBoxVisible =
    useReactNativeLogBoxVisibility(closeConsole);
  const unreadCount = visible
    ? 0
    : entries.reduce(
        (count, entry) => count + Number(entry.id > readThroughEntryId),
        0
      );
  const contextValue = useMemo(
    () => ({ openConsole, unreadCount }),
    [openConsole, unreadCount]
  );

  return (
    <ConsoleModalContext value={contextValue}>
      {children}
      <ConsoleModal
        entries={entries}
        visible={visible && !isReactNativeLogBoxVisible}
        onClose={closeConsole}
      />
    </ConsoleModalContext>
  );
}

export function ConsoleHeaderButton() {
  const { openConsole, unreadCount } = useConsoleModalContext();
  const accessibilityLabel =
    unreadCount === 0
      ? 'Open console'
      : `Open console, ${unreadCount} unread ${
          unreadCount === 1 ? 'log' : 'logs'
        }`;

  return (
    <Touchable
      testID="open-console-button"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.5}
      onPress={openConsole}
      style={styles.headerButton}>
      <TerminalIcon size={22} />
      {unreadCount > 0 && (
        <View pointerEvents="none" style={styles.headerUnreadBadge}>
          <Text style={styles.headerUnreadText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Touchable>
  );
}

function useConsoleModalContext() {
  const value = use(ConsoleModalContext);
  if (value === null) {
    throw new Error(
      'ConsoleHeaderButton must be rendered inside ConsoleModalProvider.'
    );
  }
  return value;
}

type ConsoleModalProps = {
  entries: ConsoleLogEntry[];
  visible: boolean;
  onClose: () => void;
};

function ConsoleModal({ entries, visible, onClose }: ConsoleModalProps) {
  const newestEntries = useMemo(() => [...entries].reverse(), [entries]);

  return (
    <Modal
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      visible={visible}
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.modalRoot}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ConsoleModalContent
            entries={newestEntries}
            visible={visible}
            onClose={onClose}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

function ConsoleModalContent({ entries, visible, onClose }: ConsoleModalProps) {
  const { bottom } = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [translateY, visible]);

  const dismissGesture = usePanGesture({
    activeOffsetY: 8,
    failOffsetX: [-20, 20],
    onUpdate: (event) => {
      translateY.value = Math.max(0, event.translationY);
    },
    onDeactivate: (event) => {
      const shouldDismiss = event.translationY > 80 || event.velocityY > 800;
      if (shouldDismiss) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    },
    onFinalize: (event) => {
      if (event.canceled) {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.modalSafeArea, animatedStyle]}>
      <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
        <GestureDetector gesture={dismissGesture}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitle}>
              <TerminalIcon />
              <Text style={styles.title}>Console</Text>
            </View>
            <View style={styles.modalActions}>
              <Touchable
                testID="clear-console-button"
                accessibilityRole="button"
                disabled={entries.length === 0}
                activeOpacity={0.5}
                onPress={clearConsoleLogs}
                style={styles.modalAction}>
                <Text
                  style={[
                    styles.clearButtonText,
                    entries.length === 0 && styles.clearButtonTextDisabled,
                  ]}>
                  Clear
                </Text>
              </Touchable>
              <Touchable
                testID="close-console-button"
                accessibilityRole="button"
                accessibilityLabel="Close console"
                activeOpacity={0.5}
                onPress={onClose}
                style={[styles.modalAction, styles.closeButton]}>
                <CloseIcon />
              </Touchable>
            </View>
          </View>
        </GestureDetector>
        <FlatList
          style={styles.list}
          data={entries}
          keyExtractor={(entry) => entry.id.toString()}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            { paddingBottom: bottom },
            entries.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Console output will appear here.
            </Text>
          }
          renderItem={({ item }) => <ConsoleLogRow entry={item} />}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

function useReactNativeLogBoxVisibility(onSeen: () => void) {
  const [isVisible, setIsVisible] = useState(false);
  const wasVisible = useRef(false);

  useEffect(() => {
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

function TerminalIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="m7 7 10 10M17 7 7 17"
        stroke={COLORS.NAVY}
        strokeWidth={2}
        strokeLinecap="round"
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
  headerButton: {
    width: 44,
    height: 44,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUnreadBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.offWhite,
    backgroundColor: COLORS.RED,
  },
  headerUnreadText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalRoot: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.headerSeparator,
  },
  modalHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.GRAY,
    backgroundColor: COLORS.headerSeparator,
  },
  modalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
  },
  title: {
    color: COLORS.NAVY,
    fontSize: 17,
    fontWeight: '700',
  },
  modalActions: {
    height: '100%',
    flexDirection: 'row',
  },
  modalAction: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  closeButton: {
    alignItems: 'center',
    minWidth: 56,
    paddingHorizontal: 0,
  },
  clearButtonText: {
    color: COLORS.RED,
    fontSize: 14,
    fontWeight: '700',
  },
  clearButtonTextDisabled: {
    color: COLORS.GRAY,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
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
