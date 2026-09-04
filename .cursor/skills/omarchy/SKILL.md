---
name: omarchy
description: >
  Work with Omarchy (Arch + Hyprland) from Hearth: hyprctl allowlist, omarchy-*
  scripts, playerctl/brightnessctl checks, and coexistence with konradk/hass and
  hypridle. Use when inspecting workspaces/clients/monitors, verifying the host
  is Omarchy, or planning lock/wake (daemon later). Keywords: Omarchy, Hyprland,
  hyprctl, hypridle, hyprlock, brightnessctl, konradk/hass, laptop.
license: MIT
compatibility: Omarchy MCP tools only work on a machine with hyprctl / omarchy helpers; otherwise report not on Omarchy.
---

# Omarchy

Omarchy is Arch Linux + Hyprland with `omarchy-*` helper scripts and an opinionated desktop. Hearth’s first slice **reads** the desktop through an allowlisted MCP. It does not replace the bar, hypridle, or [konradk/hass](https://github.com/konradk/hass).

For HA entity naming and safety, use `ha-omarchy`. For HA YAML, use `automations`.

## When to use

- Inspect Hyprland workspaces, clients, active window, or monitors
- Check whether `hyprctl`, `playerctl`, `brightnessctl`, or `omarchy-*` exist
- Explain how Hearth should coexist with the Omarchy bar HA plugin
- Plan lock/wake / keyboard backlight behavior for a **future** daemon (`references/lock-wake.md`)

Do **not** use this skill to drive house lights (that’s HA / konradk/hass) or to invent lock/idle presence sensors (that’s the future daemon + `presence` boundaries).

## MCP tools

### `omarchy_hyprctl`

Allowlisted subcommands only:

| Subcommand | Use for |
|------------|---------|
| `version` | Confirm Hyprland / reachability |
| `workspaces` | Desk layout, empty vs occupied |
| `clients` | Open windows / classes |
| `activewindow` | What the user is focused on |
| `monitors` | Docked display layout hints |

Refuse (or require an explicit user confirm flag if a tool supports it): `kill`, `dispatch` that locks/suspends, random `keyword`, or shelling out beyond the allowlist.

### `omarchy_system`

Probe binaries and report clearly:

- Present → treat host as Omarchy-capable
- Missing `hyprctl` → **not on Omarchy**; say so and stop assuming Hyprland paths

Useful probes: `hyprctl`, `playerctl`, `brightnessctl`, common `omarchy-*` helpers (launch, system lock/wake if installed). Prefer existence/version checks over executing lock/wake.

## Coexistence

| Component | Role | Hearth rule |
|-----------|------|-------------|
| **hypridle / hyprlock** | Idle, lock, DPMS on the laptop | Never race with HA timers |
| **konradk/hass** | Toggle HA devices from Omarchy 4 bar | Leave alone unless user migrates |
| **Hearth MCP** | Query desktop; call HA REST for bridge | Read-only desktop in this slice |
| **Future Hearth daemon** | Publish dock/wifi/battery; later lock/idle | See `lock-wake.md` |

If the user wants “toggle the desk lamp from the bar,” point at konradk/hass. If they want “when I dock, turn the lamp on,” point at `automations` + `presence`.

## Agent workflow

1. `omarchy_system` — am I on Omarchy?
2. If yes, `omarchy_hyprctl version` then the inspect subcommand you need.
3. Map facts to HA only via the `omarchy_*` entity contract (`ha-omarchy`), not ad-hoc MQTT topics.
4. Destructive desktop actions → confirm first; prefer documenting for the daemon over one-off scripts.

## References

- `references/lock-wake.md` — Dell backlight / hypridle gotchas for the future daemon
- `references/commands.md` — allowlist and safe probes cheat sheet
