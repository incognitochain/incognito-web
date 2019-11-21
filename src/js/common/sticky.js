class Sticky extends HTMLElement {
  constructor() {
    super();
    this.stickyPosition = 0;
  }

  onWindowScrolled() {
    if (window.pageYOffset > this.stickyPosition) {
      this.classList.add('sticky');
    } else {
      this.classList.remove('sticky');
    }
  }

  connectedCallback() {
    this.setup();
    window.addEventListener('scroll', this.onWindowScrolled.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onWindowScrolled);
  }

  setup() {
    let parentElement = this;

    do {
      this.stickyPosition += parentElement.offsetTop || 0;
      parentElement = parentElement.offsetParent;
    } while (parentElement);
  }
}

customElements.define('i-sticky', Sticky);
