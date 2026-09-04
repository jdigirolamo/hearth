---
name: presence
description: >
  Expose Omarchy laptop battery, charging, docked, and home-Wi-Fi sensors to
  Home Assistant. Use when defining presence entities, home/away from wifi_home,
  desk detection from docked, or rejecting lock/idle as presence. Keywords:
  presence, battery, docked, wifi_home, Omarchy, Home Assistant, device_tracker,
  hearth.
license: MIT
compatibility: Live values need a future desktop daemon (or stubs). Lock/idle are out of scope.
---

# Presence (power & network — not lock)

**Presence in Hearth** means how the laptop is powered and which network it’s on. It does **not** mean session locked or idle — that stays with hypridle/hyprlock until a dedicated daemon ships (`omarchy` → `lock-wake.md`).

## When to use

- Define or stub `omarchy_*` power/network sensors
- Choose home/away or “at desk” signals for automations
- Stop an agent from treating lock/idle as presence
- Document charging as attribute vs separate sensor

Hand off: automation YAML → `automations`; entity naming/safety → `ha-omarchy`; desktop probes → `omarchy`.

## Entity set (in scope)

| Entity ID | on / value means |
|-----------|------------------|
| `sensor.omarchy_battery` | Battery % (`0`–`100`) |
| `binary_sensor.omarchy_docked` | Docked or powered via dock |
| `binary_sensor.omarchy_wifi_home` | Associated to configured home SSID(s) |

### Charging

Prefer **attribute** on the battery sensor: `charging: true|false` (and optional `device_class: battery`).

Only add `binary_sensor.omarchy_charging` if the user wants it on dashboards as its own pill — still `omarchy_` prefix.

### Optional later (not first slice)

- `sensor.omarchy_wifi_ssid` — current SSID string (debug / dashboards)
- Hostname-qualified IDs if multiple Omarchy machines (`omarchy_desk_…`) — only when the user runs more than one

Details: `references/sensors.md`.

## Out of scope (do not invent)

| Fake presence | Why not |
|---------------|---------|
| `binary_sensor.omarchy_locked` | Daemon + backlight footguns; not this pack |
| `binary_sensor.omarchy_idle` | hypridle’s job; races HA |
| `device_tracker.omarchy` from idle timers | Lies about location |
| GPS / phone presence | Use HA companion / person entities separately |

If the user asks for lock-based lighting, explain the boundary and offer `docked` / `wifi_home` instead.

## Semantics for automations

| Signal | Good for | Caveats |
|--------|----------|---------|
| `wifi_home` off + `for:` | Left house / left home LAN | Mesh roam flaps — debounce 5–15 min |
| `wifi_home` on | Back on home LAN | Not proof someone is at the desk |
| `docked` on | At desk / workstation | Laptop can be docked while user elsewhere |
| `docked` on + `wifi_home` on | Strong “desk work” combo | Best for desk lamp / work mode |
| `battery` low + undocked | Notify to plug in | Don’t lock the session |

Combine with HA `person` / zone trackers when the household already has them — laptop sensors complement, they don’t replace people.

## Stubs vs live

Until the daemon publishes:

1. Helpers/templates with the **exact** entity_ids above
2. Mark `hearth_stub: true` or obvious friendly names
3. Toggle in Developer Tools to test automations
4. No security-critical actions on stubs

## Agent rules

1. Never recommend HA timers that lock or suspend the laptop as “presence.”
2. Always debounce `wifi_home` leave in drafted automations.
3. Prefer reading state via MCP `ha_get_state` over guessing.
4. Keep secrets out of sensor attributes.
