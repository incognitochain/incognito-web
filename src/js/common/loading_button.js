export default class {
  constructor(button) {
    this.button = button;
  }

  show() {
    if (!this.button) return;
    this.button.disabled = true;
    this.button.classList.add('loading');
  }

  hide() {
    if (!this.button) return;
    this.button.disabled = false;
    this.button.classList.remove('loading');
  }
}
