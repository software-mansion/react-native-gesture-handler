import { ConfigDiff } from './types';

function isDifferent(item1: unknown, item2: unknown): boolean {
  // HitSlop?
  if (typeof item1 !== typeof item2) {
    return true;
  }

  if (Array.isArray(item1)) {
    return item1.every((element, index) => element === (item2 as [])[index]);
  }

  return item1 !== item2;
}

export function getNewDiffValues<TConfig extends Record<string, unknown>>(
  prev: TConfig | null,
  current: TConfig
): ConfigDiff {
  const diff: ConfigDiff = {
    added: {},
    updated: {},
    removed: {},
  };

  if (!prev) {
    diff.added = current;
    return diff;
  }

  for (const key in current) {
    if (!(key in prev)) {
      diff.added[key] = current[key];
    }
  }

  for (const key in prev) {
    if (!(key in current)) {
      diff.removed[key] = prev[key];
      continue;
    }

    if (isDifferent(prev[key], current[key])) {
      diff.updated[key] = current[key];
    }
  }

  return diff;
}
