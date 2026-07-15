export const MAX_CONSOLE_LOGS = 50;

export type ConsoleLogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';

export type ConsoleLogEntry = {
  id: number;
  level: ConsoleLogLevel;
  message: string;
  timestamp: number;
};

type ConsoleMethod = (...args: unknown[]) => void;
type Listener = () => void;

type ConsoleLogStore = {
  entries: ConsoleLogEntry[];
  installed: boolean;
  listeners: Set<Listener>;
  nextId: number;
  notificationScheduled: boolean;
};

type GlobalWithConsoleLogStore = typeof globalThis & {
  __RNGH_CONSOLE_LOG_STORE__?: ConsoleLogStore;
};

const runtimeGlobal = globalThis as GlobalWithConsoleLogStore;
const store = runtimeGlobal.__RNGH_CONSOLE_LOG_STORE__ ?? {
  entries: [],
  installed: false,
  listeners: new Set<Listener>(),
  nextId: 0,
  notificationScheduled: false,
};

runtimeGlobal.__RNGH_CONSOLE_LOG_STORE__ = store;

const CONSOLE_LEVELS: ConsoleLogLevel[] = [
  'debug',
  'log',
  'info',
  'warn',
  'error',
];

const MAX_MESSAGE_LENGTH = 2000;

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Error) {
    return value.stack ?? `${value.name}: ${value.message}`;
  }
  if (typeof value === 'symbol' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  try {
    const seen = new WeakSet<object>();
    const serialized = JSON.stringify(value, (_key, nestedValue: unknown) => {
      if (typeof nestedValue === 'bigint' || typeof nestedValue === 'symbol') {
        return nestedValue.toString();
      }
      if (typeof nestedValue === 'function') {
        return `[Function ${nestedValue.name || 'anonymous'}]`;
      }
      if (nestedValue instanceof Error) {
        return {
          name: nestedValue.name,
          message: nestedValue.message,
          stack: nestedValue.stack,
        };
      }
      if (typeof nestedValue === 'object' && nestedValue !== null) {
        if (seen.has(nestedValue)) {
          return '[Circular]';
        }
        seen.add(nestedValue);
      }
      return nestedValue;
    });

    return serialized ?? String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function formatArguments(args: unknown[]) {
  const message = args.map(formatValue).join(' ');
  if (message.length <= MAX_MESSAGE_LENGTH) {
    return message;
  }
  return `${message.slice(0, MAX_MESSAGE_LENGTH)}...`;
}

function appendConsoleLog(level: ConsoleLogLevel, args: unknown[]) {
  const entry: ConsoleLogEntry = {
    id: store.nextId++,
    level,
    message: formatArguments(args),
    timestamp: Date.now(),
  };

  store.entries = [...store.entries, entry].slice(-MAX_CONSOLE_LOGS);
  notifyListeners();
}

function notifyListeners() {
  if (store.notificationScheduled || store.listeners.size === 0) {
    return;
  }

  store.notificationScheduled = true;
  queueMicrotask(() => {
    store.notificationScheduled = false;
    store.listeners.forEach((listener) => listener());
  });
}

export function installConsoleInterceptor() {
  if (store.installed) {
    return;
  }

  store.installed = true;
  const mutableConsole = console as Console &
    Record<ConsoleLogLevel, ConsoleMethod>;

  CONSOLE_LEVELS.forEach((level) => {
    const originalMethod = mutableConsole[level].bind(console) as ConsoleMethod;
    mutableConsole[level] = (...args: unknown[]) => {
      originalMethod(...args);
      appendConsoleLog(level, args);
    };
  });
}

export function clearConsoleLogs() {
  if (store.entries.length === 0) {
    return;
  }
  store.entries = [];
  notifyListeners();
}

export function subscribeToConsoleLogs(listener: Listener) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

export function getConsoleLogsSnapshot() {
  return store.entries;
}
