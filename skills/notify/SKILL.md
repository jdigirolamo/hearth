---
name: notify
description: Send Home Assistant notifications to the Omarchy desktop (mako or swaync) via notify.omarchy_desktop.
license: MIT
---

# Notify (HA → Omarchy)

Route HA messages to the laptop notification daemon.

## Target

- Entity / notify target: `notify.omarchy_desktop`
- Backends on Omarchy: **mako** or **swaync** (whichever the user runs).

## How to call

From HA (service):

```yaml
service: notify.omarchy_desktop
data:
  title: Hearth
  message: Dryer finished
```

From MCP: `ha_call_service` with domain `notify`, service `omarchy_desktop` (or the notify service name exposed by the integration), and a data payload with `message` / `title`.

## Guidelines

- Keep titles short; put detail in `message`.
- Do not flood — coalesce repeated battery or wifi flaps.
- Critical alerts may set urgency if the notify platform supports it; otherwise rely on mako/swaync config.
- Never include tokens or secrets in notification text.
