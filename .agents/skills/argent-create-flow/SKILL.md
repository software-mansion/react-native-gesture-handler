---
name: argent-create-flow
description: Record a reusable flow (scripted sequence of MCP tool calls) that can be replayed later with a single command. Use when the user asks to create, record, or build a flow, or to script a sequence of simulator actions.
---

## 1. Overview

A flow is a recorded sequence of MCP tool calls saved to a `.yaml` file in the `.argent/flows/` directory. Each step is **executed live** as you add it, so you verify it works before it becomes part of the flow. Replay a finished flow with `flow-execute`.

## 2. Tools

| Tool                     | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `flow-start-recording`   | Start recording — takes a name and executionPrerequisite, creates the file |
| `flow-add-step`          | Execute a tool call live and record it if it succeeds                      |
| `flow-add-echo`          | Add a label/comment that prints during replay                              |
| `flow-finish-recording`  | Stop recording and get a summary                                           |
| `flow-read-prerequisite` | Read a flow's execution prerequisite without running it                    |
| `flow-execute`           | Replay a saved flow by name                                                |

## 3. Workflow

### Recording

1. **Start**: Call `flow-start-recording` with a descriptive name, the absolute `project_root`, and an `executionPrerequisite` describing the required app state before running the flow (e.g. "App on home screen after a fresh reload"). `project_root` is stored for the session — you do **not** need to pass it again to subsequent tools.
2. **Build step-by-step**: For each action, call `flow-add-step` with the tool name and args. The tool runs immediately — check the result before moving on.
3. **Add labels**: Use `flow-add-echo` between steps to describe what each section does.
4. **Finish**: Call `flow-finish-recording` to stop recording. It returns the file path where the flow was saved and a summary of all steps. You can edit the `.yaml` file directly afterwards to remove, reorder, or tweak steps.

Every tool during recording returns the current flow file contents so you can track what has been recorded.

### Replaying

Call `flow-execute` with the flow name. If the flow has an execution prerequisite:

1. The tool returns a **notice** with the prerequisite text instead of running. It asks you to verify the prerequisite is met and call `flow-execute` again with `prerequisiteAcknowledged: true`.
2. You can also call `flow-read-prerequisite` beforehand to inspect the prerequisite without triggering a run.
3. Once you pass `prerequisiteAcknowledged: true`, the flow runs all steps in order and returns every tool call result (including screenshots) merged into a single response.

If the flow has no prerequisite, it runs immediately without needing acknowledgment.

## 4. flow-add-step Usage

The `command` parameter is the MCP tool name. The `args` parameter is a **JSON string** (not an object):

```
command: "launch-app"
args: "{\"udid\": \"<UDID>\", \"bundleId\": \"com.apple.Preferences\"}"
```

```
command: "gesture-tap"
args: "{\"udid\": \"<UDID>\", \"x\": 0.5, \"y\": 0.35}"
```

```
command: "screenshot"
args: "{\"udid\": \"<UDID>\"}"
```

For tools with no arguments, omit `args` entirely.

## 5. Important Rules

- **Every step runs live.** You will see the real tool result (including screenshots). Use this to verify the step worked before continuing.
- **Only successful steps are recorded.** If a tool call fails, nothing is written to the flow file — fix the issue and try again.
- **Pass `project_root` only to `flow-start-recording`.** It is stored for the session and automatically used by all subsequent flow tools. An error is returned if the path is not absolute.
- **You do NOT need to pass a flow name** to `flow-add-step`, `flow-add-echo`, or `flow-finish-recording`. The active flow is tracked automatically after `flow-start-recording`.
- **Start before adding.** Calling `flow-add-step`, `flow-add-echo`, or `flow-finish-recording` without an active recording returns an error: _"No active flow. Call flow-start-recording first."_
- **One flow at a time.** If you call `flow-start-recording` while already recording, the active flow switches to the new one. The response tells you which flow was abandoned and which is now active. The old flow's file remains on disk.
- **Mistakes can be edited out.** If a step was recorded by mistake, edit the `.yaml` file directly to remove or reorder entries.

## 6. Example Session

```
flow-start-recording  { name: "open-settings", project_root: "/Users/dev/MyApp", executionPrerequisite: "Simulator booted with app installed" }
flow-add-echo  { message: "Launch Settings app" }
flow-add-step  { command: "launch-app", args: "{\"udid\": \"ABC\", \"bundleId\": \"com.apple.Preferences\"}" }
flow-add-echo  { message: "Tap General" }
flow-add-step  { command: "gesture-tap", args: "{\"udid\": \"ABC\", \"x\": 0.5, \"y\": 0.35}" }
flow-add-echo  { message: "Tap About" }
flow-add-step  { command: "gesture-tap", args: "{\"udid\": \"ABC\", \"x\": 0.5, \"y\": 0.17}" }
flow-finish-recording  {}
```

## 7. Replay Example

```
flow-execute   { name: "open-settings", project_root: "/Users/dev/MyApp" }
→ Returns: notice with executionPrerequisite: "Simulator booted with app installed"
  "Verify the prerequisite is met and call flow-execute again with prerequisiteAcknowledged set to true."

flow-execute   { name: "open-settings", project_root: "/Users/dev/MyApp", prerequisiteAcknowledged: true }
→ Runs all steps, returns merged results with status and output for every step
```

## 8. Flow File Format

Flow files use YAML. The top-level is an object with `executionPrerequisite` (describes required state) and `steps` (array of actions):

- `- echo: <message>` — a label
- `- tool: <name>` with optional `args:` — a tool call

Example `.yaml` file:

```yaml
executionPrerequisite: Simulator booted with app installed
steps:
  - echo: Launch Settings app
  - tool: launch-app
    args:
      udid: ABC
      bundleId: com.apple.Preferences
  - echo: Tap General
  - tool: gesture-tap
    args:
      udid: ABC
      x: 0.5
      y: 0.35
  - echo: Tap About
  - tool: gesture-tap
    args:
      udid: ABC
      x: 0.5
      y: 0.17
```

## 9. When to Proactively Record a Flow

You do not need the user to ask for a flow. Record one proactively when you recognize any of these patterns:

- **About to re-profile**: You completed a profiling session and are about to apply a fix and re-profile. Record the interaction steps now so the re-profile replays them identically (see `argent-react-native-profiler` and `argent-ios-profiler` skills).
- **Repeating steps**: You have already performed a multi-step interaction sequence once and the task requires doing it again (comparison, retry, re-test).
- **Complex path discovered**: You worked through a non-trivial sequence of taps/swipes/navigation to reach a desired app state. Capture it before it is lost.
- **User says "again" / "one more time"**: Any request to redo what you just did is a signal to record first, then replay.

## 10. Flow Self-Improvement

Flows break. UI layouts change, coordinates drift, screens get added or removed. When `flow-execute` returns a failure, follow this procedure to diagnose and fix the flow instead of silently re-recording or giving up.

### 10.1 Classify the Result

After every `flow-execute`, classify the outcome before proceeding:

| Outcome                | Signal                                                                | Action             |
| ---------------------- | --------------------------------------------------------------------- | ------------------ |
| **Success**            | All steps completed, final screenshot shows expected state            | Continue with task |
| **Hard error**         | A step has `ERROR` in the result — engine stopped there               | Enter §10.2        |
| **Silent misfire**     | All steps completed but final screenshot shows wrong screen           | Enter §10.2        |
| **Partial divergence** | Intermediate screenshot shows wrong state even though later steps ran | Enter §10.2        |

For silent misfires and partial divergence, echo annotations (§10.5) are your reference for what each screen _should_ look like.

### 10.2 Diagnose

1. Note the failure step index and error message (if hard error).
2. Call `screenshot` to see where the app actually is now.
3. Call `describe` or `debugger-component-tree` to get the current element tree.
4. Compare current state to what the failed step expected. Classify the root cause:

| Root cause       | Symptoms                                                        |
| ---------------- | --------------------------------------------------------------- |
| Coordinate drift | Tap succeeded but hit wrong element; elements shifted positions |
| Missing element  | Target element not present in element tree                      |
| Wrong screen     | Screenshot shows entirely different page than expected          |
| Timing           | Element exists in tree but tap missed; loading spinner visible  |
| State mismatch   | First step fails — executionPrerequisite was not actually met   |

5. State the diagnosis in one sentence before attempting any correction.

### 10.3 Correct

Choose the lightest strategy that fits:

**Strategy 1 — Edit the YAML** (coordinate drift, parameter changes).
Read `.argent/flows/<flow-name>.yaml`, update the broken step's `x`/`y`, `bundleId`, `text`, or other args. Re-run `flow-execute` to verify.

**Strategy 2 — Manual recovery + continue** (timing/transient issues, one-off replay).
Manually execute the failed step with corrected coordinates from §10.2 discovery, then manually execute remaining steps. Does not fix the YAML — use only when re-recording is not worth it.

**Strategy 3 — Re-record from failure point** (structural changes, new intermediate screens).
Navigate the app to the state just before the failure point. Call `flow-start-recording` with the same flow name (overwrites). Re-add the working prefix steps via `flow-add-step`, then continue recording new steps from the divergence point. Call `flow-finish-recording`.

**Strategy 4 — Full re-record** (major changes, unclear diagnosis, or 3+ broken steps).
Reset the app to prerequisite state (`restart-app` + `launch-app`). Record from scratch with the same flow name.

**Decision heuristic:**

- 1 step broken, parameter-only change → Strategy 1
- 1 step broken, transient issue, not worth persisting → Strategy 2
- 2–3 steps broken or flow structure partially changed → Strategy 3
- 3+ steps broken, or unclear root cause → Strategy 4
- Flow used for profiling comparison (must be identical) → Strategy 4

### 10.4 Verify and Bound Retries

After applying a correction, re-run `flow-execute` to verify.

- If it succeeds → done. Report what changed (e.g. "Fixed step 4: updated tap coordinates from 0.5,0.35 to 0.5,0.42").
- If it fails at a **different** step → return to §10.2 for a second attempt.
- If this is already the second correction attempt → **stop**. Report the diagnosis to the user and recommend a full re-record or manual investigation.

**Hard cap: 2 correction cycles.** Do not enter an unbounded fix loop.

### 10.5 Making Flows Resilient

Apply these when recording new flows to reduce future breakage:

- **Echo expected state, not just actions.** Write `"On Settings > General screen, about to tap About"` not `"Tap About"`. During diagnosis these tell you what the screen _should_ look like.
- **Add screenshot steps after critical navigation.** Insert `screenshot` steps after screen transitions. These produce images in the flow result you can inspect during diagnosis.
- **Write specific executionPrerequisites.** `"App on home tab, user logged in, simulator UDID is <X>"` — not `"App running"`. Verify with `screenshot` + `describe` before acknowledging.
- **Prefer launch-app / open-url over navigation chains.** Deep links are more resilient to layout changes than tap sequences.
- **Echo accessibility labels for coordinate taps.** When recording a tap, add an echo with the target's label or testID: `"Tapping 'Submit' button (testID: submit-btn) at 0.5, 0.82"`. During repair, use `describe` to find the element by label and update coordinates. Only use `screenshot` for permission or system overlays when `describe` cannot expose the target reliably.
