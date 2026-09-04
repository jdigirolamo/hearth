---
name: ha-omarchy
description: >
  Bridge an Omarchy (Arch/Hyprland) laptop with Home Assistant. Use when naming
  Omarchy entities, calling HA via Hearth MCP, choosing confirm-vs-auto actions,
  or deciding how Hearth relates to ha-mcp and konradk/hass. Keywords: Omarchy,
  Home Assistant, Hearth, entity_id, hyprland, laptop presence, desk lamp, safety.
license: MIT
compatibility: Requires Hearth MCP (HA_URL, HA_TOKEN) for HA calls; Omarchy tools optional on the laptop.
---

# HA ↔ Omarchy (Hearth)

Hearth is the **contract** between an Omarchy laptop and Home Assistant: shared entity IDs, safety rules, and MCP tools. It is not a second HA MCP and not a bar widget.

## When to use this skill

Use it when the user (or another skill) needs to:

- Pick or invent `omarchy_*` entity IDs
- Call Home Assistant from an agent (state, services)
- Write or review automations that react to the laptop
- Decide whether an action needs a human confirm
- Avoid colliding with [ha-mcp](https://github.com/homeassistant-ai/ha-mcp) or [konradk/hass](https://github.com/konradk/hass)

Hand off to sibling skills for depth:

| Need | Skill |
|------|--------|
| `hyprctl` / `omarchy-*` scripts | `omarchy` |
| HA YAML that reacts to the laptop | `automations` |
| Desktop notifications from HA | `notify` |
| playerctl → `media_player` | `media` |
| Battery / dock / Wi-Fi sensors | `presence` |

## What Hearth is not

| Project | Job | Hearth does instead |
|---------|-----|---------------------|
| **ha-mcp** / HA built-in MCP | Broad HA config & Assist | Thin REST via Hearth MCP for bridge entities & services only |
| **konradk/hass** | Control HA devices from the Omarchy 4 bar | Publish / consume **laptop → HA** state; leave bar toggles alone |

Do not reimplement either. Point agents at them when the user wants those jobs.

## Entity contract

Always use the `omarchy_` prefix. Canonical IDs are in `references/entities.md`.

Minimum set:

- `sensor.omarchy_battery`
- `binary_sensor.omarchy_docked`
- `binary_sensor.omarchy_wifi_home`
- `media_player.omarchy_laptop`
- `notify.omarchy_desktop`

**Not in this contract (yet):** lock, idle, screen-on. Those belong to a future desktop daemon. Do not fake them with HA timers that fight hypridle.

Until a daemon publishes sensors, treat the table as the **API to implement against** — invent helpers with these IDs only if the user asks for stubs.

## How an agent should work the bridge

1. **Discover** — `ha_list_entities` (filter names containing `omarchy`) or `ha_get_state` on a known ID.
2. **Act in HA** — `ha_call_service` with domain/service/data. Prefer existing `omarchy_*` entities.
3. **Inspect the laptop** (when on Omarchy) — `omarchy_hyprctl` / `omarchy_system` (allowlisted). Clear failure if not on Omarchy is expected.
4. **Automate** — draft YAML using patterns in `references/automations.md` and the `automations` skill. Prefer `for:` delays on Wi-Fi leave so brief roam does not trip scenes.

Env for MCP HA tools: `HA_URL`, `HA_TOKEN`. Never print, log, or commit the token.

## Safety rubric

Ask yourself: *If this fires while the user is away or asleep, what’s the blast radius?*

| Class | Examples | Agent behavior |
|-------|----------|----------------|
| **Safe** | Lights, harmless switches, media pause/play, read-only state | Do it |
| **Confirm** | Locks, covers, garage, alarms, vacuum start, climate that can freeze/overheat, any unlock | Ask first; include entity_id and intended service |
| **Never silent** | Deleting automations, rewriting `configuration.yaml`, disabling security | Explicit user instruction required |

When unsure, confirm. Prefer `light.turn_on` / `notify.omarchy_desktop` demos over lock demos.

## Decision cheatsheet

```
Need laptop → house reaction?
  yes → presence/media entities + automations skill
Need house → laptop alert?
  yes → notify skill + notify.omarchy_desktop
Need toggle a light from the bar UI?
  yes → konradk/hass (not Hearth)
Need deep HA automation editing / dashboards?
  yes → ha-mcp (not Hearth MCP)
Need lock/idle as presence?
  no  → wait for daemon; use wifi_home / docked instead
```

## References

- `references/entities.md` — canonical entity_ids and attributes
- `references/automations.md` — YAML sketches and anti-patterns
