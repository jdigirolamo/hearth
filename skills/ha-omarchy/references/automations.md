# Automation patterns (laptop → house)

Sketches for Home Assistant. Adapt entity IDs, scenes, and delays. Prefer the `automations` skill for longer playbooks; this file is the ha-omarchy cheat sheet.

## Principles

1. **Trigger on Omarchy sensors**, act on house entities — not the reverse, unless using `notify.omarchy_desktop`.
2. **Debounce leave-home** — Wi-Fi flaps; use `for:` (often 5–15 minutes).
3. **Do not fight Hyprland** — no HA automation that locks the session, dims the keyboard backlight, or mirrors hypridle timeouts.
4. **Do not duplicate the bar** — if konradk/hass already toggles a light from the panel, do not also spam the same light from a noisy sensor without the user asking.

## Away when Wi-Fi leaves home

```yaml
alias: Omarchy left home Wi-Fi
trigger:
  - platform: state
    entity_id: binary_sensor.omarchy_wifi_home
    to: "off"
    for: "00:10:00"
condition: []
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

Optional undock: turn the lamp off only if you are sure the desk is vacant (combine with `wifi_home` or time conditions).

## Low battery → desktop notify

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

## Media pause when leaving desk (optional)

```yaml
alias: Omarchy undock pause media
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

## Anti-patterns

| Don’t | Why |
|-------|-----|
| HA timer that calls a lock script on the laptop | Fights hypridle / Omarchy lock path; backlight bugs (Dell `stop_timeout`) get worse |
| Use lock/idle as “home/away” | Not in the entity contract; use `wifi_home` / `docked` |
| Toggle the same light from bar plugin and a flapping sensor | Double fires; pick one owner |
| Fire leave-home scene on `wifi_home` off with no `for:` | Roaming / AP steer causes false away |
| Put long-lived tokens in automation YAML | Use HA secrets / the MCP env only |

## When to escalate

- User wants lock/idle-driven lighting → say that needs the future Hearth daemon; offer dock/wifi alternatives now.
- User wants full HA config editing → point at ha-mcp.
- User wants bar toggles → point at konradk/hass.
