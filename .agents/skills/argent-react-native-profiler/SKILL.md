---
name: argent-react-native-profiler
description: Profile a React Native Hermes app to measure re-render and CPU performance using argent profiler tools. Use when optimizing for performance, measuring before/after a fix, spotting slow components, diagnosing re-renders, checking CPU hotspots, or producing a ranked issue report.
---

This skill is complementary to `argent-react-native-optimization`, not a replacement for it.

## 2. Tool Overview

### React Profiler (Hermes / React commits)

| Tool                              | Purpose                                                                                                                                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-profiler-start`            | Start CPU sampling + inject React commit-capture hook. Optional: `sample_interval_us` (default 100).                                                                                                                                                              |
| `react-profiler-stop`             | Stop recording; stores cpuProfile + commitTree in session.                                                                                                                                                                                                        |
| `react-profiler-status`           | **Call if you were interrupted in the middle of the flow, never in another scenario** (debugger drop, Metro reload, pause, subagent handoff, any doubt). Returns `session_status: "active" \| "taken_over" \| "stopped" \| "no_react_runtime"`. Side-effect free. |
| `react-profiler-analyze`          | Run pipeline -> report with CPU-enriched hot commits, sorted by `totalRenderMs` DESC. Saves raw data to disk.                                                                                                                                                     |
| `react-profiler-component-source` | AST lookup: file, line, memoization status, 50 lines of source for a component.                                                                                                                                                                                   |
| `react-profiler-renders`          | Live fiber walk: render counts + durations per component (no profiling session required).                                                                                                                                                                         |
| `react-profiler-fiber-tree`       | Live fiber walk: full component hierarchy as JSON.                                                                                                                                                                                                                |

### Drill-Down Query Tools (call after analyze)

| Tool                       | Purpose                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `profiler-cpu-query`       | Targeted CPU investigation: top functions, time-windowed CPU, call trees, per-component CPU. |
| `profiler-commit-query`    | Targeted commit investigation: by component, time range, commit index, or cascade tree.      |
| `profiler-stack-query`     | iOS Instruments drill-down: hang stacks, function callers, thread breakdown, leak details.   |
| `profiler-combined-report` | Cross-correlated report when both React Profiler and iOS Instruments ran in parallel.        |
| `profiler-load`            | List and reload previous profiling sessions from disk for re-investigation with query tools. |

For native iOS profiling (CPU hotspots, UI hangs, memory leaks), see the `argent-ios-profiler` skill.

---

## 3. Agent Behavior Guidelines

Follow these rules throughout the profiling workflow:

- Start `react-profiler-start` and `ios-profiler-start` in parallel (two tool calls in one message). Both need `device_id`; use the same UDID for both so their data can be correlated later. This gives best coverage.
- If the user only wants iOS-only, use the `argent-ios-profiler` skill workflow. Only skip `ios-profiler-start` if the user has **already explicitly said** they don't want native profiling in this session

### After analysis: ask about next steps

After presenting the analysis report, always ask the user what they want to do next. Present these options:

1. **Investigate further** — drill down into specific findings using query tools (CPU call trees, commit cascades, hang stacks, etc.) to identify root causes with confidence before making changes.
2. **Implement fixes** — apply changes based on the current findings, then re-profile to measure whether the metric changed (improved, regressed, or stayed flat).
3. **Done for now** — accept the report as-is.

Do NOT silently move on after the report. The report is the starting point, not the end — query tools exist specifically to let you dig deeper into anything the report flags.

### During investigation: use query tools proactively

When drilling down, chain query tool calls based on what you find:

- A hot commit -> `profiler-commit-query` mode=`by_index` to see all components -> `profiler-cpu-query` mode=`component_cpu` for the slowest one -> `profiler-cpu-query` mode=`call_tree` for the hot function -> read the source file -> propose a fix.
- A memory leak -> `profiler-stack-query` mode=`leak_stacks` to identify the responsible module -> read the native source if actionable.
- An iOS hang -> `profiler-stack-query` mode=`hang_stacks` to get the native call chain -> correlate with React commit timing.

### After fixes: always re-profile

When you apply a fix, always re-profile the same scenario afterward. Compare before/after metrics (commit durations, CPU time, render counts) and report honestly: did the target metric improve, stay flat, or regress? Did any _other_ metric get worse? If you need to reference the original data, use `profiler-load` to reload the pre-fix session. If the fix showed no improvement or introduced a regression, say so explicitly and reconsider the approach.

### Use flows for reproducible profiling

When profiling requires a specific interaction sequence (scroll a list, navigate screens, trigger an animation), **record the interaction as a flow** using the `argent-create-flow` skill before the first profiling run. Then replay the same flow for every subsequent run. This eliminates interaction variance as a confounder and makes before/after comparisons meaningful. Especially important when:

- You are about to re-profile after applying a fix (Step 8).
- The user asks you to compare multiple profiling sessions.
- The interaction path is more than 2-3 steps long.

---

## 4. Standard Profiling Workflow

**Complete all steps in order — do not break mid-flow.**

### Step 1: Start profiling

Mind the react-native and ios-native profiler selection mentioned above when starting the session and start the tools. **Save `startedAtEpochMs` from the response** — you will need it for annotation offsets. Every subsequent profiler/query call in this session must use the same `device_id`. Before beginning, define lightweight success criteria with the user: which metric matters most (e.g., `totalRenderMs`, specific commit duration, render count for a component) and what threshold would be meaningful. This anchors later evaluation. On success:

- if user asked you to perform the profiling, determine how to profile yourself using tools described in `argent-simulator-interact` skill.
- if the user stated they wish to perform the interaction themselves — suggest what interaction to perform (e.g. "scroll the list", "switch tabs") and wait for their reply.
  If you received information about **existing profiling session** being owned by another agent:
- if session is marked as "stale", you may overtake it without prompting the user for allowance
- if session is NOT "stale" - before taking action and terminating the other session, **stop and ask user what you should do**, explaining the situation.

#### Annotate every interaction

After each `gesture-tap` or `gesture-swipe` call, record an annotation using the returned `timestampMs`. Compute `offsetMs = timestampMs - startedAtEpochMs`. Do this for _every_ interaction — including back-navigation swipes, not just the primary action. Pass all collected annotations to `react-profiler-analyze` in Step 3.

### Step 2: Stop and collect

Call `react-profiler-stop` **and** `ios-profiler-stop` in parallel. Only skip `ios-profiler-stop` if you did not start it in Step 1. Note `duration_ms` and `fiber_renders_captured`.
If `fiber_renders_captured: 0`, warn the user — React commit data may be missing.

### Step 3: Analyze

Call `react-profiler-analyze` with `port`, `device_id`, `project_root`, `platform`, and `rn_version`. The report includes metadata such as `reactCompilerEnabled`, `strictModeEnabled`, and `buildMode` — check these in the returned markdown report.

If you performed interactions using `gesture-tap`/`gesture-swipe`, pass `annotations` to mark when each action occurred. Each annotation's `offsetMs` must be computed as `tapTimestampMs - startedAtEpochMs`, where `tapTimestampMs` is the `timestampMs` returned by the gesture-tap/gesture-swipe tool and `startedAtEpochMs` was returned by `react-profiler-start`. Do **not** use `Date.now()` for this calculation — only server-side timestamps from the tool return values.

If dual profiling, also call `ios-profiler-analyze`, then **you must** call `profiler-combined-report` for the cross-correlated view — do not skip this step when both profilers ran; the combined report surfaces correlations that individual reports miss.

The analyze report includes **CPU hotspots per commit** — showing exactly which JS functions ran during each slow React commit. Raw data is saved to disk automatically for later reload.

### Step 4: Assess results

Analyze whether the results give you a proper image of what is wrong with the application - **do not assume improvement always exists**, verify results logically with reference to how react-native works. Make sure to give honest feedback and be ready to change the approach if needed.

### Step 5: Present findings and ask about next steps

Present a concise summary of the key findings - present whether possibilities for improvement exist and how performing further actions could affect performance. Then follow the "After analysis" guideline — ask whether to investigate further, implement fixes (if available), or stop.

### Step 6: Drill-down investigation (iterative)

Based on findings from the report, use query tools to investigate deeper:

- **Slow component?** -> `profiler-cpu-query` mode=`component_cpu` component_name=`AppNavigator` — shows what JS functions ran during that component's commits.
- **Want to see the call tree?** -> `profiler-cpu-query` mode=`call_tree` function_name=`expensiveFunction` — shows callers and callees.
- **What happened during a time window?** -> `profiler-commit-query` mode=`by_time_range` — lists all commits in a range.
- **Full commit detail?** -> `profiler-commit-query` mode=`by_index` commit_index=38 — all components, props changes, parent cascade.
- **Who triggered whom?** -> `profiler-commit-query` mode=`cascade_tree` — visual parent-child cascade.
- **iOS hang details?** -> `profiler-stack-query` mode=`hang_stacks` — native call stacks during a hang.

Repeat as needed until you identify the root cause function and file, referring to step 4 for honest evaluation. After each round of investigation, ask the user if they want to continue digging or move to fixing.

### Step 7: Reload a previous session

If you profiled multiple scenarios and need to revisit earlier data:

1. Call `profiler-load` mode=`list` to see all saved sessions with timestamps (the list now also shows Runtime / Device / Metro bundle columns to help identify the right session).
2. Call `profiler-load` mode=`load_react` session_id=`<timestamp>` device_id=`<UDID>` to reload React data. `device_id` scopes the reload into the `port:device_id` cache slot.
3. Call `profiler-load` mode=`load_instruments` session_id=`<timestamp>` device_id=`<UDID>` to reload iOS data.
4. Query tools now operate on the reloaded session data — **pass the same `device_id` you loaded with**, otherwise they will miss the cache.

This is useful for before/after comparisons: profile, fix, re-profile, then reload the original session to compare metrics side by side.

### Step 8: Apply fix and re-profile

If fix is present, read the source code of the identified bottleneck using `react-profiler-component-source` or the Read tool. Apply the fix, then re-profile (Step 1 -> user interaction -> Step 2 -> Step 3 -> Step 4). Report whether the target metric improved, stayed flat, or regressed. Also check whether the fix introduced regressions in other metrics (e.g., render count dropped but CPU time increased, or a different component now re-renders more). If the fix showed no net benefit or unacceptable tradeoffs, revert and reconsider.

**Tip:** If the interaction sequence was recorded as a flow (see "Use flows for reproducible profiling" above), replay it with `flow-execute` instead of manually repeating the steps. This guarantees identical interaction conditions for the comparison. If the flow fails during replay (e.g., a UI fix changed the layout), follow `argent-create-flow` skill §10 (Flow Self-Improvement) to diagnose and repair the flow before retrying the profiling cycle.

If the user stated that they do not wish for changes, present the profiling report and skip the fix but suggest it to the user.

**React Compiler rule:** If the analyze report indicates React Compiler is enabled, do NOT propose `useCallback`/`useMemo`/`React.memo` unless you confirmed compiler bail-out (check `react-profiler-fiber-tree` for absent `useMemoCache` on that component).

---

## 5. Important Caveats

- **Dev mode inflation**: `buildMode: "dev"` renders are ~3x slower than production. Prioritize high `normalizedRenderCount` — it scales to prod.
- **Re-run after fixes**: Always re-profile after changes. Report honestly whether the metric improved, regressed, or stayed flat — do not assume improvement.
- **`excluded` is informational**: Components in `animatedSubtrees` and `recyclerChildren` re-render by design.
- **Strict Mode**: Double-invokes renders. The pipeline halves `normalizedRenderCount` automatically when detected.
- **Debugger connection**: If interrupted, started profiling also closes. Before attempting recovery, call `react-profiler-status` — it tells you whether the session is `active`, `taken_over`, `stopped`, or `no_react_runtime`, so you can decide whether to stop, restart, or reconnect first.
- **Confounders to watch for**:
  - Live API data may differ between runs (different payload sizes, content counts), which shifts render counts and durations independently of your fix. Note when data-dependent components show variance.
  - Profiler overhead inflates CPU measurements. If iOS Instruments shows `JSLexer`, `JSONEmitter`, or Hermes internals dominating the JS thread, that reflects profiler instrumentation cost — not app work. Discount those entries.
  - Runs are not perfectly reproducible. Small variations (under ~10-15%) in commit duration may be noise; only treat consistent, directional changes as signal.

For standalone diagnostic tools (live render stats, fiber tree, CPU summary), see `references/diagnostic-tools.md`.
