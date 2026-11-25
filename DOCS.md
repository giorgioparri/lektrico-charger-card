# Lektri.co Charger Card — Documentation

- [Charging modes: how the pieces fit together](#charging-modes-how-the-pieces-fit-together)
- [Entities used in the examples](#entities-used-in-the-examples)
- [The mode selector](#the-mode-selector)
- [Mode automations](#mode-automations)
  - [Green mode (solar only)](#green-mode-solar-only)
  - [Green mode with shutdown](#green-mode-with-shutdown)
  - [Zero Cost (solar surplus)](#zero-cost-solar-surplus)
  - [Zero Cost with shutdown](#zero-cost-with-shutdown)
  - [Fixed levels](#fixed-levels)
- [Card configuration for the modes](#card-configuration-for-the-modes)
- [Using an input_text instead](#using-an-input_text-instead)
- [Three-phase & energy meter notes](#three-phase--energy-meter-notes)
- [LED states](#led-states)
- [Adding a language](#adding-a-language)

## Charging modes: how the pieces fit together

A *charging mode* is just an automation that keeps adjusting the charger's
dynamic current limit (`number.…_dynamic_limit`) while the car charges —
for example following your solar production. The card ties everything
together:

1. each mode is an **automation**; enabling it activates the mode;
2. a small **mode selector** automation guarantees that only one mode is
   enabled at a time;
3. the card's **actions** enable a mode with one tap and highlight the
   active one;
4. the card shows the active mode under the charger status
   (**derived substatus** — no helper entity required).

## Entities used in the examples

Replace these with your own:

| Entity | Meaning |
| ------ | ------- |
| `sensor.solar_production_power` | current PV production (W) |
| `sensor.house_consumption_power` | current house consumption (W), charger excluded |
| `number.1p7k_dynamic_limit` | the charger's dynamic current limit |
| `sensor.1p7k_voltage` | the charger's mains voltage |
| `sensor.1p7k_state` | the charger's state sensor |

Two useful facts about the charger, from the dynamic-limit entity:
its range is **6–32 A per phase** (on the 7.4 kW and the 22 kW models
alike), and setting it to **0 suspends charging** — that is what the
"with shutdown" variants below rely on when there is not enough sun.

## The mode selector

One automation that, whenever a mode is switched on, switches the other
modes off. This is what makes the card's chips and the derived substatus
behave like a radio group.

```yaml
- alias: "Charger — mode selector"
  triggers:
    - trigger: state
      entity_id:
        - automation.charger_green_mode
        - automation.charger_green_mode_shutdown
        - automation.charger_zero_cost
        - automation.charger_zero_cost_shutdown
        - automation.charger_standard_16a
        - automation.charger_low_10a
      from: "off"
      to: "on"
  actions:
    - variables:
        modes:
          - automation.charger_green_mode
          - automation.charger_green_mode_shutdown
          - automation.charger_zero_cost
          - automation.charger_zero_cost_shutdown
          - automation.charger_standard_16a
          - automation.charger_low_10a
    - action: automation.turn_off
      target:
        entity_id: >
          {{ expand(modes) | selectattr('state', 'eq', 'on')
             | map(attribute='entity_id')
             | reject('eq', trigger.entity_id) | list }}
  mode: single
```

> Add every mode automation to **both** lists when you create new ones.

## Mode automations

All the "solar" modes share the same skeleton: trigger on the power
sensors, run only while the charger is `charging`, compute the target
amps from a template, clamp them to 6–32 A, and write them to the
dynamic limit.

### Green mode (solar only)

Charge with whatever the panels produce, never below the 6 A minimum.

```yaml
- alias: "Charger — Green mode"
  triggers:
    - trigger: state
      entity_id:
        - sensor.solar_production_power
        - sensor.1p7k_voltage
  conditions:
    - condition: state
      entity_id: sensor.1p7k_state
      state: charging
  actions:
    - action: number.set_value
      target:
        entity_id: number.1p7k_dynamic_limit
      data:
        value: >
          {% set amps = ((states('sensor.solar_production_power') | int(0)) /
                         (states('sensor.1p7k_voltage') | int(230))) | int %}
          {{ [6, [amps, 32] | min] | max }}
  mode: single
```

### Green mode with shutdown

Same, but when production drops below the 6 A minimum the limit goes to
`0` and charging is suspended instead of drawing from the grid.

```yaml
    # …same triggers/conditions as Green mode…
    - action: number.set_value
      target:
        entity_id: number.1p7k_dynamic_limit
      data:
        value: >
          {% set amps = ((states('sensor.solar_production_power') | int(0)) /
                         (states('sensor.1p7k_voltage') | int(230))) | int %}
          {{ 0 if amps < 6 else [amps, 32] | min }}
```

### Zero Cost (solar surplus)

Charge only with the energy the house is *not* using.

```yaml
- alias: "Charger — Zero Cost"
  description: "Charge with the PV energy not consumed by the house"
  triggers:
    - trigger: state
      entity_id:
        - sensor.solar_production_power
        - sensor.house_consumption_power
        - sensor.1p7k_voltage
  conditions:
    - condition: state
      entity_id: sensor.1p7k_state
      state: charging
  actions:
    - action: number.set_value
      target:
        entity_id: number.1p7k_dynamic_limit
      data:
        value: >
          {% set surplus = (states('sensor.solar_production_power') | int(0)) -
                           (states('sensor.house_consumption_power') | int(0)) %}
          {% set amps = (surplus / (states('sensor.1p7k_voltage') | int(230))) | int %}
          {{ [6, [amps, 32] | min] | max }}
  mode: single
```

### Zero Cost with shutdown

As above, with `{{ 0 if amps < 6 else [amps, 32] | min }}` as the value —
below the 6 A minimum, charging pauses rather than importing from the
grid.

### Fixed levels

The simplest modes: when enabled, set a fixed limit once. The trigger is
the automation itself being switched on (by the card chip).

```yaml
- alias: "Charger — Standard 16A"
  triggers:
    - trigger: state
      entity_id: automation.charger_standard_16a
      from: "off"
      to: "on"
  actions:
    - action: number.set_value
      target:
        entity_id: number.1p7k_dynamic_limit
      data:
        value: 16
  mode: single

- alias: "Charger — Low 10A"
  triggers:
    - trigger: state
      entity_id: automation.charger_low_10a
      from: "off"
      to: "on"
  actions:
    - action: number.set_value
      target:
        entity_id: number.1p7k_dynamic_limit
      data:
        value: 10
  mode: single
```

## Card configuration for the modes

Each chip enables its automation; the mode selector disables the others;
the card highlights the enabled one and shows its text as substatus.

```yaml
type: custom:lektrico-charger-card
entity: sensor.1p7k_state
actions:
  - text: Green Mode
    icon: mdi:leaf
    entity: automation.charger_green_mode
    service: automation.turn_on
  - text: Green + Shutdown
    icon: mdi:leaf-off
    entity: automation.charger_green_mode_shutdown
    service: automation.turn_on
  - text: Zero Cost
    icon: mdi:currency-eur
    entity: automation.charger_zero_cost
    service: automation.turn_on
  - text: Zero Cost + Shutdown
    icon: mdi:currency-eur-off
    entity: automation.charger_zero_cost_shutdown
    service: automation.turn_on
  - text: Standard 16A
    icon: mdi:battery-medium
    entity: automation.charger_standard_16a
    service: automation.turn_on
  - text: Low 10A
    icon: mdi:battery-low
    entity: automation.charger_low_10a
    service: automation.turn_on
```

Options: `substatus: "TEXT"` on an action overrides the text shown as
substatus, `substatus: false` excludes the action from it, and
`substatus_from_actions: false` turns the mechanism off entirely.

## Using an input_text instead

If you prefer to manage the mode label yourself (or your automations are
not mutually exclusive), keep an `input_text` helper updated from your
automations (`input_text.set_value` as their last step) and point the
card at it — it always takes precedence over the derived substatus:

```yaml
type: custom:lektrico-charger-card
entity: sensor.1p7k_state
substatus_entity: input_text.charger_mode
```

## Three-phase & energy meter notes

- **Three-phase discovery is automatic.** A 3P22K/Tri charger's device
  entities include `voltage_l1/l2/l3` and `current_l1/l2/l3` instead of
  the single `voltage`/`current` sensors; the card detects them and
  switches the default side columns to the three-phase values with no
  configuration.
- **The energy meter is opt-in, on purpose.** `meter_entity` is never
  guessed from the charger's device — you set it explicitly. This
  matters because the load-balancing chips only make sense for
  Lektri.co's own EM/3EM meter: they call `select.select_option` on the
  `lb_mode` entity the *official* `lektrico` integration creates for that
  meter. If you point `meter_entity` at some other brand's meter (or at
  an entity that doesn't expose `lb_mode`), the load-balancing chips
  simply won't appear — no `lb_mode` entity, no chips, nothing breaks.
  Breaker current / meter power rows behave the same way: they only show
  up if the referenced device actually exposes those entities.
- In short: quantity-of-features is capability-driven, not
  brand-assumption-driven. There's no scenario where a third-party meter
  gets offered load-balancing controls it doesn't support.

## LED states

The colors/animations below are the card's defaults, taken from the
manufacturer's manual, and can be overridden per state with `led_states`
(see the README's options table). "Pulse" means the whole cross blinks;
"steady" means it stays lit with no animation; "blinking (top bar only)"
means just the top segment flashes, the rest stay dim.

| Device LED | Meaning (per the manual) | Card state | Implemented |
| --- | --- | --- | --- |
| Green, steady | Ready but not connected to WiFi | *(repurposed)* `unavailable` / `unknown` | ✅ — closest equivalent to "HA can't confirm the device is reachable" |
| Green, pulsing | Available, not in use | `available` | ✅ |
| Blue, steady | Connected to the car, not charging | `connected` | ✅ |
| Violet, steady | Connected, waiting for remote-server authorization | `need_auth` | ✅ |
| Violet, pulsing | RFID tag learning mode | — | ❌ not implemented — no matching integration state |
| White, rotating | Charging (speed follows the current) | `charging` | ✅ |
| White, steady | Charging with compatibility mode on (1P7K/One) | `charging` + compatibility switch on | ✅ — override with `led_states.charging_compatibility` |
| White, top bar only, blinking | Paused | `paused` / `paused_by_scheduler` | ✅ |
| Red, steady | Generic error — contact support | `error` | ✅ |
| Red, pulsing | Charger locked | `locked` | ✅ |
| Yellow, steady | Firmware update in progress | `updating_firmware` | ✅ |
| Yellow, pulsing (vertical bars only) | Factory reset in progress | — | ❌ not implemented — no matching integration state |

The two unimplemented rows are transient, device-only conditions with no
corresponding value on the `state` sensor the `lektrico` integration
exposes, so the card has nothing to bind them to — they're listed here
only for completeness.

## Adding a language

Built-in translations (all fall back to English for missing keys):

| Code | Language |
| ---- | -------- |
| `en` | English |
| `it` | Italiano |
| `de` | Deutsch |
| `fr` | Français |
| `nl` | Nederlands |
| `sv` | Svenska |
| `da` | Dansk |
| `nb` | Norsk bokmål |
| `ro` | Română |
| `es` | Español |

To add another language, translations live in [`src/translations/`](src/translations/):

1. copy `en.js` to `<language-code>.js` (e.g. `pt.js`) and translate the
   values — any missing key falls back to English;
2. register it in [`src/translations/index.js`](src/translations/index.js)
   (`import pt from './pt.js';` and add it to `LANGUAGES`);
3. add it to the language dropdown in `src/editor.js`;
4. run `npm run build` and open a pull request.
