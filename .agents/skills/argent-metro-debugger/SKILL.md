---
name: argent-metro-debugger
description: Debug a React Native app via Metro CDP using argent debugger tools. Use when connecting to Metro, inspecting React components, reading console logs, or evaluating JavaScript in the app runtime.
---

## 1. Prerequisites

The debugger requires **Metro dev server running** (default `localhost:8081`) and **a React Native app connected to Metro** (at least one CDP target). Verify via `debugger-status`.

## 2. Tool Overview

All tools accept `port` (default 8081) AND `device_id` (the iOS Simulator UDID, a.k.a. `logicalDeviceId`). Always make sure you target the correct app on the correct device.

One Metro port can serve multiple connected devices (e.g. two simulators on `localhost:8081`). `device_id` pins every debugger/network/profiler call to a specific device so sessions do not collide.

### Connect & diagnostics

| Tool               | Purpose                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debugger-connect` | Connect to Metro CDP. Returns port, projectRoot, deviceName, appName, `logicalDeviceId`, isNewDebugger, connected. The returned `logicalDeviceId` is the `device_id` for every subsequent debugger/network/profiler call. |
| `debugger-status`  | Like connect + loadedScripts, enabledDomains, sourceMapReady. **Use to diagnose.**                                                                                                                                        |

### Reload & recovery

| Tool                    | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `debugger-reload-metro` | Reload all connected apps (like pressing "r" in Metro terminal). Needs a CDP target.     |
| `restart-app`           | Terminate and relaunch the app by UDID and bundleId. Use when app lost Metro connection. |

### Inspection & console

| Tool                       | Purpose                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debugger-component-tree`  | Full React fiber tree (names, depth, bounding rects, tap coordinates).                                                                                                    |
| `debugger-inspect-element` | Inspect at (x, y) using **logical pixel coordinates** (not normalized 0-1): component hierarchy with source file:line and code fragment. See `references/source-maps.md`. |
| `debugger-log-registry`    | Get log summary (counts, clusters, file path). Then use `Grep`/`Read` on the flat log file for details.                                                                   |
| `debugger-evaluate`        | Run a JS expression in the app runtime.                                                                                                                                   |

---

## 3. Component Inspection

### `debugger-component-tree` vs `debugger-inspect-element`

|          | `debugger-component-tree`                                              | `debugger-inspect-element`                                      |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| Best for | Layout overview; finding tap targets; user-defined component hierarchy | Identifying a visible element and tracing it to its source file |
| Use when | "What's on screen and where?"                                          | "What component is this and where is it defined?"               |

Both can point to source files, but `inspect-element` is purpose-built for source tracing. `component-tree` is for orientation and tap-target discovery.

### `includeSkipped` guidance

Applies to both `debugger-component-tree` and `debugger-inspect-element`. Set to `true` only when debugging filter behavior — e.g., an expected component is missing from output, or you need to inspect a very specific branch of the tree (not just an overview).

> **Warning:** Output can be very large. Always combine with `maxNodes` (component-tree) or `maxItems` (inspect-element) and increase it incrementally (e.g., start at 50, then grow). Do not use `includeSkipped` without a limit on large apps.

---

## 4. Golden Rules

1. **`debugger-status` first when something fails** — it runs discovery, connection, and returns diagnostics.
2. **"No CDP targets" → get the app to connect to Metro** — use `restart-app` on simulator, then retry `debugger-status`.
3. **Never assume one failure is permanent** — follow recovery steps before asking the user. For starting Metro and full failure recovery, see `argent-react-native-app-workflow` and `references/failure-scenarios.md`.

---

## 5. Reading Console Logs (Log Registry)

Logs are written to a flat log file on disk. Use the **log-registry → grep** pattern instead of reading logs inline.

### Workflow

1. **Call `debugger-log-registry`** — returns: `file` (log path), `totalEntries`, `byLevel`, `clusters` (top message groups with counts and source file info)
2. **Search the file** using `Grep` or `Read` with patterns from the response.

> **Large log files:** If `totalEntries` exceeds 10 000, delegate the grep exploration to an `Explore` subagent — pass it the file path, the entry format, and the patterns you need.

### Flat log format

One entry per line — fields (whitespace-separated, `|` delimiter before message)

| Field         | Example                     | Notes                                               |
| ------------- | --------------------------- | --------------------------------------------------- |
| `[L:<id>]`    | `[L:42]`                    | Unique grep anchor                                  |
| `<timestamp>` | `2026-03-17T14:30:00.000Z`  | ISO 8601                                            |
| `<LEVEL>`     | `ERROR`, `WARN `, `LOG  `   | Uppercase, padded to 5 chars                        |
| `<source>`    | `src/api/user.ts:42` or `-` | Relative path from source map; `-` if unavailable   |
| `<message>`   | `Failed login attempt`      | Full message; embedded newlines replaced with space |

Source attribution (file + line) is also available in `clusters` returned by `debugger-log-registry`.

Log files and messages can be large - **Always scope your search**, treat the file like a database, not a document.

When reading from the log file:

- Never `Read` the log file directly. Use `grep` or shell commands with limits using the above file format tips.
- Default to `-m 50` unless you need more.
- Use `tail -N` recent entries.
- `clusters[].message` gives you the exact text which you may look for

> **If the file is too large** Delegate to an `Explore` subagent with the file path, the format spec above, and the specific patterns you need.

---

## Quick Reference

| Action                        | Tool                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| Diagnose / check connection   | `debugger-status`                                                   |
| Connect to Metro CDP          | `debugger-connect`                                                  |
| Reload JS (already connected) | `debugger-reload-metro`                                             |
| Relaunch app on simulator     | `restart-app`                                                       |
| Inspect component at point    | `debugger-inspect-element`                                          |
| Full component tree           | `debugger-component-tree`                                           |
| Console log overview          | `debugger-log-registry` (summary + log file path for `Grep`/`Read`) |
| Evaluate JS                   | `debugger-evaluate`                                                 |
