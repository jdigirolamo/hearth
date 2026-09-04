# Notify payloads and examples

## Minimal

```yaml
service: notify.omarchy_desktop
data:
  message: "Dryer finished."
```

## Titled

```yaml
service: notify.omarchy_desktop
data:
  title: Laundry
  message: "Dryer finished."
```

## From low-battery automation

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
      message: "Under 20% and undocked — plug in or dock."
mode: single
```

## Critical (use sparingly)

```yaml
service: notify.omarchy_desktop
data:
  title: Security
  message: "Front door unlocked while away."
  data:
    urgency: critical
```

Only when the user wants security-grade attention. Prefer mobile/HA companion apps for true alarms if they already use them.

## MCP example (conceptual)

```json
{
  "domain": "notify",
  "service": "omarchy_desktop",
  "data": {
    "title": "Hearth",
    "message": "Desk lamp automation fired."
  }
}
```

## Mapping to desktop

| HA field | Typical desktop |
|----------|-----------------|
| `title` | Notification summary / heading |
| `message` | Body |
| `data.urgency` | mako/swaync urgency or expire timeout (integration-defined) |

Exact CLI:

- mako: often via `notify-send` which mako handles
- swaync: `notify-send` or `swaync-client` depending on setup

The future daemon should wrap one path and keep this skill’s HA contract stable.

## Anti-patterns

| Don’t | Why |
|-------|-----|
| New entity_id per alert type | One `notify.omarchy_desktop`; vary title |
| Notify on every wifi roam | Debounce in automation |
| Paste HA long-lived token into message for “debug” | Secret leak on screen + history |
| Critical urgency for “laptop docked” | Trains the user to ignore critical |
