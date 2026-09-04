---
name: presence
description: Expose Omarchy laptop battery, charging, docked, and wifi-home sensors to Home Assistant. Does NOT cover lock or idle state.
license: MIT
---

# Presence (power / network — not lock)

Presence here means **where/how the laptop is powered and networked**, not whether the session is locked or idle.

## Entities

| Entity | Meaning |
|--------|---------|
| `sensor.omarchy_battery` | Battery percent (numeric) |
| `binary_sensor.omarchy_docked` | on when docked / AC via dock |
| `binary_sensor.omarchy_wifi_home` | on when associated to the home SSID/BSSID |

Charging can be an attribute on the battery sensor or a separate binary_sensor if needed; keep names under the `omarchy_` prefix.

## Out of scope

- **Lock / unlock / idle** — owned by hyprlock/hypridle; future daemon notes in `skills/omarchy/references/lock-wake.md`.
- Do not publish fake `device_tracker` from idle timeouts.

## Automations

Trigger HA on these sensors (see `automations` skill). Debounce wifi flaps.
