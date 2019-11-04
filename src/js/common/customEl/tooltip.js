class Tooltip extends HTMLElement {
  constructor() {
    super();
    
    this.render = this.render.bind(this);
    this.handleMouseIn = this.handleMouseIn.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.tooltipContainer = null;

    
  }

  connectedCallback() {
    this.render();
  }

  handleMouseIn() {
    this.tooltipContainer.style.display = 'block';
  }

  handleMouseOut() {
    this.tooltipContainer.style.display = 'none';
  }

  render() {
    const shadow = this.attachShadow({ mode: 'open' });
    const textEl = document.createElement('span');
    this.tooltipContainer = document.createElement('div');
    textEl.innerHTML = this.getAttribute('text');
    
    this.tooltipContainer.innerHTML = `
      <style>
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      </style>
      ${this.innerHTML}
    `;

    textEl.style.cssText = 'border-bottom: dotted 1px; color: black; position: relative';
    this.tooltipContainer.style.cssText = `
      position: absolute;
      background-color: white;
      padding: 20px;
      border-radius: 4px;
      z-index: 100;
      min-width: 240px;
      max-width: 600px;
      bottom: 35px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      animation-name: fadeIn;
      animation-duration: 300ms;
      font-size: 18px;
      line-height: 24px;
      letter-spacing: 0.2px;
      box-shadow: 0 0 2px 0 rgba(0,0,0,0.06), 0 8px 24px 0 rgba(0,0,0,0.10);
    `;
    

    textEl.addEventListener('mouseover', this.handleMouseIn);
    textEl.addEventListener('mouseleave', this.handleMouseOut);

    textEl.appendChild(this.tooltipContainer);
    shadow.appendChild(textEl);
  }
}

customElements.define('i-tooltip', Tooltip);