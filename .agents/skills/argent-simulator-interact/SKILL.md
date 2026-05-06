---
name: argent-simulator-interact
description: Interact with an iOS simulator using argent MCP tools. Use when tapping UI elements, perfroming gestures, scrolling, typing text, pressing hardware buttons, launching apps, opening URLs, taking screenshots.
---

## 1. Before You Start

If you delegate simulator tasks to sub-agents, make sure they have MCP permissions.

Use `list-simulators` to find available simulators. **Pick the first result** if specific not specified by user — booted iPhones are listed first. If none are booted, use `boot-simulator` first.

**Load tool schemas before first use.** Gesture tools (`gesture-tap`, `gesture-swipe`, `gesture-pinch`, `gesture-rotate`, `gesture-custom`) may be deferred — their parameter schemas are not loaded until fetched. Always use ToolSearch to load the schemas of all gesture tools you plan to use **before** calling any of them. If you skip this step, parameters may be coerced to strings instead of numbers, causing validation errors.

## 2. Best Practices

1. **Always refer to tapping_rule** from your argent.md rule before tapping.
2. Before performing interactions, consider whether they can be **dispatched sequentially** - more on that in `run-sequence`.
3. **Use `gesture-swipe` for lists/scrolling**, not `gesture-custom`, unless you need non-linear movement. Consider whether you need multiple swipes, if yes - use `run-sequence`.
4. **Tap a text field before typing** — try `paste` first, fall back to `keyboard`.
5. **Coordinates are normalized** — always 0.0–1.0, not pixels.
6. **For native iOS app navigation, prefer `describe` first.** It works on any screen without app restart. Do not navigate from screenshots on regular in-app screens unless `describe` failed to expose a reliable target. Use `native-describe-screen` only when you need app-scoped UIKit properties.

## 3. Opening Apps

**Never navigate to an app by tapping home-screen icons.** Use `launch-app` or `open-url` — they are instant and reliable.

### launch-app — by bundle ID

```json
{ "udid": "<UDID>", "bundleId": "com.apple.MobileSMS" }
```

Common IDs: `com.apple.MobileSMS` (Messages), `com.apple.mobilesafari` (Safari), `com.apple.Preferences` (Settings), `com.apple.Maps`, `com.apple.Photos`, `com.apple.mobilemail`, `com.apple.mobilenotes`, `com.apple.MobileAddressBook` (Contacts)

### open-url — by URL scheme

```json
{ "udid": "<UDID>", "url": "messages://" }
```

Common schemes: `messages://`, `settings://`, `maps://?q=<query>`, `tel://<number>`, `mailto:<address>`, `https://...` (Safari)

## 4. Choosing the Right Tool

| Action           | Tool             | Notes                                                     |
| ---------------- | ---------------- | --------------------------------------------------------- |
| Multiple actions | `run-sequence`   | Batch steps in one call (no intermediate screenshots)     |
| Open an app      | `launch-app`     | **Always — never tap home-screen icons**                  |
| Restart an app   | `restart-app`    | Terminate and relaunch by bundle ID                       |
| Open URL/scheme  | `open-url`       | Web pages, deep links, URL schemes                        |
| Single tap       | `gesture-tap`    | Buttons, links, checkboxes                                |
| Scroll/swipe     | `gesture-swipe`  | Straight-line scroll or swipe                             |
| Long press       | `gesture-custom` | Context menus, drag start                                 |
| Drag & drop      | `gesture-custom` | Complex drag interactions                                 |
| Pinch/zoom       | `gesture-pinch`  | Two-finger pinch with auto-interpolation                  |
| Rotation         | `gesture-rotate` | Two-finger rotation with auto-interpolation               |
| Custom gesture   | `gesture-custom` | Arbitrary touch sequences, optional interpolation         |
| Hardware key     | `button`         | Home, back, power, volume, appSwitch, actionButton        |
| Type text (fast) | `paste`          | Form fields — uses clipboard                              |
| Type text        | `keyboard`       | Fallback when paste fails; supports Enter, Escape, arrows |
| Rotate device    | `rotate`         | Orientation changes                                       |

## 5. Finding Tap Targets

IMPORTANT. When moved to a different screen after an action or do not know the coordinates of component, **always** perform proper discovery first.

| App type                          | Discovery tool            | What it returns                                                                                                                                                                          |
| --------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target app discovery              | `describe`                | Accessibility element tree for the current simulator screen with normalized frame coordinates. Works on any app, system dialogs, and Home screen — no app restart or `bundleId` required |
| React Native                      | `debugger-component-tree` | React component tree with names, text, testID, and (tap: x,y)                                                                                                                            |
| App-scoped native                 | `native-describe-screen`  | Low-level app-scoped accessibility elements with normalized and raw coordinates; requires `bundleId`                                                                                     |
| Permission / system modal overlay | `describe`                | `describe` detects system dialogs automatically and returns dialog buttons with tap coordinates. Fall back to `screenshot` only if `describe` does not expose the controls               |
| Final visual fallback             | `screenshot`              | Use only when discovery tools cannot inspect the current UI reliably. Do not derive routine in-app navigation targets from screenshots                                                   |

Point follow-up native diagnostics after you already have a candidate point:

- `native-user-interactable-view-at-point`: deepest native view that would receive touch at a known raw iOS point; requires `bundleId`
- `native-view-at-point`: deepest visible native view at a known raw iOS point; requires `bundleId`

### If `describe` Fails

Read the exact error and choose the action that matches it:

- Error mentions `ax-service` not available or daemon startup failure:
  the ax-service daemon could not start. Check that the simulator is booted. Use `screenshot` as a temporary fallback, or use `native-describe-screen` with an explicit `bundleId` if the app has native devtools injected.
- `describe` returns an empty element list:
  the screen may be blank, loading, or showing content without accessibility labels. Use `screenshot` to see what is visible, then retry after the content has loaded.
- `describe` succeeds but is not detailed enough for a React Native app:
  use `debugger-component-tree` next.
- You need app-scoped inspection with full UIKit properties (`accessibilityIdentifier`, `viewClassName`):
  use `native-describe-screen` with an explicit `bundleId`. This requires native devtools (dylib) injection — call `restart-app` first if needed.
- You already have a candidate point and want to confirm what would actually receive touch:
  use `native-user-interactable-view-at-point`. Use `native-view-at-point` when you want the visually deepest view instead of the hit-test target.

## 6. Tool Usage

### gesture-tap — Single tap at a point

```json
{ "udid": "<UDID>", "x": 0.5, "y": 0.5 }
```

Coordinates: `0.0` = left/top, `1.0` = right/bottom.

Before tapping near the bottom of the screen in React Native apps, check that "Open Debugger to View Warnings" banners are not visible — tapping them breaks the debugger connection. Close them with the X icon if present.

### gesture-swipe — Straight-line gesture

```json
{ "udid": "<UDID>", "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 }
```

Swipe **up** (`fromY > toY`) = scroll content **down**. Default duration: 300ms. Optional: `"durationMs": 500` for slower swipe.

### gesture-pinch — Two-finger pinch

```json
{ "udid": "<UDID>", "centerX": 0.5, "centerY": 0.5, "startDistance": 0.2, "endDistance": 0.6 }
```

All values are normalized 0.0–1.0 (fractions of screen, not pixels) — same as all other gesture tools. `startDistance: 0.2` means fingers start 20% of the screen apart; `endDistance: 0.6` means they end 60% apart. `startDistance < endDistance` = pinch out (zoom in). `startDistance > endDistance` = pinch in (zoom out). Defaults: `angle: 0` (horizontal), `durationMs: 300`. Optional: `"angle": 90` for vertical axis, `"durationMs": 500` for slower pinch.

### gesture-rotate — Two-finger rotation

```json
{
  "udid": "<UDID>",
  "centerX": 0.5,
  "centerY": 0.5,
  "radius": 0.15,
  "startAngle": 0,
  "endAngle": 90
}
```

All positions and radius are normalized 0.0–1.0 (fractions of screen, not pixels). `radius: 0.15` means each finger is 15% of the screen away from center. `endAngle > startAngle` = clockwise. Default duration: 300ms. Optional: `"durationMs": 500` for slower rotation.

### gesture-custom — Custom touch sequence

For long-press, drag-and-drop, and other complex sequences, see `references/gesture-examples.md`. Set `"interpolate": 10` to auto-generate smooth intermediate Move events between keyframes.

### button — Hardware button press

```json
{ "udid": "<UDID>", "button": "home" }
```

Values: `home`, `back`, `power`, `volumeUp`, `volumeDown`, `appSwitch`, `actionButton`

### paste — Type text into focused field

```json
{ "udid": "<UDID>", "text": "Hello, world!" }
```

Tap the field first, then paste. Fall back to `keyboard` if it doesn't work.

### keyboard — Type text or press special keys

```json
{ "udid": "<UDID>", "text": "search query", "key": "enter" }
```

Special keys: `enter`, `escape`, `backspace`, `tab`, `space`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `f1`–`f12`. Optional: `"delayMs": 100` between keystrokes (default 50ms).

### rotate — Change orientation

```json
{ "udid": "<UDID>", "orientation": "LandscapeLeft" }
```

Values: `Portrait`, `LandscapeLeft`, `LandscapeRight`, `PortraitUpsideDown`

---

## 7. Screenshots

Use the explicit `screenshot` tool only when:

- You need the initial screen state before any action.
- The auto-attached screenshot shows a transitional or loading frame.
- You require extra context.
- You want to check state after a delay (e.g. waiting for a network response).
- A permission dialog, system alert, or native modal overlay is visible and `describe` did not expose reliable targets.

When using `screenshot` for permission or native modal navigation:

- Do not switch to screenshot-driven navigation just because a modal is visible. On regular app screens and in-app modals, keep using `describe`.
- Prefer obvious, centered alert buttons such as `Allow`, `OK`, `Don't Allow`, `Not Now`, or `Continue`.
- Tap one control at a time and inspect the returned auto-screenshot before doing anything else.
- After the modal is dismissed, return to normal discovery with `describe`, `native-describe-screen`, or `debugger-component-tree`.

Optional rotation parameter: `{ "udid": "<UDID>", "rotation": "LandscapeLeft" }` — rotates the capture without changing simulator orientation.

Screenshots are downscaled by default (30% of original resolution) to reduce context size. `scale` accepts values from 0.01 to 1.0. If UI elements are hard to read or you need to inspect fine detail, pass `scale: 1.0` to get full resolution: `{ "udid": "<UDID>", "scale": 1.0 }`.

### Troubleshooting

| Problem              | Solution                                                      |
| -------------------- | ------------------------------------------------------------- |
| Screenshot times out | Restart the simulator-server via `stop-simulator-server` tool |
| No booted simulator  | Run `boot-simulator` first.                                   |

---

## 8. Action Sequencing with `run-sequence`

Use `run-sequence` to batch multiple interaction steps into **a single tool call**. Only one screenshot is returned — after all steps complete. Use cases:
scrolling multiple times, typing and submitting automatically, known sequence of multiple taps, rotating device back and forth.

Do **not** use `run-sequence` when any step depends on observing the result of a previous step

### Use cases

Use the sequencing when:

- Knowing that some action needs multiple steps without necessarily immediate insight of screenshot
- "scroll to bottom", "scroll to top", "scroll to do X" -> sequence scroll 3-5 times
- form interactions, "clear and retype field" -> you may use triple-tap to select all, type new value
- "submit form" → fill all fields in sequence, tap submit
- "go back to X" → defined tap sequence for the navigation

### Allowed tools inside `run-sequence`

`gesture-tap`, `gesture-swipe`, `gesture-custom`, `gesture-pinch`, `gesture-rotate`, `button`, `keyboard`, `rotate`

The `udid` is shared — do **not** include it in each step's `args`. Optional `delayMs` per step (default 100ms).

### Examples

Scroll down three times:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } },
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } },
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } }
  ]
}
```

Type into a focused field and submit:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "keyboard", "args": { "text": "hello world" } },
    { "tool": "keyboard", "args": { "key": "enter" } }
  ]
}
```

Tap a known button, then scroll down:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "gesture-tap", "args": { "x": 0.5, "y": 0.15 } },
    {
      "tool": "gesture-swipe",
      "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 },
      "delayMs": 300
    }
  ]
}
```

Stops on the first error and returns partial results.
