# Automation patterns

Sketches only — adapt entity IDs and delays to the home.

## Away when Wi-Fi leaves home

```yaml
alias: Omarchy left home Wi-Fi
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_wifi_home
    to: "off"
    for: "00:10:00"
action:
  - service: scene.turn_on
    target:
      entity_id: scene.evening_away
mode: single
```

## Desk lamp when docked

```yaml
alias: Omarchy docked at desk
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_docked
    to: "on"
action:
  - service: light.turn_on
    target:
      entity_id: light.desk_lamp
mode: single
```

## Low battery notify

```yaml
alias: Omarchy low battery
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
      message: "Laptop battery under 20% and undocked."
mode: single
```

## Do not

- Mirror hypridle with an HA lock timer.
- Use lock/idle as a presence proxy.
