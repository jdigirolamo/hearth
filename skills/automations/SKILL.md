---
name: automations
description: Design Home Assistant automations that react to Omarchy laptop state without fighting hypridle or duplicate lock/idle logic.
license: MIT
---

# Automations (HA ← laptop)

Use Home Assistant to react to laptop presence and power — not to replace Hyprland idle.

## Principles

1. **hypridle owns idle/lock on the laptop.** HA should not race it with parallel lock timers.
2. Trigger on **presence/power entities** (`sensor.omarchy_battery`, `binary_sensor.omarchy_docked`, `binary_sensor.omarchy_wifi_home`) rather than inventing idle sensors.
3. Prefer `mode: single` / short `delay` actions for lights and climate so flapping Wi-Fi does not spam.
4. Notifications back to the desktop use `notify.omarchy_desktop` (see `notify` skill).

## Good patterns

- Away lights: `binary_sensor.omarchy_wifi_home` off for N minutes → scene.
- Docked at desk: `binary_sensor.omarchy_docked` on → enable desk lamp / monitor power.
- Low battery while undocked: notify desktop + optional HA announcement.

See `skills/ha-omarchy/references/automations.md` for YAML sketches.

## Avoid

- Automations that call lock/suspend on the laptop on an HA timer.
- Duplicating hypridle timeouts in HA.
- Writing lock/idle as presence (that belongs to a future daemon, not this skill pack).
