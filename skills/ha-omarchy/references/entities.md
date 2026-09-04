# Canonical Omarchy entities

Stable entity IDs for the Hearth bridge. Use these in skills, MCP examples, HA YAML, and dashboards. Prefer renaming HA helpers to match rather than inventing parallel names.

## Core table

| Entity ID | Domain | State | Suggested attributes |
|-----------|--------|-------|----------------------|
| `sensor.omarchy_battery` | sensor | `0`–`100` (number as string in HA) | `charging` (`true`/`false`), `unit_of_measurement: %`, `device_class: battery` |
| `binary_sensor.omarchy_docked` | binary_sensor | `on` = docked / powered via dock | `device_class: plug` (optional) |
| `binary_sensor.omarchy_wifi_home` | binary_sensor | `on` = associated to home SSID(s) | `ssid` (optional string) |
| `media_player.omarchy_laptop` | media_player | HA media_player states | standard media attrs (`media_title`, `volume_level`, …) via playerctl conventions — see `media` skill |
| `notify.omarchy_desktop` | notify | n/a (notify platform) | `title`, `message`; optional `data.urgency` |

## Naming rules

1. Prefix **every** bridge entity with `omarchy_` so phones, tablets, and other PCs do not collide.
2. One laptop → one set of IDs. Second machine? Use `omarchy_<hostname>_battery` only if the user runs multiple Omarchy boxes; document the host in the entity `friendly_name`.
3. Do **not** create `binary_sensor.omarchy_locked` or `binary_sensor.omarchy_idle` in this skill pack. Those wait for the desktop daemon.
4. Friendly names: human text like `Omarchy battery`; entity_id stays snake_case as above.

## Stubbing before the daemon

If the user wants automations today:

- Create HA **helpers** (template/number/toggle) with the canonical `entity_id`s, or MQTT/template sensors they will later replace.
- Mark stubs in `friendly_name` or an attribute `hearth_stub: true` so agents do not treat them as live hardware.
- Never point production security automations at stubs.

## Related non-Hearth entities

Agents may still call normal HA entities (`light.*`, `scene.*`) from automations triggered by Omarchy sensors. Those keep their own IDs — only the **laptop side** of the bridge uses `omarchy_*`.
