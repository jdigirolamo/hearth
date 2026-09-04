# playerctl ↔ HA mapping

## Probe

```bash
command -v playerctl
playerctl status
playerctl -l                  # list players
playerctl metadata
playerctl metadata --format '{{playerName}} {{status}} {{title}}'
```

Exit codes / `No players found` → expose HA state `off` or `idle`, not an error spam to notify.

## Active player

Default: no `-p` flag (playerctl picks the active MPRIS player).

Disambiguate only when needed:

```bash
playerctl -p spotify status
playerctl -p chromium play-pause
```

HA should still target **one** entity (`media_player.omarchy_laptop`) that follows the active player, unless the user opts into per-app entities.

## Metadata → attributes

| playerctl / MPRIS | HA attribute (typical) |
|-------------------|-------------------------|
| status Playing | state `playing` |
| status Paused | state `paused` |
| status Stopped | state `idle` or `off` |
| xesam:title | `media_title` |
| xesam:artist | `media_artist` |
| xesam:album | `media_album_name` |
| volume | `volume_level` (0.0–1.0) |

Exact daemon mapping can normalize quirks per app (browser vs Spotify).

## HA service examples

```yaml
service: media_player.media_pause
target:
  entity_id: media_player.omarchy_laptop
```

```yaml
service: media_player.media_play_pause
target:
  entity_id: media_player.omarchy_laptop
```

```yaml
service: media_player.volume_set
target:
  entity_id: media_player.omarchy_laptop
data:
  volume_level: 0.4
```

## Undock pause (from automations)

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

## System volume vs player volume

- **Player volume** — tied to the app; prefer for `media_player.volume_*`.
- **System volume** (`wpctl`, WirePlumber) — whole laptop output; only use when the user wants HA to drive master volume (separate future entity if needed, not `omarchy_laptop` by default).

## Anti-patterns

| Don’t | Do |
|-------|-----|
| One HA entity per browser tab | One `omarchy_laptop` |
| Auto-resume music on dock | Ask first |
| Flood notify with “player vanished” | Coalesce; idle state is enough |
| Call playerctl on non-Omarchy CI | Check binary first |
