---
name: automations
description: >
  Design Home Assistant automations that react to an Omarchy laptop (dock, home
  Wi-Fi, battery, media) without fighting hypridle, Omarchy lock/wake, or
  konradk/hass bar toggles. Use when drafting HA YAML, reviewing leave-home /
  desk / battery flows, or choosing debounce and mode. Keywords: Home Assistant,
  automation, Omarchy, hypridle, wifi_home, docked, scene, notify.
license: MIT
compatibility: Assumes Hearth entity contract from ha-omarchy; HA editor or YAML access.
---

# Automations (HA ← laptop)

Home Assistant reacts to the laptop. Hyprland/Omarchy still own idle, lock, and backlight on the machine.

Read `ha-omarchy` first for entity IDs and safety. YAML sketches also live in `skills/ha-omarchy/references/automations.md`. Longer playbooks: `references/playbooks.md`.

## When to use

- User wants lights/scenes/climate when they sit down, leave Wi-Fi, or undock
- Reviewing an automation that mentions Omarchy, Hyprland, lock, or idle
- Choosing `for:`, `mode:`, or conditions so sensors do not flap

Hand off: desktop notify details → `notify`; playerctl wiring → `media`; sensor meaning → `presence`.

## Ownership map

| Concern | Owner | HA’s job |
|---------|-------|----------|
| Idle timeout, lock, keyboard backlight | hypridle / Omarchy scripts | **Do not** drive these from HA |
| Bar light toggles | konradk/hass (optional) | Avoid duplicate noisy triggers on the same light |
| Dock / home Wi-Fi / battery / laptop media | Hearth sensors (future daemon or stubs) | Trigger automations |
| House lights, scenes, HVAC, speakers | HA | Actions |

## Design checklist

Before writing YAML, answer:

1. **Trigger entity** — one of `binary_sensor.omarchy_wifi_home`, `binary_sensor.omarchy_docked`, `sensor.omarchy_battery`, `media_player.omarchy_laptop` (or user-approved house entities).
2. **Debounce** — leave-home and Wi-Fi need `for:` (default suggest 10 minutes unless user says otherwise).
3. **Condition** — time-of-day, already-home, stub sensors (`hearth_stub`), person entities if they use them.
4. **Action blast radius** — lights OK; locks/covers/garage need confirm (see ha-omarchy safety).
5. **Mode** — prefer `mode: single` for scenes; `restart` only when retrigger should reset a delay.
6. **Idempotent** — turning a lamp on when already on is fine; firing a whole away scene every flap is not.

## Good patterns (summary)

| Intent | Trigger | Notes |
|--------|---------|-------|
| Left home | `wifi_home` → `off` + `for:` | Scene / HVAC away; not laptop lock |
| At desk | `docked` → `on` | Desk lamp, maybe soft notify |
| Left desk | `docked` → `off` | Optional pause `media_player.omarchy_laptop` |
| Low battery | `battery` below N + undocked | `notify.omarchy_desktop` |
| Quiet hours | same triggers + time condition | Skip noisy lights at night |

## Anti-patterns

| Don’t | Do instead |
|-------|------------|
| HA timer that locks/suspends the laptop | Leave hypridle alone |
| Mirror hypridle minutes in HA | Use dock / wifi / battery |
| Treat lock/idle as presence | Wait for daemon; use `wifi_home` / `docked` |
| `wifi_home` off with no `for:` | Add 5–15 minute `for:` |
| Same light from bar plugin + flapping sensor | One owner, or gate with conditions |
| Security actions on stub entities | Only after live sensors; check `hearth_stub` |

## How to author with the agent

1. Confirm canonical entity_ids (`ha-omarchy` / `entities.md`).
2. Ask which house targets (scene, lamp, climate) if unknown — do not invent room names.
3. Draft YAML; keep aliases prefixed `Omarchy …` so they are easy to find.
4. Call out stubs vs live sensors in the draft notes.
5. Do not paste long-lived tokens into automation YAML.

## References

- `references/playbooks.md` — full YAML playbooks and variation notes
- `skills/ha-omarchy/references/automations.md` — short sketches + anti-pattern table
- `skills/ha-omarchy/references/entities.md` — entity contract
