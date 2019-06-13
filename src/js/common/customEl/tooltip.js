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
    
    this.tooltipContainer.innerHTML = this.innerHTML;

    textEl.style.cssText = 'border-bottom: dotted 1px; color: black;';
    this.style.position = 'relative';
    this.tooltipContainer.style.cssText = `
      position: absolute;
      background-color: #14191E;
      padding: 10px;
      border-radius: 4px;
      z-index: 100;
      min-width: 300px;
      max-width: 500px;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      color: white;
    `;
    

    textEl.addEventListener('mouseover', this.handleMouseIn);
    textEl.addEventListener('mouseleave', this.handleMouseOut);


    shadow.appendChild(textEl);
    shadow.appendChild(this.tooltipContainer);
  }
}

customElements.define('i-tooltip', Tooltip);