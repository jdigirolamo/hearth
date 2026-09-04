# Omarchy / Hyprland command cheat sheet

For agents and MCP implementers. Prefer MCP wrappers over raw shell when available.

## hyprctl allowlist (Hearth MCP)

```text
hyprctl version
hyprctl workspaces
hyprctl clients
hyprctl activewindow
hyprctl monitors
```

Not allowlisted by default (need explicit user confirm + careful design):

```text
hyprctl dispatch ...    # especially exit, exec, dpms, lock-related
hyprctl kill
hyprctl keyword ...
```

## Binary probes

```bash
command -v hyprctl
command -v playerctl
command -v brightnessctl
command -v omarchy-system-lock   # may not exist on all versions
command -v omarchy-system-wake
command -v omarchy-brightness-keyboard
```

If `hyprctl` is missing, return a clear **not on Omarchy** error and do not fake JSON.

## playerctl (media skill)

```bash
playerctl status
playerctl metadata
playerctl play-pause   # only with user intent
```

## brightnessctl (daemon territory)

```bash
brightnessctl --list
brightnessctl -d 'dell::kbd_backlight' g    # example device name varies
# save/restore patterns belong in lock-wake.md — do not invent HA-driven blanking
```

## Notification daemons (notify skill)

Omarchy may use mako or swaync. Detect, don’t assume:

```bash
command -v makoctl
command -v swaync-client
```
