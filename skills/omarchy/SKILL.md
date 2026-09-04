---
name: omarchy
description: Omarchy/Hyprland desktop helpers via hyprctl and omarchy-* scripts. Use when inspecting workspaces, clients, monitors, or checking Omarchy binaries. Coexist with konradk/hass; do not fight hypridle.
license: MIT
---

# Omarchy

Omarchy is Arch + Hyprland with opinionated `omarchy-*` helper scripts. Hearth only **queries** the desktop in this slice (MCP allowlist). A future daemon may own lock/wake — see `references/lock-wake.md`.

## hyprctl (allowlisted)

Prefer MCP `omarchy_hyprctl` with these subcommands only:

- `version`
- `workspaces`
- `clients`
- `activewindow`
- `monitors`

Do **not** dispatch lock, kill, or arbitrary keywords without an explicit user confirm flag.

## omarchy-* scripts

Use `omarchy_system` to check whether binaries like `hyprctl`, `omarchy-launch`, `playerctl`, `brightnessctl` exist. If missing, treat the host as not Omarchy and say so clearly.

## Coexistence

- Leave [konradk/hass](https://github.com/konradk/hass) and stock Omarchy HA integrations alone unless the user asks to migrate.
- Do not disable or override hypridle / hyprlock from skills; coordinate via HA patterns in the `automations` skill instead.
