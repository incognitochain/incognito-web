class TabNavigation extends HTMLElement {
  constructor() {
    super();

    this.tabs = this.querySelectorAll('tab');
    this.tabItems = this.querySelectorAll('tab-item');
  }

  activateTab(activeIndex) {
    this.tabs.forEach((tab, i) => {
      if (i === activeIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.tabItems.forEach((tabItem, i) => {
      if (i === activeIndex) {
        tabItem.classList.add('active');
      } else {
        tabItem.classList.remove('active');
      }
    });
  }

  onTabClicked(index) {
    this.activateTab(index);
  }

  connectedCallback() {
    const defaultTabIndex = +this.getAttribute('default-tab-index');
    this.activateTab(defaultTabIndex);

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', this.onTabClicked.bind(this, i));
    });
  }

  disconnectedCallback() {
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.onTabClicked);
    });
  }
}

customElements.define('i-tab-navigation', TabNavigation);
