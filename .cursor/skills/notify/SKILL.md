---
name: notify
description: >
  Route Home Assistant alerts to the Omarchy laptop notification drawer (mako or
  swaync) via notify.omarchy_desktop. Use when drafting HA notify calls, MCP
  ha_call_service for desktop alerts, coalescing flapping sensors, or choosing
  urgency. Keywords: notify, mako, swaync, Omarchy, Home Assistant, desktop
  notification, hearth.
license: MIT
compatibility: Needs notify.omarchy_desktop (daemon or stub). Detect mako vs swaync; do not assume.
---

# Notify (HA → Omarchy)

House talks to the laptop drawer. One notify target: `notify.omarchy_desktop`.

Entity contract: `ha-omarchy` / `entities.md`. Do not invent `notify.omarchy_laptop` or parallel names.

## When to use

- HA should pop a desktop notification (battery, laundry, doorbell summary, deploy failed)
- Wiring `ha_call_service` for notify from an agent
- Choosing title/message/urgency or stopping notification spam

Not this skill: controlling lights from the bar (konradk/hass), or reading hyprctl (omarchy skill).

## Target contract

| Field | Value |
|-------|--------|
| HA service | `notify.omarchy_desktop` |
| Required data | `message` (string) |
| Optional data | `title`, `data.urgency` (`low` / `normal` / `critical` when supported) |
| Desktop backends | **mako** or **swaync** — detect; don’t hardcode |

Until a bridge exists, stub the notify platform or document that calls will no-op — mark stubs clearly.

## Call shapes

### Home Assistant YAML

```yaml
service: notify.omarchy_desktop
data:
  title: Battery low
  message: "Under 20% and undocked."
```

With urgency (if the integration maps it):

```yaml
service: notify.omarchy_desktop
data:
  title: Garage
  message: "Door left open 10 minutes."
  data:
    urgency: critical
```

### Hearth MCP

```text
ha_call_service
  domain: notify
  service: omarchy_desktop
  data: { title: "...", message: "..." }
```

If the instance exposes a different notify service name, discover via `ha_list_entities` / HA docs — still prefer registering it as `notify.omarchy_desktop`.

## Writing good notifications

| Do | Don’t |
|----|-------|
| Short `title`, detail in `message` | Essays in the title |
| Coalesce flaps (battery, wifi) | Notify on every state change |
| One actionable sentence | Dump JSON or entity_ids unless debugging |
| Urgency only for real urgency | Mark everything critical |
| Strip secrets | Put tokens, codes, or private URLs in text |

## Coalescing & rate limits

- Prefer automations with `for:` and `mode: single` (see `automations`) so notify isn’t the debounce layer.
- If still noisy, suggest HA `alert` integration or a `delay` / `choose` that skips repeats within N minutes.
- Agents should refuse to add `notify.omarchy_desktop` on raw `wifi_home` off without debounce.

## Backend notes

Detect on the laptop (`omarchy` skill / `commands.md`):

```bash
command -v makoctl
command -v swaync-client
```

Daemon implementation details (later): listen for HA notify → `notify-send` or mako/swaync CLI. Skill authors should not assume D-Bus paths.

More: `references/payloads.md`.

## Safety

- Notifications are usually **safe** (ha-omarchy rubric) — still no secrets in the body.
- Do not use notify to confirm lock/unlock; confirm in the agent chat, then call the real service.
