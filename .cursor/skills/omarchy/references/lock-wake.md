# Lock / wake notes (FUTURE daemon)

Not implemented in the skills + MCP first slice. These notes exist so a future Omarchy desktop daemon (and agents planning it) do not repeat known footguns.

## Boundaries

- **hypridle owns** idle → lock → DPMS on the laptop.
- **HA must not** run parallel lock/suspend timers or SSH-in lock scripts as “presence.”
- **Presence skill** stays on battery / docked / wifi until the daemon publishes lock/idle entities on purpose.
- **MCP** must not call lock/wake without an explicit confirm flag, even after a daemon exists.

## Dell keyboard backlight + brightnessctl

Seen on Dell laptops with `dell::kbd_backlight` (and similar):

1. Firmware/sysfs often exposes `stop_timeout` (e.g. default `1m`). After that idle, **brightness is already `0`**.
2. Omarchy lock paths that do `brightnessctl -s set 0` (save current, then set 0) can **save `0`** if hypridle locked after `stop_timeout`.
3. Wake/`brightnessctl -r` then restores **0**. Software restore fails; only the physical backlight key brings light back. Explicit `set 0` can also leave Dell in a hard-off mode where activity triggers do not revive the LED.

### What a daemon / Omarchy fix should do

1. Persist **last non-zero** keyboard backlight level in a state file (not only brightnessctl’s save slot).
2. On `off`: save only if current **> 0**; never overwrite stored level with 0.
3. On `restore`: apply last non-zero (fallback mid-step if unknown).
4. Optional: snapshot level on idle **before** `stop_timeout` (e.g. ~30s), not only at lock.
5. Tune hypridle so lock hooks are ordered cleanly vs DPMS; do not race from HA.

Related upstream context: Omarchy issues around keyboard backlight restore after lock (Dell `stop_timeout` + `omarchy-brightness-keyboard` save/restore). Prefer fixing Omarchy scripts / daemon rather than papering over with HA.

## Suggested daemon publish order (later)

1. First: `sensor.omarchy_battery`, `binary_sensor.omarchy_docked`, `binary_sensor.omarchy_wifi_home`
2. Then: media + notify bridges
3. Only later: lock/idle entities, with backlight restore fixed first

## Agent guidance today

If the user hits “backlight stays off after unlock,” point at last-nonzero restore and `stop_timeout` — do not add an HA automation that toggles keyboard backlight over MQTT as a “fix.”
