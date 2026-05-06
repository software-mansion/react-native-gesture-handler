---
name: argent-test-ui-flow
description: Autonomously test an iOS app UI by running interact-screenshot-verify loops using argent simulator tools. Use when testing a UI flow, verifying login works, testing navigation, or running an end-to-end UI test scenario.
---

## 1. Workflow

All interactions go through argent MCP tools. Ensure the simulator is booted before starting.

1. **Baseline screenshot**: Call `screenshot` to see the current UI state.
2. **Find target**: Before tapping, use a discovery tool to get element coordinates:
   - **React Native apps**: use `debugger-component-tree` — it returns component names with (tap: x,y) coordinates. This is the preferred tool for RN apps. To use it, resolve the `argent-react-native-app-workflow` skill for setup.
   - **Standard iOS app screens and in-app modals**: use `describe` — it returns the accessibility element tree with normalized frame coordinates.
   - **Permission prompts / system modal overlays**: still try `describe` first. Fall back to `screenshot` only if the overlay is not exposed reliably.
   - **Fallback**: use `screenshot` to estimate where the desired component is, then verify immediately after the action.
3. **Interact**: Perform the action (`gesture-tap`, `gesture-swipe`, `paste`, etc.) — you receive a screenshot automatically.
4. **Verify**: Check the returned screenshot for expected results. If it shows a loading/transitional state, retake with `screenshot`.
5. **Repeat** for each step in the flow.

## 2. Template

```
Goal: Test [feature name]

Steps:
1. screenshot → see current state (baseline)
2. [Navigate / tap / type to reach starting point] → verify auto-screenshot
3. [Perform the action to test] → verify auto-screenshot
4. Report: pass / fail with details
```

## 3. Examples

### Login flow

```
1. screenshot → see login screen
2. gesture-tap { x: 0.5, y: 0.4 }  → tap email field
3. paste { text: "user@example.com" }
4. gesture-tap { x: 0.5, y: 0.55 } → tap password field
5. paste { text: "password123" }
6. gesture-tap { x: 0.5, y: 0.7 }  → tap Login button
7. screenshot → verify home screen appeared
```

### Scroll and navigation

```
1. screenshot → see list at top
2. gesture-swipe { fromY: 0.7, toY: 0.3 } → scroll down
3. gesture-tap item at visible position → verify auto-screenshot
4. screenshot → verify detail view opened
5. button { button: "back" }
6. screenshot → verify returned to list
```

---

## 4. Recovery Pattern

- If screenshot shows loading/transition: wait 500ms, retake with `screenshot`.
- If tap misses target: re-run discovery tool (`describe` / `debugger-component-tree`), retry once with new coordinates.
- If a permission dialog or modal is visible: re-run `describe` first. Stay in screenshot-driven navigation only when the overlay is not exposed reliably, then switch back to `describe` / `debugger-component-tree` as soon as it is dismissed.
- If tap fails twice at same coordinates: stop, re-discover, report if element not found.
- If a **saved flow** fails during `flow-execute` replay (as opposed to live test steps above): follow `argent-create-flow` skill §10 for structured diagnosis and correction.

## Tips

- **Use `paste` for text entry** — faster and more reliable than key-by-key `keyboard`.
- **Use `gesture-custom` for long-press** context menus (800ms hold).
- **Report clearly**: state what you expected, what you saw, and the verdict.
- **Coordinate estimation**: center = 0.5, 0.5; top-third ~ 0.2; bottom-third ~ 0.8.
- **Permission modals**: try `describe` first. Use `screenshot` only as fallback, tap one visible button at a time, and verify with the returned screenshot before continuing.
- **Record for replay**: If a tested flow is likely to be repeated, use the `argent-create-flow` skill to record it as a `.yaml` script. This lets you replay the entire sequence later with a single `flow-execute` call instead of re-running each step manually.

## Related Skills

| Skill                              | When to use                                      |
| ---------------------------------- | ------------------------------------------------ |
| `argent-simulator-interact`        | Detailed tool usage for tapping, swiping, typing |
| `argent-simulator-setup`           | Booting and connecting a simulator               |
| `argent-react-native-app-workflow` | Starting the app, Metro, build issues            |
| `argent-metro-debugger`            | Breakpoints, console logs, JS evaluation         |
| `argent-create-flow`               | Record a test sequence as a replayable flow      |
