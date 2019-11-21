class Sticky {
  constructor(
    element,
    options = {},
    callback = { onAddSticky: () => {}, onRemoveSticky: () => {} }
  ) {
    this.element = element;
    this.options = options;
    this.callback = callback;
    this.setup();
  }

  setup() {
    if (!this.element) return;

    let stickyPosition = 0;
    let parentElement = this.element;

    do {
      stickyPosition += parentElement.offsetTop || 0;
      parentElement = parentElement.offsetParent;
    } while (parentElement);

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > stickyPosition) {
        this.element.classList.add('sticky');
        if (this.callback && this.callback.onAddSticky) {
          this.callback.onAddSticky();
        }
      } else {
        this.element.classList.remove('sticky');
        if (this.callback && this.callback.onRemoveSticky) {
          this.callback.onRemoveSticky();
        }
      }
    });
  }
}

export default Sticky;
