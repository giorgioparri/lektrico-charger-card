import { css } from 'lit';

export default css`
  :host {
    display: block;
    container-type: inline-size;
  }

  ha-card {
    padding: 16px;
    overflow: hidden;
  }

  /* ---------- header ---------- */

  .top {
    display: grid;
    grid-template-columns: minmax(70px, 1fr) minmax(96px, 42%) minmax(70px, 1fr);
    align-items: start;
    gap: 8px;
  }

  .side-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding-top: 4px;
  }
  .side-info.right {
    align-items: flex-end;
    text-align: right;
  }

  .info-item {
    cursor: pointer;
    line-height: 1.25;
    min-width: 0;
  }
  .info-item .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-item .label {
    font-size: 11px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-item ha-icon {
    --mdc-icon-size: 15px;
    color: var(--secondary-text-color);
    vertical-align: -2px;
    margin-inline-end: 2px;
  }

  /* ---------- charger image ---------- */

  .image-wrap {
    position: relative;
    width: 100%;
    max-width: 220px;
    margin: 0 auto;
    cursor: pointer;
  }
  .charger-svg {
    display: block;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
  }
  .custom-image {
    display: block;
    width: 100%;
    height: auto;
  }
  .led-overlay-svg {
    position: absolute;
    left: var(--led-overlay-left, 27.5%);
    top: var(--led-overlay-top, 27.5%);
    width: var(--led-overlay-size, 45%);
    height: var(--led-overlay-size, 45%);
    pointer-events: none;
  }

  .led {
    fill: var(--led-color, #4caf50);
    filter: drop-shadow(0 0 3px var(--led-color, #4caf50));
  }
  .leds-off .led {
    display: none;
  }
  /* paused: only the top bar stays lit, blinking */
  .leds.anim-top .led {
    opacity: 0.08;
    filter: none;
  }
  .leds.anim-top .led-0 {
    animation: led-pulse 2s ease-in-out infinite;
    filter: drop-shadow(0 0 3px var(--led-color, #ffffff));
  }
  .leds.anim-pulse .led {
    animation: led-pulse 2s ease-in-out infinite;
  }
  .leds.anim-spin .led {
    animation: led-chase var(--led-period, 1.6s) linear infinite;
  }
  .leds.anim-spin .led-1 {
    animation-delay: calc(var(--led-period, 1.6s) / -4 * 3);
  }
  .leds.anim-spin .led-2 {
    animation-delay: calc(var(--led-period, 1.6s) / -4 * 2);
  }
  .leds.anim-spin .led-3 {
    animation-delay: calc(var(--led-period, 1.6s) / -4 * 1);
  }
  @keyframes led-chase {
    0% { opacity: 1; }
    15% { opacity: 1; }
    45% { opacity: 0.1; }
    75% { opacity: 0.1; }
    100% { opacity: 1; }
  }
  @keyframes led-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }

  .brand-text {
    fill: #5c5f63;
    font-size: 9px;
    letter-spacing: 3px;
    font-family: inherit;
  }

  /* ---------- status ---------- */

  /* status text + lateral section-toggle icons, side by side */
  .status-line {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 6px;
  }

  .status {
    text-align: center;
    margin-top: 8px;
    cursor: pointer;
    min-width: 0;
  }
  .status .name {
    font-size: 14px;
    color: var(--secondary-text-color);
  }
  .status .state {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--primary-text-color);
    text-transform: uppercase;
    margin-top: 2px;
  }
  .status .state.state-error {
    color: var(--error-color, #f44336);
  }
  .status .state.state-charging {
    color: var(--primary-color);
  }
  .status .substatus {
    font-size: 12px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  /* ---------- error banner ---------- */

  .error-banner {
    margin-top: 12px;
    border-radius: 8px;
    padding: 10px 12px;
    background: rgba(244, 67, 54, 0.12);
    border: 1px solid rgba(244, 67, 54, 0.4);
  }
  .error-banner .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--error-color, #f44336);
    font-size: 13px;
  }
  .error-banner ul {
    margin: 6px 0 0;
    padding-inline-start: 20px;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .error-banner li {
    cursor: pointer;
  }

  /* ---------- quick actions ---------- */

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 14px;
  }
  .qa-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 62px;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 11px;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .qa-button:hover {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .qa-button ha-icon {
    --mdc-icon-size: 22px;
  }
  .qa-button.active {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
  .qa-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ---------- section toggles (lateral icons) + bodies ---------- */

  /* Vertical icon stack beside the status text, like the reference
     charger-card: minimal footprint when every section is collapsed. */
  .section-toggle-bar {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .section-toggle-bar.horizontal {
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 8px;
  }
  .section-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(127, 127, 127, 0.12);
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .section-toggle:hover {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.15);
  }
  .section-toggle.active {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.18);
    color: var(--primary-color);
  }
  .section-toggle ha-icon {
    --mdc-icon-size: 16px;
  }

  .sections {
    margin-top: 14px;
  }
  .section-body {
    padding: 2px 2px 14px;
  }
  .section-body.divider {
    border-top: 1px solid var(--divider-color);
    padding-top: 14px;
  }

  /* ---------- sliders ---------- */

  .slider-row {
    margin-top: 8px;
  }
  .slider-row .slider-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .slider-row .slider-head .val {
    font-weight: 600;
  }
  .slider-row input[type='range'] {
    width: 100%;
    margin: 8px 0 2px;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: var(--divider-color);
    outline: none;
    cursor: pointer;
  }
  .slider-row input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color);
    border: none;
    cursor: pointer;
  }
  .slider-row input[type='range']::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary-color);
    border: none;
    cursor: pointer;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .preset-chip {
    padding: 4px 12px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: none;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    color: var(--primary-text-color);
    transition: background 0.15s ease;
  }
  .preset-chip:hover {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .preset-chip.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .toggle-list {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    font-size: 13px;
    color: var(--primary-text-color);
  }
  .toggle-row ha-icon {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
  }
  .toggle-row .grow {
    flex: 1;
    cursor: pointer;
  }
  .toggle-row ha-switch {
    margin-inline-start: auto;
  }

  /* ---------- info list ---------- */

  .info-list {
    display: flex;
    flex-direction: column;
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 13px;
    cursor: pointer;
  }
  .info-row ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
  }
  .info-row .name {
    color: var(--secondary-text-color);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .info-row .val {
    color: var(--primary-text-color);
    font-weight: 500;
    text-align: right;
  }

  /* ---------- custom actions ---------- */

  .actions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .action-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 18px;
    border: 1px solid var(--divider-color);
    background: none;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    color: var(--primary-text-color);
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .action-chip ha-icon {
    --mdc-icon-size: 17px;
    color: var(--secondary-text-color);
  }
  .action-chip:hover {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .action-chip.active {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  .action-chip.active ha-icon {
    color: var(--primary-color);
  }
  .action-chip.device {
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    border-color: transparent;
  }
  .action-chip.device.active {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.15);
    color: var(--primary-color);
  }
  .actions-caption {
    width: 100%;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin: 6px 0 2px;
  }
  .actions-caption:first-child {
    margin-top: 0;
  }

  /* ---------- stats ---------- */

  .stats {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 10px;
    margin-top: 16px;
  }
  .stat {
    flex: 1 1 90px;
    text-align: center;
    cursor: pointer;
    min-width: 0;
  }
  .stat .value {
    font-size: 17px;
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  /* Previous session's value shown between sessions: marked by a small
     history icon and slightly muted, so it never reads as a live figure. */
  .stat.held .value,
  .info-item.held .value,
  .ultra-stat-item.held .v {
    color: var(--secondary-text-color);
  }
  .ultra-stat-item .held-icon {
    --mdc-icon-size: 13px;
    vertical-align: -1px;
    margin-inline-end: 2px;
  }
  .stat .held-icon {
    --mdc-icon-size: 15px;
    vertical-align: -1px;
    margin-inline-end: 3px;
  }
  .held-icon {
    color: var(--secondary-text-color);
    opacity: 0.8;
  }
  .stat .label {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ---------- compact ---------- */

  .compact-top {
    display: grid;
    grid-template-columns: 88px 1fr auto;
    gap: 12px;
    align-items: center;
  }
  .compact-top .image-wrap {
    max-width: 88px;
    margin: 0;
  }
  .compact-top .status {
    text-align: left;
    margin-top: 0;
    min-width: 0;
  }
  .compact-top .status .state {
    font-size: 16px;
  }
  .compact-top .side-info {
    padding-top: 0;
    gap: 6px;
  }
  .compact .quick-actions {
    margin-top: 12px;
  }
  .compact .actions-grid {
    margin-top: 12px;
  }
  .compact .stats {
    margin-top: 12px;
  }
  @container (max-width: 340px) {
    .compact-top {
      grid-template-columns: 72px 1fr;
    }
    .compact-top .side-info.right {
      grid-column: 1 / -1;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  /* ---------- ultra-compact ---------- */

  .ultra-top {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 10px;
    align-items: stretch;
  }
  .ultra-top .image-wrap {
    max-width: 60px;
    margin: 0;
    align-self: center;
  }
  .ultra-center {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .ultra-state {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ultra-state.state-error {
    color: var(--error-color, #f44336);
  }
  .ultra-state.state-charging {
    color: var(--primary-color);
  }
  .ultra-substatus {
    font-size: 11px;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ultra-limit {
    font-size: 12px;
    font-weight: 600;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .ultra-stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: right;
    min-width: 60px;
  }
  .ultra-stat-item {
    cursor: pointer;
    line-height: 1.2;
  }
  .ultra-stat-item .v {
    font-size: 12px;
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .ultra-stat-item .l {
    font-size: 10px;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .ultra-error {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    font-size: 11px;
    color: var(--error-color, #f44336);
    cursor: pointer;
  }
  .ultra-error ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
  }
  /* Start/stop button lives at the bottom of the center column,
     horizontally centered — no extra vertical space; text hides on
     very narrow cards. */
  .ultra-inline-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: auto;
    padding-top: 5px;
    align-self: center;
    background: none;
    border: 1px solid var(--primary-color);
    border-radius: 12px;
    color: var(--primary-color);
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    padding-inline: 8px;
    padding-block: 3px;
    transition: background 0.15s ease;
    max-width: 100%;
    overflow: hidden;
  }
  .ultra-inline-btn:hover {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
  }
  .ultra-inline-btn ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
  }
  .ultra-inline-btn .btn-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @container (max-width: 280px) {
    .ultra-inline-btn .btn-text { display: none; }
    .ultra-inline-btn { padding-inline: 5px; }
  }

  /* ---------- narrow layouts ----------
     When the card itself gets narrow (phone or a tight dashboard
     column) the image moves above the two info columns instead of
     squeezing between them, so texts are never covered. */

  @container (max-width: 340px) {
    .top {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: 'img img' 'left right';
    }
    .image-wrap {
      grid-area: img;
      max-width: 150px;
    }
    .side-info {
      padding-top: 0;
    }
    .side-info.left {
      grid-area: left;
    }
    .side-info.right {
      grid-area: right;
    }
  }
`;
