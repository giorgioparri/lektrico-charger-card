import { LitElement, html, nothing } from 'lit';
import { bestLanguage, localize } from './translations/index.js';
import { DEFAULT_LAST_SESSION_DAYS } from './const.js';

// GUI editor for the main options. Advanced options (actions, entity
// overrides, per-state LED colors, ...) remain YAML-only and are kept
// untouched by the editor.

const fireEvent = (node, type, detail = {}) => {
  const event = new Event(type, { bubbles: true, composed: true });
  event.detail = detail;
  node.dispatchEvent(event);
};

// Options whose absence means `true`/`false`: pre-filled so the toggles
// reflect the effective value, stripped again when left at the default.
const BOOL_DEFAULTS = {
  show_leds: true,
  show_stats: true,
  show_quick_actions: true,
  show_name: true,
  show_parameters: true,
  show_info: true,
  show_actions: true,
  last_session: true,
};

// Non-boolean options with a default: pre-filled so the field shows the
// effective value, stripped again when left at the default.
const VALUE_DEFAULTS = {
  last_session_days: DEFAULT_LAST_SESSION_DAYS,
};

const BASE_SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'sensor' } } },
  { name: 'name', selector: { text: {} } },
  { name: 'location', selector: { text: {} } },
  { name: 'substatus_entity', selector: { entity: {} } },
  { name: 'meter_entity', selector: { entity: {} } },
  {
    name: 'compact',
    selector: {
      select: {
        mode: 'list',
        options: [
          { value: '', label: 'Standard' },
          { value: 'compact', label: 'Compact' },
          { value: 'ultra', label: 'Ultra compact' },
        ],
      },
    },
  },
  {
    name: '',
    type: 'grid',
    schema: [
      { name: 'show_leds', selector: { boolean: {} } },
      { name: 'show_stats', selector: { boolean: {} } },
      { name: 'show_quick_actions', selector: { boolean: {} } },
      { name: 'show_name', selector: { boolean: {} } },
      { name: 'show_parameters', selector: { boolean: {} } },
      { name: 'show_info', selector: { boolean: {} } },
      { name: 'show_actions', selector: { boolean: {} } },
    ],
  },
  {
    name: 'language',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: '', label: 'Auto' },
          { value: 'en', label: 'English' },
          { value: 'de', label: 'Deutsch' },
          { value: 'fr', label: 'Français' },
          { value: 'it', label: 'Italiano' },
          { value: 'nl', label: 'Nederlands' },
          { value: 'sv', label: 'Svenska' },
          { value: 'da', label: 'Dansk' },
          { value: 'nb', label: 'Norsk bokmål' },
          { value: 'ro', label: 'Română' },
          { value: 'es', label: 'Español' },
        ],
      },
    },
  },
  { name: 'image', selector: { text: {} } },
];

// The "last session" options get a panel of their own: they are about
// what the stats show between sessions, not about which parts of the card
// are visible, and a toggle lost at the end of the show_* grid went
// unnoticed. The lookback field only appears while the feature is on.
// `name: ''` keeps the panel's fields at the top level of the config.
export const buildSchema = (lang, config = {}) => {
  const enabled = config.last_session !== false;
  const lastSession = {
    name: '',
    type: 'expandable',
    title: localize(lang, 'editor', 'last_session_section'),
    icon: 'mdi:history',
    expanded: true,
    schema: [
      { name: 'last_session', selector: { boolean: {} } },
      ...(enabled
        ? [
            {
              name: 'last_session_days',
              selector: {
                number: { min: 1, max: 90, step: 1, mode: 'box', unit_of_measurement: 'd' },
              },
            },
          ]
        : []),
    ],
  };
  const schema = [...BASE_SCHEMA];
  // right after the show_* grid
  const gridIndex = schema.findIndex((s) => s.type === 'grid');
  schema.splice(gridIndex + 1, 0, lastSession);
  return schema;
};

class LektricoChargerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  setConfig(config) {
    this._config = config;
  }

  get _lang() {
    return bestLanguage(this.hass?.language);
  }

  _computeLabel = (schema) =>
    localize(this._lang, 'editor', schema.name);

  _computeHelper = (schema) =>
    schema.name === 'last_session_days'
      ? localize(this._lang, 'editor', 'last_session_days_helper')
      : undefined;

  // Convert compact (true/false/'ultra') to the select string value.
  _compactToStr(compact) {
    if (compact === 'ultra') return 'ultra';
    if (compact === true) return 'compact';
    return '';
  }

  render() {
    if (!this.hass || !this._config) return nothing;
    const compactStr = this._compactToStr(this._config.compact);
    const data = {
      ...BOOL_DEFAULTS,
      ...VALUE_DEFAULTS,
      ...this._config,
      compact: compactStr,
    };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${buildSchema(this._lang, this._config)}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    const config = { ...ev.detail.value };

    // Map select string back to compact boolean/string.
    const compactStr = config.compact;
    if (!compactStr || compactStr === '') {
      delete config.compact;
    } else if (compactStr === 'compact') {
      config.compact = true;
    }
    // 'ultra' stays as the string 'ultra'.

    for (const [key, def] of Object.entries({ ...BOOL_DEFAULTS, ...VALUE_DEFAULTS })) {
      if (config[key] === def) delete config[key];
    }
    // Cleared field: back to the default rather than an empty value.
    if (config.last_session_days === '' || config.last_session_days == null) {
      delete config.last_session_days;
    }
    for (const key of ['name', 'location', 'substatus_entity', 'meter_entity', 'image', 'language']) {
      if (config[key] === '') delete config[key];
    }
    fireEvent(this, 'config-changed', { config });
  }
}

if (!customElements.get('lektrico-charger-card-editor')) {
  customElements.define('lektrico-charger-card-editor', LektricoChargerCardEditor);
}
