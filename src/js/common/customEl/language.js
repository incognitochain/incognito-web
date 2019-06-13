class Language extends HTMLElement {
  constructor() {
    super();

    this.translate();
  }

  translate() {
    this.innerText += '-translated';
  }
}

customElements.define('i-lang', Language);