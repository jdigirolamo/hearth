# Canonical Omarchy entities

Stable entity IDs for the Hearth bridge. Prefer these names in skills, MCP examples, and HA YAML.

| Entity ID | Domain | Role |
|-----------|--------|------|
| `sensor.omarchy_battery` | sensor | Battery percentage; optional `charging` attribute |
| `binary_sensor.omarchy_docked` | binary_sensor | Docked / powered via dock |
| `binary_sensor.omarchy_wifi_home` | binary_sensor | Connected to home Wi-Fi |
| `media_player.omarchy_laptop` | media_player | Desktop media via playerctl conventions |
| `notify.omarchy_desktop` | notify | Desktop notifications (mako/swaync) |

## Notes

- Prefix everything with `omarchy_` so it does not collide with phone or other device entities.
- Lock and idle are **not** listed here; they are not part of the presence skill.
- Until a desktop daemon publishes these, treat them as the contract to implement against.
