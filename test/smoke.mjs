// Smoke test: render lektrico-charger-card in jsdom with a fake hass.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

for (const key of [
  'window', 'document', 'HTMLElement', 'HTMLImageElement', 'customElements',
  'CustomEvent', 'Event', 'Node', 'navigator', 'ShadowRoot', 'Element',
  'requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver',
  'getComputedStyle', 'CSSStyleSheet', 'DocumentFragment', 'Document',
]) {
  if (dom.window[key] !== undefined && globalThis[key] === undefined) {
    globalThis[key] = dom.window[key];
  }
}
globalThis.window = dom.window;

await import('../dist/lektrico-charger-card.js');

const mk = (state, attributes = {}) => ({ state, attributes, entity_id: '' });
const states = {
  'sensor.1p7k_state': mk('charging', { friendly_name: '1P7K State' }),
  'sensor.1p7k_charging_time': mk('3725', { device_class: 'duration', unit_of_measurement: 's' }),
  'sensor.1p7k_energia': mk('4.2', { device_class: 'energy', unit_of_measurement: 'kWh' }),
  'sensor.1p7k_lifetime_energy': mk('1234', { unit_of_measurement: 'kWh' }),
  'sensor.1p7k_potenza': mk('3.6', { device_class: 'power', unit_of_measurement: 'kW' }),
  'sensor.1p7k_tensione': mk('234.8', { device_class: 'voltage', unit_of_measurement: 'V' }),
  'sensor.1p7k_corrente': mk('16', { device_class: 'current', unit_of_measurement: 'A' }),
  'sensor.1p7k_installation_current': mk('32', { unit_of_measurement: 'A' }),
  'sensor.1p7k_limit_reason': mk('installation_current', {}),
  'sensor.1p7k_temperatura': mk('45.9', { device_class: 'temperature', unit_of_measurement: '°C' }),
  'number.1p7k_limite_dinamico': mk('16', { min: 6, max: 32, step: 1, unit_of_measurement: 'A' }),
  'number.1p7k_led_brightness': mk('100', { min: 10, max: 100, step: 5, unit_of_measurement: '%' }),
  'switch.1p7k_autenticazione': mk('on', {}),
  'switch.1p7k_blocca': mk('off', {}),
  'button.1p7k_charge_start': mk('unknown', {}),
  'button.1p7k_charge_stop': mk('unknown', {}),
  'binary_sensor.1p7k_overheating': mk('on', { friendly_name: 'Overheating' }),
  'binary_sensor.1p7k_rcd_error': mk('off', {}),
  'automation.caricatore_costo_zero': mk('on', {}),
  'input_text.caricatore': mk('COSTO ZERO', {}),
};
for (const [k, v] of Object.entries(states)) v.entity_id = k;

// entity registry with translation keys (as modern HA exposes it)
const tk = {
  'sensor.1p7k_state': 'state',
  'sensor.1p7k_charging_time': 'charging_time',
  'sensor.1p7k_energia': 'session_energy',
  'sensor.1p7k_lifetime_energy': 'lifetime_energy',
  'sensor.1p7k_potenza': 'instant_power',
  'sensor.1p7k_tensione': 'voltage',
  'sensor.1p7k_corrente': 'current',
  'sensor.1p7k_installation_current': 'installation_current',
  'sensor.1p7k_limit_reason': 'limit_reason',
  'sensor.1p7k_temperatura': 'temperature',
  'number.1p7k_limite_dinamico': 'dynamic_limit',
  'number.1p7k_led_brightness': 'led_max_brightness',
  'switch.1p7k_autenticazione': 'authentication',
  'switch.1p7k_blocca': 'lock',
  'button.1p7k_charge_start': 'charge_start',
  'button.1p7k_charge_stop': 'charge_stop',
  'binary_sensor.1p7k_overheating': 'overheating',
  'binary_sensor.1p7k_rcd_error': 'rcd_error',
};
const entities = {};
for (const [eid, key] of Object.entries(tk)) {
  entities[eid] = { entity_id: eid, device_id: 'dev1', platform: 'lektrico', translation_key: key };
}

const calls = [];
const hass = {
  language: 'it',
  states,
  entities,
  callService: (d, s, data) => calls.push([d, s, data]),
  formatEntityState: (st) =>
    `${st.state}${st.attributes.unit_of_measurement ? ' ' + st.attributes.unit_of_measurement : ''}`,
};

const card = document.createElement('lektrico-charger-card');
card.setConfig({
  entity: 'sensor.1p7k_state',
  name: 'Lektri.co',
  location: 'Tettoia Macchine',
  substatus_entity: 'input_text.caricatore',
  actions: [
    { text: 'Costo Zero', icon: 'mdi:currency-eur', service: 'automation.turn_on', entity: 'automation.caricatore_costo_zero' },
  ],
});
card.hass = hass;
document.body.appendChild(card);
await card.updateComplete;

const sr = card.shadowRoot;
const text = sr.textContent.replace(/\s+/g, ' ');
const assert = (cond, msg) => {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; }
  else console.log('ok:', msg);
};

assert(sr.querySelector('.charger-svg'), 'SVG charger rendered');
assert(text.includes('IN CARICA') || text.includes('In carica'), 'state text localized (In carica)');
assert(text.includes('Lektri.co — Tettoia Macchine'), 'name + location');
assert(text.includes('COSTO ZERO'), 'substatus shown');
assert(text.includes('01:02:05'), 'charging time formatted HH:MM:SS');
assert(text.includes('4.2 kWh'), 'session energy shown');
assert(text.includes('45.9 °C'), 'temperature shown');
assert(text.includes('234.8 V'), 'voltage shown');
assert(text.includes('16.0 A'), 'instantaneous current with 1 decimal');
assert(!sr.querySelector('.side-info.left')?.textContent.includes('32'), 'left info does not show installation current');
assert(sr.querySelector('.error-banner'), 'error banner visible (overheating on)');
assert(text.includes('Surriscaldamento'), 'error name localized');
const ledWrap = sr.querySelector('.leds.anim-spin');
assert(ledWrap, 'LED spin animation active while charging');
assert(/--led-color:\s*#ffffff/.test(ledWrap?.getAttribute('style') || ''), 'LED white while charging');
assert((ledWrap?.getAttribute('style') || '').includes('--led-period'), 'LED period set');

// open parameters section
sr.querySelectorAll('.section-toggle')[0].click();
await card.updateComplete;
const sliders = sr.querySelectorAll('input[type=range]');
assert(sliders.length === 2, 'two sliders (limit + brightness)');
assert(sliders[0].getAttribute('max') === '32', 'limit slider max from entity');
const chips = [...sr.querySelectorAll('.preset-chip')].map((c) => c.textContent.trim());
assert(chips.includes('32 A'), 'preset 32 A present');
assert(chips.includes('6 A'), 'preset 6 A present');
// click preset 25
[...sr.querySelectorAll('.preset-chip')].find((c) => c.textContent.trim() === '25 A').click();
assert(calls.some((c) => c[0] === 'number' && c[1] === 'set_value' && c[2].value === 25 && c[2].entity_id === 'number.1p7k_limite_dinamico'), 'preset click calls number.set_value 25');

// quick actions
const qa = [...sr.querySelectorAll('.qa-button')];
assert(qa.length === 4, 'four quick actions (start/stop/auth/lock)');
assert(qa[0].disabled === true, 'start disabled while charging');
qa[1].click();
assert(calls.some((c) => c[0] === 'button' && c[1] === 'press' && c[2].entity_id === 'button.1p7k_charge_stop'), 'stop presses charge_stop');
qa[3].click();
assert(calls.some((c) => c[0] === 'switch' && c[1] === 'toggle' && c[2].entity_id === 'switch.1p7k_blocca'), 'lock toggles switch');

// info section
sr.querySelectorAll('.section-toggle')[1].click();
await card.updateComplete;
assert(sr.textContent.includes('1234 kWh'), 'lifetime energy in info section');

// actions section
sr.querySelectorAll('.section-toggle')[2].click();
await card.updateComplete;
const chip = sr.querySelector('.action-chip');
assert(chip, 'custom action chip rendered');
assert(chip.classList.contains('active'), 'action chip active (automation on)');
chip.click();
assert(calls.some((c) => c[0] === 'automation' && c[1] === 'turn_on' && c[2].entity_id === 'automation.caricatore_costo_zero'), 'action entity used as default service target');

// available state -> green pulse
hass.states['sensor.1p7k_state'] = { ...states['sensor.1p7k_state'], state: 'available' };
card.hass = { ...hass };
await card.updateComplete;
const t2 = card.shadowRoot.textContent;
assert(t2.includes('Scollegato'), 'available -> Scollegato');
const leds2 = card.shadowRoot.querySelector('.leds.anim-pulse');
assert(leds2 && (leds2.getAttribute('style') || '').includes('#4caf50'), 'available -> green pulse LED');

// error state
hass.states['sensor.1p7k_state'] = { ...states['sensor.1p7k_state'], state: 'error' };
card.hass = { ...hass };
await card.updateComplete;
assert(card.shadowRoot.textContent.includes('Errore'), 'error state text');
const leds3 = card.shadowRoot.querySelector('.leds.anim-none');
assert(leds3 && (leds3.getAttribute('style') || '').includes('#f44336'), 'error -> red LED');
// error stats replaced by active errors
assert([...card.shadowRoot.querySelectorAll('.stat .label')].some((l) => l.textContent.includes('Surriscaldamento')), 'error stats show active errors');

// discovery without registry (fallback by suffix)
const hassNoReg = { ...hass, entities: {} };
const card2 = document.createElement('lektrico-charger-card');
card2.setConfig({
  entity: 'sensor.1p7k_state',
  actions: [
    { text: 'Costo Zero', entity: 'automation.caricatore_costo_zero', service: 'automation.turn_on' },
  ],
});
card2.hass = hassNoReg;
document.body.appendChild(card2);
await card2.updateComplete;
card2.shadowRoot.querySelectorAll('.section-toggle')[0].click();
await card2.updateComplete;
assert(card2.shadowRoot.querySelectorAll('input[type=range]').length === 2, 'suffix-fallback discovery finds numbers (italian entity ids)');
assert(card2.shadowRoot.textContent.includes('234.8 V'), 'suffix-fallback finds voltage (tensione)');
assert(card2.shadowRoot.querySelector('.side-info.left').textContent.includes('16.0 A'), 'suffix-fallback current is sensor.1p7k_corrente, not installation_current');
assert(card2.shadowRoot.querySelector('.substatus')?.textContent.trim() === 'Costo Zero', 'substatus derived from active action entity');


// ---------- paused: only top LED, blinking white ----------
hass.states['sensor.1p7k_state'] = { ...states['sensor.1p7k_state'], state: 'paused' };
card.hass = { ...hass };
await card.updateComplete;
const ledsTop = card.shadowRoot.querySelector('.leds.anim-top');
assert(ledsTop && /--led-color:\s*#ffffff/.test(ledsTop.getAttribute('style') || ''), 'paused -> top LED only, white');

// ---------- three-phase charger + meter + compact ----------
const mk3 = (eid, state, attributes = {}) => ({ entity_id: eid, state, attributes });
const states3 = {
  'sensor.tri_state': mk3('sensor.tri_state', 'charging', {}),
  'sensor.tri_charging_time': mk3('sensor.tri_charging_time', '60', { device_class: 'duration', unit_of_measurement: 's' }),
  'sensor.tri_energy': mk3('sensor.tri_energy', '1.5', { unit_of_measurement: 'kWh' }),
  'sensor.tri_temperature': mk3('sensor.tri_temperature', '40', { device_class: 'temperature', unit_of_measurement: '°C' }),
  'sensor.tri_power': mk3('sensor.tri_power', '11', { device_class: 'power', unit_of_measurement: 'kW' }),
  'sensor.tri_voltage_l1': mk3('sensor.tri_voltage_l1', '231', { unit_of_measurement: 'V' }),
  'sensor.tri_voltage_l2': mk3('sensor.tri_voltage_l2', '232', { unit_of_measurement: 'V' }),
  'sensor.tri_voltage_l3': mk3('sensor.tri_voltage_l3', '233', { unit_of_measurement: 'V' }),
  'sensor.tri_current_l1': mk3('sensor.tri_current_l1', '16', { unit_of_measurement: 'A' }),
  'sensor.tri_current_l2': mk3('sensor.tri_current_l2', '15.5', { unit_of_measurement: 'A' }),
  'sensor.tri_current_l3': mk3('sensor.tri_current_l3', '16.2', { unit_of_measurement: 'A' }),
  'number.tri_dynamic_limit': mk3('number.tri_dynamic_limit', '16', { min: 6, max: 32, step: 1, unit_of_measurement: 'A' }),
  'switch.tri_force_single_phase': mk3('switch.tri_force_single_phase', 'off', {}),
  'button.tri_charge_start': mk3('button.tri_charge_start', 'unknown', {}),
  'button.tri_charge_stop': mk3('button.tri_charge_stop', 'unknown', {}),
  'button.tri_reboot': mk3('button.tri_reboot', 'unknown', {}),
  'select.em_lb_mode': mk3('select.em_lb_mode', 'power', { options: ['disabled', 'power', 'hybrid', 'green'] }),
  'sensor.em_breaker_current': mk3('sensor.em_breaker_current', '40', { unit_of_measurement: 'A' }),
  'sensor.em_power': mk3('sensor.em_power', '3.1', { device_class: 'power', unit_of_measurement: 'kW' }),
  'button.em_reboot': mk3('button.em_reboot', 'unknown', {}),
};
const entities3 = {};
for (const [eid, key] of Object.entries({
  'sensor.tri_state': 'state', 'sensor.tri_charging_time': 'charging_time', 'sensor.tri_energy': 'energy',
  'sensor.tri_temperature': 'temperature', 'sensor.tri_power': 'instant_power',
  'sensor.tri_voltage_l1': 'voltage_l1', 'sensor.tri_voltage_l2': 'voltage_l2', 'sensor.tri_voltage_l3': 'voltage_l3',
  'sensor.tri_current_l1': 'current_l1', 'sensor.tri_current_l2': 'current_l2', 'sensor.tri_current_l3': 'current_l3',
  'number.tri_dynamic_limit': 'dynamic_limit', 'switch.tri_force_single_phase': 'force_single_phase',
  'button.tri_charge_start': 'charge_start', 'button.tri_charge_stop': 'charge_stop', 'button.tri_reboot': 'reboot',
})) entities3[eid] = { entity_id: eid, device_id: 'devTri', platform: 'lektrico', translation_key: key };
for (const [eid, key] of Object.entries({
  'select.em_lb_mode': 'lb_mode', 'sensor.em_breaker_current': 'breaker_current',
  'sensor.em_power': 'power', 'button.em_reboot': 'reboot',
})) entities3[eid] = { entity_id: eid, device_id: 'devEm', platform: 'lektrico', translation_key: key };

const calls3 = [];
const hass3 = {
  language: 'en', states: states3, entities: entities3,
  callService: (d, s, data) => calls3.push([d, s, data]),
  formatEntityState: (st) => st.attributes.unit_of_measurement ? `${st.state} ${st.attributes.unit_of_measurement}` : st.state,
};
const card3 = document.createElement('lektrico-charger-card');
card3.setConfig({ entity: 'sensor.tri_state', meter_entity: 'select.em_lb_mode' });
card3.hass = hass3;
document.body.appendChild(card3);
await card3.updateComplete;
const sr3 = card3.shadowRoot;
const left3 = sr3.querySelector('.side-info.left').textContent;
const right3 = sr3.querySelector('.side-info.right').textContent;
assert(left3.includes('16.0 A') && left3.includes('15.5 A') && left3.includes('16.2 A'), 'three-phase: three currents on the left');
assert(right3.includes('231 V') && right3.includes('232 V') && right3.includes('233 V'), 'three-phase: three voltages on the right');

// device actions: force_single_phase + lb_mode chips + reboots
sr3.querySelectorAll('.section-toggle')[2].click();
await card3.updateComplete;
const deviceChips = [...sr3.querySelectorAll('.action-chip.device')];
assert(deviceChips.length === 7, `7 device chips (single-phase toggle + 4 lb + 2 reboots), got ${deviceChips.length}`);
const lbPower = deviceChips.find((c) => c.textContent.includes('Load balancing: power'));
assert(lbPower?.classList.contains('active'), 'active lb_mode chip highlighted');
deviceChips.find((c) => c.textContent.includes('Load balancing: green')).click();
assert(calls3.some((c) => c[0] === 'select' && c[1] === 'select_option' && c[2].option === 'green' && c[2].entity_id === 'select.em_lb_mode'), 'lb chip selects option on meter');
deviceChips.find((c) => c.textContent.includes('Single phase')).click();
assert(calls3.some((c) => c[0] === 'switch' && c[1] === 'toggle' && c[2].entity_id === 'switch.tri_force_single_phase'), 'single-phase chip toggles switch');

// meter rows in info section
sr3.querySelectorAll('.section-toggle')[1].click();
await card3.updateComplete;
assert(sr3.textContent.includes('Breaker current'), 'meter breaker current in info list');

// ---------- compact mode ----------
const card4 = document.createElement('lektrico-charger-card');
card4.setConfig({
  entity: 'sensor.1p7k_state', compact: true, location: 'Carport',
  actions: [{ text: 'Green Mode', entity: 'automation.caricatore_costo_zero', service: 'automation.turn_on' }],
});
hass.states['sensor.1p7k_state'] = { ...states['sensor.1p7k_state'], state: 'charging' };
card4.hass = { ...hass };
document.body.appendChild(card4);
await card4.updateComplete;
const sr4 = card4.shadowRoot;
assert(sr4.querySelector('.compact-top'), 'compact top layout rendered');
const compactHeaders = sr4.querySelectorAll('.section-toggle');
assert(compactHeaders.length === 1, 'compact: single toggle icon (Actions)');
assert(!sr4.querySelector('.actions-grid'), 'compact: actions collapsed by default');
compactHeaders[0].click();
await card4.updateComplete;
assert(card4.shadowRoot.querySelector('.actions-grid'), 'compact: actions open on demand');
assert(!sr4.textContent.includes('Carport'), 'compact: location hidden');
assert(!sr4.querySelector('.compact-top').textContent.includes('kW'), 'compact: power hidden');
assert(sr4.querySelectorAll('.qa-button').length === 4, 'compact: quick actions available');

// info-only card: all sections disabled
const card5 = document.createElement('lektrico-charger-card');
card5.setConfig({
  entity: 'sensor.1p7k_state', compact: true,
  show_parameters: false, show_info: false, show_actions: false,
  show_quick_actions: false,
  actions: [{ text: 'Green Mode', entity: 'automation.caricatore_costo_zero', service: 'automation.turn_on' }],
});
card5.hass = { ...hass };
document.body.appendChild(card5);
await card5.updateComplete;
assert(!card5.shadowRoot.querySelector('.sections'), 'info-only: no sections at all');
assert(!card5.shadowRoot.querySelector('.quick-actions'), 'info-only: no quick actions');
assert(card5.shadowRoot.querySelector('.stats'), 'info-only: stats still shown');


// ---------- multi-open sections + divider ----------
// parameters(0), info(1), actions(2) are all toggled open above on `card`;
// verify they render simultaneously with a divider between them.
const openBodies = sr.querySelectorAll('.section-body');
assert(openBodies.length === 3, `three sections open simultaneously, got ${openBodies.length}`);
assert(!openBodies[0].classList.contains('divider'), 'first open section has no divider');
assert(openBodies[1].classList.contains('divider') && openBodies[2].classList.contains('divider'), 'subsequent open sections have a divider');
// closing the first (parameters) leaves the other two open
sr.querySelectorAll('.section-toggle')[0].click();
await card.updateComplete;
assert(sr.querySelectorAll('.section-body').length === 2, 'closing one section leaves the others open');
assert(sr.querySelectorAll('.section-toggle')[1].classList.contains('active'), 'still-open toggle stays highlighted');

// ---------- configurable quick actions ----------
const card6 = document.createElement('lektrico-charger-card');
card6.setConfig({
  entity: 'sensor.1p7k_state',
  quick_actions: ['lock', 'authentication'],
  actions: [
    { id: 'green', text: 'Green Mode', icon: 'mdi:leaf', entity: 'automation.caricatore_modalita_green', service: 'automation.turn_on' },
  ],
});
card6.hass = { ...hass };
document.body.appendChild(card6);
await card6.updateComplete;
const qa6 = [...card6.shadowRoot.querySelectorAll('.qa-button')];
assert(qa6.length === 2, `quick_actions picks exactly the 2 requested, got ${qa6.length}`);
assert(qa6.some((b) => b.textContent.includes('Blocco') || b.textContent.includes('Lock')), 'quick_actions: lock present');
assert(!qa6.some((b) => b.textContent.includes('Avvia') || b.textContent.includes('Start')), 'quick_actions: start excluded when not selected');

// custom action + device chip pickable as quick actions, capped at 4
const card7 = document.createElement('lektrico-charger-card');
card7.setConfig({
  entity: 'sensor.tri_state',
  meter_entity: 'select.em_lb_mode',
  quick_actions: ['start', 'stop', 'force_single_phase', 'lb_mode:green', 'lock'],
  actions: [
    { id: 'green', text: 'Green Mode', icon: 'mdi:leaf', entity: 'automation.caricatore_modalita_green', service: 'automation.turn_on' },
  ],
});
card7.hass = hass3;
document.body.appendChild(card7);
await card7.updateComplete;
const qa7 = [...card7.shadowRoot.querySelectorAll('.qa-button')];
assert(qa7.length === 4, `quick_actions capped at 4 even when 5 ids given, got ${qa7.length}`);
assert(qa7.some((b) => b.textContent.includes('Single phase')), 'quick_actions: device chip (force_single_phase) picked');
assert(qa7.some((b) => b.textContent.includes('green')), 'quick_actions: device chip (lb_mode option) picked');
assert(!qa7.some((b) => b.textContent.includes('Lock')), 'quick_actions: 5th id (lock) dropped by the 4-item cap');

const card8 = document.createElement('lektrico-charger-card');
card8.setConfig({
  entity: 'sensor.1p7k_state',
  quick_actions: ['custom:0'],
  actions: [
    { text: 'Green Mode', icon: 'mdi:leaf', entity: 'automation.caricatore_modalita_green', service: 'automation.turn_on' },
  ],
});
card8.hass = { ...hass };
document.body.appendChild(card8);
await card8.updateComplete;
const qa8 = [...card8.shadowRoot.querySelectorAll('.qa-button')];
assert(qa8.length === 1 && qa8[0].textContent.includes('Green Mode'), 'quick_actions: custom action picked via custom:<index> fallback id');

// ---------- last session held between sessions ----------
// The charger zeroes energy and charging time on unplug; the card reads the
// previous session back from the recorder until the next charge starts.
const T0 = Date.UTC(2026, 9, 11, 7, 0, 0) / 1000;
const history = {
  'sensor.1p7k_energia': [
    { s: '0', lu: T0 },               // window start: previous session already reset
    { s: '1.2', lu: T0 + 600 },
    { s: '6.85', lu: T0 + 7200 },     // last value of the session
    { s: '0', lu: T0 + 7500 },        // unplugged -> reset
  ],
  'sensor.1p7k_charging_time': [
    { s: '0', lu: T0 },
    { s: '7100', lu: T0 + 7200 },
    { s: '0', lu: T0 + 7500 },
  ],
};
const wsCalls = [];
const mkHassLS = (stateName, energy, time, extra = {}) => ({
  ...hass,
  states: {
    ...states,
    'sensor.1p7k_state': { ...states['sensor.1p7k_state'], state: stateName },
    'sensor.1p7k_energia': { ...states['sensor.1p7k_energia'], state: energy, last_changed: extra.reset || 'r1' },
    'sensor.1p7k_charging_time': { ...states['sensor.1p7k_charging_time'], state: time },
    'binary_sensor.1p7k_overheating': { ...states['binary_sensor.1p7k_overheating'], state: 'off' },
  },
  callWS: async (msg) => { wsCalls.push(msg); return extra.history ?? history; },
});
const flush = async (c) => { for (let i = 0; i < 3; i += 1) { await new Promise((r) => setTimeout(r, 0)); await c.updateComplete; } };

const cardLS = document.createElement('lektrico-charger-card');
cardLS.setConfig({ entity: 'sensor.1p7k_state' });
cardLS.hass = mkHassLS('available', '0', '0');
document.body.appendChild(cardLS);
await flush(cardLS);
const statsLS = () => cardLS.shadowRoot.querySelector('.stats').textContent.replace(/\s+/g, ' ');
assert(wsCalls.length === 1 && wsCalls[0].type === 'history/history_during_period', 'unplugged with zeroed counters -> one history query');
assert(wsCalls[0].entity_ids.includes('sensor.1p7k_energia') && wsCalls[0].entity_ids.includes('sensor.1p7k_charging_time'), 'history query covers energy and charging time');
assert(statsLS().includes('6.85 kWh'), 'unplugged: previous session energy held');
assert(statsLS().includes('01:58:20'), 'unplugged: previous session charging time held');
assert(cardLS.shadowRoot.querySelectorAll('.stat.held').length === 2, 'held stats are marked');
assert(cardLS.shadowRoot.querySelector('.stat.held .held-icon'), 'held stats carry the history icon');
assert((cardLS.shadowRoot.querySelector('.stat.held')?.getAttribute('title') || '').startsWith('Ultima sessione'), 'held stat tooltip says last session (localized)');
assert(!cardLS.shadowRoot.querySelector('.stat:not(.held) .held-icon'), 'temperature is never held');

// re-render with the same reset: no second query
cardLS.hass = mkHassLS('available', '0', '0');
await flush(cardLS);
assert(wsCalls.length === 1, 'same reset -> history not queried again');

// plugged in, not charging yet: still the previous session
cardLS.hass = mkHassLS('connected', '0', '0');
await flush(cardLS);
assert(statsLS().includes('6.85 kWh'), 'connected but not charging: previous session still shown');

// charging starts: live counters take over, even at zero
cardLS.hass = mkHassLS('charging', '0', '0');
await flush(cardLS);
assert(statsLS().includes('0 kWh') && !statsLS().includes('6.85'), 'charging: live counters take over immediately');
assert(!cardLS.shadowRoot.querySelector('.stat.held'), 'charging: nothing marked as held');

// a session in progress (paused at 0 A by a solar mode) keeps its live value
cardLS.hass = mkHassLS('paused', '2.4', '1800');
await flush(cardLS);
assert(statsLS().includes('2.4 kWh') && !cardLS.shadowRoot.querySelector('.stat.held'), 'paused mid-session: live value, not held');

// next unplug (new reset) -> new query
cardLS.hass = mkHassLS('available', '0', '0', { reset: 'r2' });
await flush(cardLS);
assert(wsCalls.length === 2, 'new reset -> history queried again');

// ultra-compact right column holds the energy too
const cardLSu = document.createElement('lektrico-charger-card');
cardLSu.setConfig({ entity: 'sensor.1p7k_state', compact: 'ultra' });
cardLSu.hass = mkHassLS('available', '0', '0');
document.body.appendChild(cardLSu);
await flush(cardLSu);
const heldInfo = cardLSu.shadowRoot.querySelector('.ultra-stat-item.held');
assert(heldInfo && heldInfo.textContent.includes('6.85 kWh'), 'ultra-compact: held energy in the right column');

// side info + stats referencing the entity id instead of the role name
const cardLSi = document.createElement('lektrico-charger-card');
cardLSi.setConfig({ entity: 'sensor.1p7k_state', info_right: ['sensor.1p7k_energia'], stats: ['sensor.1p7k_charging_time'] });
cardLSi.hass = mkHassLS('available', '0', '0');
document.body.appendChild(cardLSi);
await flush(cardLSi);
assert(cardLSi.shadowRoot.querySelector('.info-item.held')?.textContent.includes('6.85 kWh'), 'side info by entity id: held energy');
assert(cardLSi.shadowRoot.querySelector('.stat.held')?.textContent.includes('01:58:20'), 'stats by entity id: held charging time');

// opt-out
const before = wsCalls.length;
const cardLSoff = document.createElement('lektrico-charger-card');
cardLSoff.setConfig({ entity: 'sensor.1p7k_state', last_session: false });
cardLSoff.hass = mkHassLS('available', '0', '0');
document.body.appendChild(cardLSoff);
await flush(cardLSoff);
assert(wsCalls.length === before, 'last_session: false -> no history query');
assert(cardLSoff.shadowRoot.querySelector('.stats').textContent.includes('0 kWh'), 'last_session: false -> live zeros');

// history failure falls back to live zeros
const cardLSerr = document.createElement('lektrico-charger-card');
cardLSerr.setConfig({ entity: 'sensor.1p7k_state' });
cardLSerr.hass = { ...mkHassLS('available', '0', '0'), callWS: async () => { throw new Error('unauthorized'); } };
document.body.appendChild(cardLSerr);
await flush(cardLSerr);
assert(cardLSerr.shadowRoot.querySelector('.stats').textContent.includes('0 kWh') && !cardLSerr.shadowRoot.querySelector('.stat.held'), 'history error -> live zeros, nothing held');

// pure extraction: charging time comes from the same session as the energy
const Card = customElements.get('lektrico-charger-card');
const ids = { session_energy: 'e', charging_time: 't' };
const r1 = Card._lastSessionFrom({
  e: [{ s: '5', lu: 100 }, { s: '0', lu: 200 }],
  t: [{ s: '900', lu: 150 }, { s: '0', lu: 200 }, { s: '60', lu: 300 }, { s: '0', lu: 400 }],
}, ids);
assert(r1.values.session_energy === '5' && r1.values.charging_time === '900', 'time sample after the reset (a later empty plug-in) is ignored');
assert(r1.endedAt === 200000, 'end of session = reset instant');
const r2 = Card._lastSessionFrom({ e: [{ s: '0', lu: 1 }], t: [] }, ids);
assert(r2.values === null, 'no positive energy in window -> nothing held');
const r3 = Card._lastSessionFrom({ e: [{ s: 'unavailable', lu: 1 }, { s: '3.1', lu: 2 }] }, ids);
assert(r3.values.session_energy === '3.1' && r3.endedAt === null, 'session not reset yet in history -> value kept, no end time');

console.log(process.exitCode ? '\nSMOKE TEST FAILED' : '\nSMOKE TEST PASSED');
