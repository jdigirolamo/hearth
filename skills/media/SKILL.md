---
name: media
description: >
  Map Omarchy desktop media (playerctl) to Home Assistant media_player.omarchy_laptop.
  Use when defining play/pause/next conventions, drafting HA media_player services,
  pausing on undock, or checking playerctl readiness. Keywords: playerctl, media_player,
  Omarchy, Spotify, browser media, MPRIS, Hearth.
license: MIT
compatibility: Needs playerctl on the laptop for live control; HA entity may be stubbed until the daemon exists.
---

# Media (playerctl ↔ HA)

One laptop player in HA: `media_player.omarchy_laptop`. On the desktop, **playerctl** (MPRIS) is the source of truth.

Daemon comes later — this skill is the contract agents and automations should target now.

## When to use

- Wire or document laptop media in Home Assistant
- Map HA `media_player.*` services to playerctl
- Pause media on undock / leave-desk (`automations` playbooks)
- Decide active-player vs per-app entities

Not this skill: whole-house speakers (use normal HA media_players), or bar device toggles (konradk/hass).

## Entity contract

| Item | Value |
|------|--------|
| Entity ID | `media_player.omarchy_laptop` |
| Friendly name | `Omarchy laptop` (suggested) |
| Desktop tool | `playerctl` |
| Volume | Prefer player volume via playerctl; system volume via `wpctl` only if user asks |

Do **not** create `media_player.omarchy_spotify`, `media_player.omarchy_firefox`, etc. unless the user explicitly wants per-app players. Default is one aggregated laptop player (playerctl’s active player).

## Service map

| HA service | playerctl (typical) |
|------------|---------------------|
| `media_play` | `playerctl play` |
| `media_pause` | `playerctl pause` |
| `media_play_pause` | `playerctl play-pause` |
| `media_stop` | `playerctl stop` |
| `media_next_track` | `playerctl next` |
| `media_previous_track` | `playerctl previous` |
| `volume_set` | `playerctl volume <0.0–1.0>` (when supported) |
| `volume_mute` | playerctl mute / unmute if available; else document gap |

State / attributes from `playerctl status` and `playerctl metadata` → HA `state`, `media_title`, `media_artist`, `media_album_name`, `volume_level` when mappable.

Details: `references/playerctl.md`.

## Agent workflow

1. On Omarchy: `command -v playerctl` (via `omarchy_system` or shell). Missing → not ready for media bridge.
2. Prefer **active** player. Use `playerctl -p <name>` only to disambiguate when the user names an app.
3. From HA/MCP: `ha_call_service` on `media_player` / `omarchy_laptop` / `media_pause` (etc.) once the entity exists.
4. Automations: pause on undock is a good default pattern; don’t auto-play on dock unless asked (surprise audio).

## Safety & manners

| Action | Guidance |
|--------|----------|
| pause / play-pause | Generally safe |
| next / previous | Safe; may annoy if wrong player active — prefer active player |
| volume_set high | Confirm if jumping above ~0.8 from a low level |
| stop | OK when user wants silence |
| Auto-play on dock/wifi | Ask first |

Never put tokens in media metadata or notify text about media errors.

## Stubs

Before the daemon: create a HA `media_player` helper or template only if useful for dashboard layout; mark `hearth_stub`. Don’t point “pause all house audio” at a stub.

## Related

- `automations` — undock pause playbook
- `omarchy` — binary probes
- `ha-omarchy` — entity naming
