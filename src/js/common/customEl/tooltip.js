import Tooltip from 'tooltip.js';

class ITooltip extends HTMLElement {
  constructor() {
    super();

    const title = this.getAttribute('data-text');

    new Tooltip(this, {
      animation: true,
      placement: 'auto top',
      trigger: 'hover focus',
      title,
      html: true
    });
  }
}

customElements.define('i-tooltip', ITooltip);
