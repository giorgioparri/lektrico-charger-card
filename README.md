<p align="center">
  <img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/HEAD/images/logo.png" width="140" alt="Lektri.co Charger Card" />
</p>

# Lektri.co Charger Card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/default)
[![GitHub Release](https://img.shields.io/github/release/giorgioparri/lektrico-charger-card.svg)](https://github.com/giorgioparri/lektrico-charger-card/releases)
[![Validate](https://github.com/giorgioparri/lektrico-charger-card/actions/workflows/validate.yml/badge.svg)](https://github.com/giorgioparri/lektrico-charger-card/actions/workflows/validate.yml)
[![License](https://img.shields.io/github/license/giorgioparri/lektrico-charger-card.svg)](https://github.com/giorgioparri/lektrico-charger-card/blob/main/LICENSE)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=giorgioparri&repository=lektrico-charger-card&category=plugin)

A Home Assistant Lovelace card built specifically for **Lektri.co EV
chargers** — 1P7K / One (single-phase, 7.4 kW) and 3P22K / Tri
(three-phase, 22 kW), with optional EM / 3EM energy meter — on top of the
official [`lektrico`](https://www.home-assistant.io/integrations/lektrico/)
core integration. Designed as a rethink of the generic
[charger-card](https://github.com/tmjo/charger-card) with the Lektri.co
hardware in mind.

## Features

- 📱 **Fully responsive** — the charger is drawn as an SVG, it scales with
  the card width and never overlaps the surrounding text, on any device.
- 💡 **Real LED behaviour** — the four LED bars mirror the physical device,
  per the manufacturer's manual: green pulsing when available, blue when
  connected and waiting for vehicle recognition, violet while waiting for
  remote-server authorization, white spinning while charging (the spin
  speed follows the actual current, normalized to the charger's real
  maximum), a single blinking white bar while paused, red on error, red
  pulsing when locked, yellow during a firmware update. Colors and
  animations are overridable per state — see
  [DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md#led-states) for the full mapping (including two
  device LED states that have no matching integration state, so the card
  can't display them).
- 🔌 **Three-phase & energy meter aware** — 3P22K/Tri chargers show the
  three per-phase currents and voltages automatically (per the
  [integration's docs](https://www.home-assistant.io/integrations/lektrico/));
  attach a paired EM/3EM meter with `meter_entity` for load-balancing mode
  chips, breaker current and meter power.
- 🎚️ **No overlapping dropdowns** — charging current and LED brightness are
  sliders with preset chips that wrap on small screens; every value is
  always reachable, and presets outside the charger's allowed range are
  hidden automatically.
- 🔍 **Auto-discovery** — point the card at the charger's state sensor and
  every other entity of the device is found automatically through the
  entity registry. Works with renamed and localized entity ids; everything
  can be overridden.
- 🚨 **Error handling** — on error, a red banner lists the active
  diagnostic sensors (overheating, RCD, overcurrent, …) with friendly
  names, and the stats row switches to the error view.
- ▶️ **Configurable quick actions** — up to 4 one-tap buttons picked from
  start/stop/authentication/lock, the auto-discovered device actions, or
  your own custom actions.
- 🗂️ **Compact, lateral section toggles** — Parameters / Information /
  Actions open from small icon buttons beside the status text (not a
  full-width accordion), any number can be open at once, and the card can
  be reduced to a purely informative view by disabling all of them.
- ⚡ **Charging modes** — your own automations (solar charging, zero cost,
  fixed levels…) as chips, graphically distinct from the auto-discovered
  device actions (reboot, load balancing, …); the active mode is shown
  under the status automatically. See [DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md) for ready-made
  automations.
- 🖱️ **GUI editor** — the main options are configurable from the dashboard
  UI; advanced options remain available in YAML.
- 🌍 **Localized** — English, Italian, German, French, Dutch, Swedish, Danish,
  Norwegian, Romanian and Spanish out of the box
  ([add a language](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md#adding-a-language)), every text overridable.
- 🌗 Light & dark theme aware; works in narrow dashboard columns thanks to
  CSS container queries; a **compact view** for tight dashboards and an
  **ultra-compact view** (`compact: ultra`) for fully informative one-liners.

## Screenshots

<table>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/charging.png" width="320" alt="Charging"><br>Charging (dark)</td>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/parameters.png" width="320" alt="Parameters"><br>Parameters</td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/error.png" width="320" alt="Error"><br>Error state</td>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/light.png" width="320" alt="Actions"><br>Actions (light)</td>
  </tr>
  <tr>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/compact.png" width="320" alt="Compact"><br>Compact</td>
    <td align="center"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/compact-actions.png" width="320" alt="Compact actions"><br>Compact — actions open</td>
  </tr>
  <tr>
    <td align="center" colspan="2"><img src="https://raw.githubusercontent.com/giorgioparri/lektrico-charger-card/v1.6.3/images/ultra-compact.png" width="320" alt="Ultra compact"><br>Ultra compact</td>
  </tr>
</table>

## Installation

### Via HACS (recommended)

The card is in the HACS default catalogue: open **HACS**, search for
**Lektri.co Charger Card**, download it and reload when asked. No custom
repository to add.

Or click the badge above to open the card directly in HACS.

### Manual

1. Copy `dist/lektrico-charger-card.js` to `/config/www/`
2. Add the resource: *Settings → Dashboards → Resources* →
   `/local/lektrico-charger-card.js` (JavaScript module)

## Configuration

The card has a **GUI editor** for the main options (entity, name,
location, substatus entity, view toggles, language, custom image).
Minimal YAML — everything else is discovered from the device:

```yaml
type: custom:lektrico-charger-card
entity: sensor.1p7k_state
```

### Full example

When an action has an `entity`, that entity is also used as the default
service target — no need to repeat it in `service_data`. More modes
(Zero Cost and the shutdown variants, with the matching automations) are
in [DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md).

```yaml
type: custom:lektrico-charger-card
entity: sensor.1p7k_state
name: Lektri.co
location: Carport
current_presets: [6, 10, 13, 16, 20, 25, 32]
brightness_presets: [25, 50, 75, 100]
actions:
  - text: Green Mode
    icon: mdi:leaf
    entity: automation.charger_green_mode
    service: automation.turn_on
  - text: Green + Shutdown
    icon: mdi:leaf-off
    entity: automation.charger_green_mode_shutdown
    service: automation.turn_on
  - text: Standard 16A
    icon: mdi:battery-medium
    service: number.set_value
    service_data:
      entity_id: number.1p7k_dynamic_limit
      value: 16
  - text: Low 10A
    icon: mdi:battery-low
    service: number.set_value
    service_data:
      entity_id: number.1p7k_dynamic_limit
      value: 10
```

### Sections & quick actions

Parameters, Information and Actions open from small icon buttons beside
the status text — like the reference charger-card, not a full-width
accordion — so the card stays compact when everything is collapsed. Any
number of sections can be open at the same time; their content stacks in
its usual place (below the quick actions), separated by a divider line.
Each section can be hidden entirely with `show_parameters: false` /
`show_info: false` / `show_actions: false` — turn off all three (and
`show_quick_actions: false`) for a purely informative card with no
interaction at all.

The 4 quick-action buttons default to start/stop/authentication/lock, but
can be replaced with `quick_actions`, a list of up to 4 ids picked from:
the built-ins (`start`, `stop`, `authentication`, `lock`), the
auto-discovered device actions (e.g. `force_single_phase`,
`lb_mode:power` — one-off actions like `reboot` are excluded), and your
own custom actions (referenced by an `id` you set on them, or
`custom:<index>` for the position in `actions:`):

```yaml
quick_actions: [start, stop, force_single_phase, lb_mode:green]
```

### Three-phase chargers & energy meter

3P22K/Tri chargers expose `voltage_l1/l2/l3` and `current_l1/l2/l3`
instead of the single-phase sensors; the card discovers them
automatically and shows the three currents / voltages in place of the
single ones, with no configuration needed. The `force_single_phase`
switch, when present, appears as a Parameters toggle and a device chip.

A paired Lektri.co energy meter (EM/3EM) is a **separate device** and is
never attached automatically — point `meter_entity` at any of its
entities to enable load-balancing chips, breaker current and meter power:

```yaml
meter_entity: select.em_lb_mode
```

The load-balancing chips only appear if the device behind `meter_entity`
actually exposes the `lb_mode` select — see
[DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md#three-phase--energy-meter-notes) for a note on
third-party meters.

### Substatus (active charging mode)

The line under the status shows the active charging mode. Two mechanisms,
in order of precedence:

1. **`substatus_entity`** — any entity (e.g. an `input_text` that your
   automations update) whose state is displayed as-is.
2. **Derived from actions** (default) — every action that has an `entity`
   whose state is `on` contributes its `text` (or its `substatus` string).
   This works out of the box when each mode automation *enables itself and
   disables the sibling modes* (see the
   [mode selector](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md#the-mode-selector) automation), so exactly one
   is `on` at a time. Set `substatus: false` on an action to exclude it,
   or `substatus_from_actions: false` to disable the mechanism.

### Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `entity` | string | **required** | The charger state sensor (`sensor.<device>_state`). |
| `name` | string | friendly name | Charger name shown above the status. |
| `location` | string | — | Shown next to the name. |
| `substatus_entity` | string | — | Any entity whose state is shown under the status (e.g. an `input_text` describing the active charging mode). Takes precedence over the actions-derived substatus. |
| `substatus_from_actions` | bool | `true` | Derive the substatus from the actions whose `entity` is `on` (see *Substatus* above). |
| `compact` | `false` / `true` / `'ultra'` | `false` | `true`: smaller image beside the status, location/power hidden, Parameters/Information unavailable. `'ultra'`: purely informative one-row layout — image + state/substatus/limit in the centre, current/energy/temperature on the right; no sections, no stats bar; an optional start/stop button fits inside the centre column (hidden by `show_quick_actions: false`; icon-only on very narrow cards). |
| `meter_entity` | string | — | Any entity of a paired energy meter (EM/3EM) device — see *Three-phase chargers & energy meter*. Never auto-attached. |
| `quick_actions` | list | `[start, stop, authentication, lock]` (only the ones that exist) | Up to 4 ids for the quick-action buttons — see *Sections & quick actions*. |
| `show_name` / `show_stats` / `show_quick_actions` / `show_image` / `show_parameters` / `show_info` / `show_actions` | bool | `true` | Toggle individual areas of the card. |
| `show_leds` | bool | `true` | Draw the LED cross. |
| `image` | string | built-in SVG | Path/URL of a custom charger image (e.g. `/local/lektri.co.png`). The LED cross is overlaid on top (see `led_overlay_position`). |
| `led_overlay_position` | object | centered | `{left, top, size}` CSS values for the LED overlay on a custom image, e.g. `{left: 28%, top: 25%, size: 44%}`. |
| `led_states` | object | device-like | Override LED color/animation per state: `charging: {color: '#ffffff', animation: spin}`. Animations: `spin`, `pulse`, `top` (only the top bar lit, steady — the default for `paused`), `none`. |
| `led_spin` | object | `{slowest: 6.0, fastest: 2.0}` | Rotation period (seconds) of the white charging animation: `slowest` at minimal current, `fastest` at the charger's maximum. The maximum is read from the dynamic-limit entity (6–32 A per phase on both the 7.4 kW and the 22 kW models), so it adapts to derated installations too. |
| `state_text` | object | it/en defaults | Override the status text per state (`available`, `connected`, `need_auth`, `charging`, `paused`, `paused_by_scheduler`, `locked`, `error`, `updating_firmware`). |
| `language` | string | HA language | Force a UI language. Built-in codes: `en`, `it`, `de`, `fr`, `nl`, `sv`, `da`, `nb`, `ro`, `es`. |
| `current_presets` | list | `[6,10,13,16,20,25,32]` | Preset chips for the charging current. Values outside the charger's allowed range are hidden. |
| `brightness_presets` | list | `[10,25,50,75,100]` | Preset chips for the LED brightness. |
| `info_left` / `info_right` | list | current(s)+limit / voltage(s)+power | Items beside the image. Each item is a role name (`current`, `dynamic_limit`, `voltage`, `power`, `current_l1`/`l2`/`l3`, `voltage_l1`/`l2`/`l3`, …), an entity id, or `{entity, label, icon, decimals}`. `decimals` forces fixed decimals on numeric values. Three-phase chargers default to the three currents/voltages instead of the single ones. |
| `info_items` | list | installation current, lifetime energy, limit reason, temperature (+ breaker current, meter power when a meter is attached) | Rows of the *Information* section (same item format). |
| `stats` | list or object | energy, time, temperature | Bottom stats. Either a list, or `{default: [...], charging: [...], error: [...]}` per state. |
| `actions` | list | — | Chips in the *Actions* section: `{id, text, icon, service, service_data, target, entity, confirm, substatus}`. `id` lets a `quick_actions` entry reference this action; `entity` highlights the chip when its state is `on` and doubles as the default service target; `confirm` asks before running; `substatus` customizes (string) or suppresses (`false`) the chip's contribution to the derived substatus. |
| `show_device_actions` | bool | `true` | Hide the auto-discovered device chips (reboot, load balancing, single-phase toggle, …) from the Actions section, keeping only custom ones. |
| `entities` | object | auto | Override auto-discovery per role: `entities: {power: sensor.my_power, dynamic_limit: number.my_limit, errors: [binary_sensor.a, …]}`. Roles: `state`, `charging_time`, `session_energy`, `lifetime_energy`, `power`, `voltage`, `current`, `voltage_l1`/`l2`/`l3`, `current_l1`/`l2`/`l3`, `installation_current`, `limit_reason`, `temperature`, `dynamic_limit`, `led_brightness`, `authentication`, `lock`, `charge_start`, `charge_stop`, `reboot`, `schedule_override`, `force_single_phase`, `update`, `errors`. |
| `section_titles` | object | localized | Override the section tooltips/titles: `{parameters, info, actions}`. |

### How auto-discovery works

The card resolves the device of `entity` through the entity registry and
then matches each role by, in order:

1. explicit override in `entities:`
2. the integration's `translation_key` (language independent, survives renames)
3. entity id (exact prefix + suffix first, then suffix; only English
   **and** Italian suffixes are recognized here — `_dynamic_limit`/
   `_limite_dinamico`, `_voltage`/`_tensione`, … — since those are the
   only languages the core `lektrico` integration ships, and are what
   entity ids get localized to. This is unrelated to the card's own UI
   language, below, which covers 10 languages.)
4. unique device class among the device's entities

Step 2 already covers every language HA supports (the registry key isn't
translated), so step 3 only matters if you renamed an entity by hand.
The paired energy meter (`meter_entity`) uses the same matching engine,
scoped to its own device, for the `lb_mode`, `breaker_current`,
`meter_power` and `meter_reboot` roles.

## Automations

Ready-made automations for the charging modes (solar Green mode, Zero
Cost, shutdown variants, fixed levels) and the mode-selector pattern are
documented in **[DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md)**.

## Development & testing

```bash
npm install
npm run build   # bundles src/ into dist/lektrico-charger-card.js
npm test        # jsdom smoke test
```

`demo/index.html` renders the card against a fake Home Assistant instance —
open it with any static file server (`npx serve .`) to try states, LED
animations and the responsive layout without a running HA. Translations
live in `src/translations/` — see
[DOCS.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/DOCS.md#adding-a-language) to add a language.

## Changelog

See [CHANGELOG.md](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/CHANGELOG.md).

## License

GPL-3.0-or-later — see [LICENSE](https://github.com/giorgioparri/lektrico-charger-card/blob/HEAD/LICENSE)

## Disclaimer

This is an independent project, not affiliated with or endorsed by
LEKTRI.CO.

## Acknowledgments

Built with the assistance of [Claude](https://claude.ai) by Anthropic.