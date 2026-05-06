---
name: argent-simulator-setup
description: Set up and connect to an iOS simulator using argent MCP tools. Use when starting a new session, booting a simulator, getting a simulator UDID, or before any simulator interaction task.
---

## 1. Setup Steps

If you delegate simulator tasks to sub-agents, make sure they have MCP permissions.

1. **Find a booted simulator**
   Use `list-simulators`. Pick the first result — booted iPhones are listed first.
   If none are booted, use `boot-simulator` with the desired UDID.

2. **Verify connection**
   All interaction tools (`gesture-tap`, `gesture-swipe`, `gesture-custom`, etc.) auto-start the server if not already running.

## 2. Notes

- UDIDs look like: `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`
