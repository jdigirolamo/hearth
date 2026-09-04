---
name: media
description: Map playerctl / desktop media to Home Assistant media_player.omarchy_laptop conventions for play, pause, and status.
license: MIT
---

# Media (playerctl ↔ HA)

Treat the Omarchy laptop as `media_player.omarchy_laptop`. On-device control uses `playerctl`; HA exposes the same actions through the media_player entity once a future daemon or integration publishes state.

## Conventions

| HA service | Desktop |
|------------|---------|
| `media_play` / `media_pause` / `media_play_pause` | `playerctl play|pause|play-pause` |
| `media_next_track` / `media_previous_track` | `playerctl next|previous` |
| `volume_set` / `volume_mute` | WirePlumber / `wpctl` or player volume |
| state attributes | `playerctl metadata` / status |

## Guidelines

- Prefer controlling the **active** player (`playerctl -p <player>` only when disambiguating).
- Do not invent a second media_player entity per app; keep one laptop player unless the user asks.
- If `playerctl` is missing, say the host is not ready for media bridging.
