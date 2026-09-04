# Hearth

**Hearth** bridges Omarchy (Arch Linux + Hyprland) and Home Assistant. Talk to your laptop from HA automations, and drive HA from Cursor skills / MCP — without reimplementing ha-mcp or konradk/hass.

## First slice (this repo)

1. **Skill pack** — lean Cursor skills under `skills/` (mirrored to `.cursor/skills/`) for entity naming, safety, notifications, media, presence, and HA↔Omarchy automation patterns.
2. **TypeScript MCP** — stdio server in `mcp/` exposing Home Assistant REST helpers and allowlisted Omarchy/`hyprctl` tools.

There is **no desktop daemon** yet. Presence sensors, lock/wake, and brightness quirks documented under `references/` are for a future agent — do not expect them to run from this scaffold alone.

## Skills

| Skill | Use when |
|-------|----------|
| `ha-omarchy` | Bridging HA entities and Omarchy; naming conventions; confirm locks/covers |
| `omarchy` | `hyprctl`, `omarchy-*` scripts; coexist with konradk/hass |
| `automations` | HA reacting to laptop state without fighting hypridle |
| `notify` | HA → desktop notifications (mako / swaync) |
| `media` | `playerctl` as HA `media_player` conventions |
| `presence` | Battery / charging / docked / wifi sensors — **not** lock/idle |

## MCP (`mcp/`)

Requires Node 20+.

```bash
cd mcp
npm install
npm run build
npm start
```

Environment:

| Variable | Purpose |
|----------|---------|
| `HA_URL` | Home Assistant base URL (e.g. `http://homeassistant.local:8123`) |
| `HA_TOKEN` | Long-lived access token (never logged) |

Tools:

- `ha_list_entities`, `ha_get_state`, `ha_call_service`
- `omarchy_hyprctl` (allowlisted queries), `omarchy_system`

## Safety

- Lights and harmless switches: fine to toggle.
- Locks, covers, garage doors, alarms: **confirm with the user** before calling.
- Do not call Hyprland lock without an explicit confirm flag.
- Coexist with existing Omarchy / konradk/hass tooling; do not fight hypridle.

## License

MIT © 2026 Jonathan DiGirolamo
