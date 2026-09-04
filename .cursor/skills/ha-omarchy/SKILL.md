---
name: ha-omarchy
description: Bridge Omarchy laptop and Home Assistant. Use for entity naming, HA REST via MCP, and safety (confirm locks/covers; lights ok).
license: MIT
---

# HA ↔ Omarchy

Hearth connects an Omarchy (Arch/Hyprland) laptop to Home Assistant. Prefer the Hearth MCP tools and these naming conventions; do not reimplement ha-mcp or konradk/hass.

## When to use

- Map laptop state into HA entities or call HA services from the desktop.
- Choose entity IDs that match the references in this skill.
- Decide whether an action needs user confirmation.

## Entity naming

Use the `omarchy_*` prefix. Canonical IDs live in `references/entities.md`:

- `sensor.omarchy_battery`
- `binary_sensor.omarchy_docked`
- `binary_sensor.omarchy_wifi_home`
- `media_player.omarchy_laptop`
- `notify.omarchy_desktop`

## Bridge how

1. Read/write HA via MCP (`ha_list_entities`, `ha_get_state`, `ha_call_service`) with `HA_URL` + `HA_TOKEN`.
2. Inspect Hyprland / Omarchy via MCP (`omarchy_hyprctl`, `omarchy_system`) — allowlisted only.
3. Automations that react to the laptop: see `automations` skill; avoid fighting hypridle.

## Safety

- **Lights / harmless switches:** OK to toggle.
- **Locks, covers, garage, alarms, climate setpoints that could damage:** confirm with the user first.
- Never log or echo tokens.
- Lock/idle are **not** presence; see `presence` vs future daemon notes in `omarchy` references.
