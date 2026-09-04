# Automation playbooks

Copy and adapt. Replace `light.desk_lamp`, `scene.evening_away`, and thresholds with the user’s real entities.

## 1. Leave-home (Wi-Fi)

```yaml
alias: Omarchy left home Wi-Fi
id: omarchy_left_home_wifi
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_wifi_home
    to: "off"
    for: "00:10:00"
condition:
  # Optional: only after evening
  # - condition: time
  #   after: "18:00:00"
action:
  - service: scene.turn_on
    target:
      entity_id: scene.evening_away
mode: single
```

**Variations:** shorter `for:` on wired desktops that never roam; longer if mesh Wi-Fi flaps; add `person` conditions if the household uses them.

## 2. Back on home Wi-Fi

```yaml
alias: Omarchy back on home Wi-Fi
id: omarchy_back_home_wifi
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_wifi_home
    to: "on"
    for: "00:02:00"
action:
  - service: notify.omarchy_desktop
    data:
      title: Home network
      message: "Laptop is on home Wi-Fi again."
mode: single
```

Keep actions light here — returning home should not blast every light unless the user asks.

## 3. Docked at desk

```yaml
alias: Omarchy docked at desk
id: omarchy_docked_desk
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_docked
    to: "on"
action:
  - service: light.turn_on
    target:
      entity_id: light.desk_lamp
    data:
      brightness_pct: 70
mode: single
```

## 4. Undock — pause laptop media

```yaml
alias: Omarchy undock pause media
id: omarchy_undock_pause_media
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_docked
    to: "off"
condition:
  - condition: state
    entity_id: media_player.omarchy_laptop
    state: playing
action:
  - service: media_player.media_pause
    target:
      entity_id: media_player.omarchy_laptop
mode: single
```

## 5. Low battery while undocked

```yaml
alias: Omarchy low battery
id: omarchy_low_battery
trigger:
  - platform: numeric_state
    entity_id: sensor.omarchy_battery
    below: 20
condition:
  - condition: state
    entity_id: binary_sensor.omarchy_docked
    state: "off"
action:
  - service: notify.omarchy_desktop
    data:
      title: Battery low
      message: "Under 20% and undocked — plug in or dock."
mode: single
```

Optional: second automation below 10% with a stronger message; still no remote lock.

## 6. Docked + home Wi-Fi = “at desk work mode”

```yaml
alias: Omarchy at desk work mode
id: omarchy_desk_work_mode
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_docked
    to: "on"
condition:
  - condition: state
    entity_id: binary_sensor.omarchy_wifi_home
    state: "on"
action:
  - service: light.turn_on
    target:
      entity_id: light.desk_lamp
  # Optional: switch input_boolean.work_mode on
mode: single
```

## Testing without the daemon

1. Create helpers / template sensors with the canonical entity_ids and `hearth_stub: true` (or obvious friendly names).
2. Manually toggle them in Developer Tools → States.
3. Confirm automations fire once; then remove stubs when live publishers exist.
4. Never aim garage/lock automations at stubs.

## Review questions for PRs / agent drafts

- Does any action SSH, shell, or MQTT into the laptop to lock or sleep?
- Is leave-home debounced?
- Are entity_ids exactly the Hearth contract?
- Would konradk/hass and this automation fight over the same light?
- Did we invent room entity_ids the user never named?
