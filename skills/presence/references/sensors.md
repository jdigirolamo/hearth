# Presence sensor contract

## sensor.omarchy_battery

| | |
|--|--|
| State | Integer string `0`–`100` |
| unit_of_measurement | `%` |
| device_class | `battery` |
| Attributes | `charging` (bool), optional `hearth_stub` |

Sources on Linux (daemon later): `/sys/class/power_supply/BAT*/capacity`, `status` (`Charging` / `Discharging` / `Full`).

## binary_sensor.omarchy_docked

| | |
|--|--|
| State | `on` = docked / dock power present |
| device_class | `plug` (optional) |

Implementation hints (daemon): USB-C dock detection, `POWER_SUPPLY` online + dock VID/PID allowlist, or user-configured “AC + external display” heuristic. Prefer explicit dock signals over “any AC” if the user uses chargers away from the desk — document the chosen rule in the daemon README.

**Semantic choice:** If the user only cares “plugged in,” say so and treat charger as docked, or add `binary_sensor.omarchy_ac` later. Default Hearth name is **docked** = desk dock.

## binary_sensor.omarchy_wifi_home

| | |
|--|--|
| State | `on` = connected to home SSID list |
| Attributes | optional `ssid` |

Config (daemon): list of home SSIDs (2.4 + 5 GHz names). Match NetworkManager active connection (`nmcli -t -f active,ssid dev wifi` or similar).

**Off** means not on those SSIDs — could be away, on phone hotspot, or Ethernet-only. For Ethernet-at-home users, a later `binary_sensor.omarchy_home_lan` may be needed; don’t silently equate Ethernet with wifi_home unless documented.

## Debounce guidance

| Transition | Suggested `for:` |
|------------|------------------|
| wifi_home → off (away scene) | `00:10:00` default |
| wifi_home → on | `00:01:00`–`00:02:00` |
| docked on/off | `00:00:00`–`00:00:30` (usually stable) |

## Example state dump (conceptual)

```yaml
sensor.omarchy_battery:
  state: "67"
  charging: false

binary_sensor.omarchy_docked:
  state: "off"

binary_sensor.omarchy_wifi_home:
  state: "on"
  ssid: "HomeLAN-5G"
```

## Anti-patterns

| Don’t | Do |
|-------|-----|
| Publish lock as presence | Use wifi_home / docked |
| Away scene on wifi off, no `for:` | Debounce |
| Assume any AC = at desk | Define docked vs charger |
| device_tracker from hypridle | Person/phone trackers + these sensors |
| Different entity_ids per draft | Stick to the table |
