# Lock / wake notes (FUTURE daemon)

Not implemented in this skill-pack + MCP slice. Capture hardware quirks so a future Omarchy desktop daemon can lock/wake cleanly.

## Dell + hypridle

- Some Dell systems need a non-zero `stop_timeout` (or equivalent) so the idle daemon finishes DPMS / lock hooks before sleep. Tune hypridle listeners rather than racing from HA.
- After wake, restore brightness with `brightnessctl`: save before blanking, then restore — a common pattern is save → set 0 on idle, restore on resume. Document the exact `brightnessctl -s` / `-r` (or save/restore file) flow the daemon will use.

## Boundaries

- HA must **not** drive lock timers in parallel with hypridle.
- Presence skills stay limited to battery / docked / wifi; lock state is daemon territory.
- MCP must not call lock without an explicit confirm flag even after a daemon exists.
