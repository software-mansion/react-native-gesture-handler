---
name: argent-react-native-optimization
description: Optimizes a React Native app by profiling first to find real bottlenecks, then sweeping for mechanical issues. Entry-point for all performance work. Use when the app feels slow, user asks to optimize, fix re-renders, reduce jank, or improve startup. Delegates to react-native-profiler for measurement.
---

## Rules

- Do not apply shotgun optimizations. Measure first, define what "good enough" looks like (target metric + threshold), fix the top offender, re-measure honestly.
- **Quick scan** — `react-profiler-renders` for a live render count table. Identifies hot components instantly.
- **Deep measure** — load `react-native-profiler` skill. `react-profiler-start` → interact → `react-profiler-stop` → `react-profiler-analyze`.
- **Inspect** — `react-profiler-component-source` per finding. `react-profiler-fiber-tree` to trace component ancestry and render cost.
- **Verify correctness** - before fixing, recollect information from steps above and make a logical conclusion whether the approach is worth undertaking.
- **Fix** — apply one fix. Validate with `debugger-evaluate` before committing.
- **Re-measure** — report whether the target metric improved, regressed, or stayed flat. Check for regressions in other areas. If no net benefit or unacceptable tradeoffs, revert.
- **Profile for discovery, not only verification.** Use the profiler to find issues static analysis missed, not only to confirm fixes.
- **One fix per cycle for architectural changes.** Mechanical batch fixes (inline styles, index keys) can be grouped — re-profile once after the batch. When the measurement involves simulator interaction, record it as a flow (`create-flow` skill) before the first run so all subsequent cycles replay identical steps.
- **React Compiler**: if `react-profiler-analyze` reports `reactCompilerEnabled: true`, do NOT propose `useCallback`/`useMemo`/`React.memo` unless you confirmed compiler bail-out via `react-profiler-fiber-tree` (absent `useMemoCache`).
- **Sub-agents**: Phases 1–2 dispatch sub-agents — one per file for lint results, one per checklist item for semantic. Sub-agents CANNOT touch the simulator - all profiling and E2E verification must happen in the main agent.

## Pipeline

**Lint and semantic sweeps catch deterministic issues cheaply. Profiling finds runtime bottlenecks that static analysis misses. Do both.**

Copy this checklist into your TODO list:

```
Optimization Progress:
- [ ] Phase 1: Lint sweep (deterministic — catch mechanical issues without a running app)
- [ ] Phase 2: Semantic sweep (judgment — memoization, lists, animations, etc.)
- [ ] Phase 3: Baseline profile (find real bottlenecks, fix top offenders)
- [ ] Phase 4: Verify no regressions (crashes, errors, red screens)
```

### Phase 1: Lint sweep

Run ESLint once at the project root with a comprehensive RN performance ruleset. Dispatch sub-agents to fix results — one per file.
See [references/lint-rules.md](references/lint-rules.md) for ruleset and procedure.

### Phase 2: Semantic sweep

Review each area requiring judgment — memoization, list rendering, animations, async patterns, effect cleanup, state hygiene, context architecture. Dispatch one sub-agent per checklist item.
See [references/semantic-checklist.md](references/semantic-checklist.md) for full checklist.

### Phase 3: Visual profiling

1. Load `react-native-profiler` skill, start dual profiling
2. Exercise key user flows (navigate screens the user specified, or all major flows)
3. Analyze with `react-profiler-analyze` + `ios-profiler-analyze` + `profiler-combined-report`
4. Cross-reference profiling results with Phase 1–2 findings
5. Fix highest-impact issues. Re-profile after architectural changes; batch mechanical fixes. If a recorded flow breaks after a fix (e.g., UI layout changed), follow `create-flow` skill to repair the flow rather than silently discarding it.

### Phase 4: Verify no regressions

Navigate every screen and UI flow within scope, confirm each renders without errors. If no scope was specified, verify the entire app — cover all reachable screens via `simulator-interact`. Use `debugger-log-registry` to check for runtime errors and take screenshots to check for red/yellow error screens. Check for regressions introduced by fixes (e.g., fewer re-renders but higher CPU, or new jank in a different screen). Main agent only.

## App-wide optimization

1. **Phase 1**: run lint centrally (one command), dispatch sub-agents to fix per-file in parallel
2. **Phase 2**: one sub-agent per checklist item for semantic sweep
3. **Phase 3**: main agent profiles top offending screens; fixes architectural issues top-down
4. **Phase 4**: main agent navigates all screens to verify nothing crashes

After the entire run, run lint again to verify no new issues were introduced with your changes.
This also helps ensure you haven't missed any issues which could've been fixed.
