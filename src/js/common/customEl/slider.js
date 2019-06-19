import img1 from '../../../image/home_slider_1.webp';
import img2 from '../../../image/home_slider_2.webp';
import img3 from '../../../image/home_slider_3.webp';
import img4 from '../../../image/home_slider_4.webp';

class Slider extends HTMLElement {
  constructor() {
    super();

    this.data = [ {
      img: img4,
      position: 'left center'
    }, {
      img: img1,
      position: 'bottom left',
    }, {
      img: img3,
      position: 'center'
    }, {
      img: img2,
      position: 'center'
    }];

    this.containers = [];
    this.timer = null;
    this.currentIndex = -1;

    this.render = this.render.bind(this);
    this.getData = this.getData.bind(this);
    this.slideNext = this.slideNext.bind(this);
    this.slidePrev = this.slidePrev.bind(this);
    this.autoSlide = this.autoSlide.bind(this);
  }

  connectedCallback() {
    this.render();
    this.autoSlide();
  }

  disconnectedCallback() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    const shadow = this.attachShadow({ mode: 'open' });
    this.containers = this.data.map(data => {
      const container = document.createElement('div');
      container.style.cssText = `
      transform: scale(1.1);
      opacity: 0;
      width: 0px;
      height: 0px;
      height: inherit;
      transition: background 3s, opacity 2s, transform 1s;
      background-size: cover;
      background-position: top right;
      background-image: url('${data.img}');
    `;

      shadow.appendChild(container);
      return container;
    });

    // style
    this.style.cssText = `
      height: 100%;
      display: block;
      overflow: hidden;
      cursor: pointer;
    `;

    // event
    this.addEventListener('click', () => {
      this.resetAutoSlide();
    });
  }

  getData() {
    let container = null;
    let data = null;

    try {
      container = this.containers[this.currentIndex];
      data = this.data[this.currentIndex];

      if (!container || !data) throw new Error('Not found resource');
    } catch (e) {
      if (this.currentIndex < 0) {
        this.currentIndex = this.containers.length - 1;
      } else {
        this.currentIndex = 0;
      }
      
      container = this.containers[0];
      data = this.data[0];
    }

    return { container, data };
  }

  hideContainer(container) {
    container.style.width = 0;
    container.style.height = 0;
    container.style.opacity = 0;
    container.style.transform = 'scale(1.1)';
    container.style.backgroundPosition = 'top right';
  }

  showContainer(container, data) {
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.opacity = 1;
    container.style.transform = 'scale(1)';
    container.style.backgroundPosition = data.position;
  }

  slideNext() {
    const { container: currentContainer } = this.getData();
    this.hideContainer(currentContainer);

    this.currentIndex++;

    const { container: nextContainer, data: nextData } = this.getData();
    this.showContainer(nextContainer, nextData);
  }

  slidePrev() {
    const { container: currentContainer, data: currentData } = this.getData();
    this.hideContainer(currentContainer, currentData);

    this.currentIndex--;

    const { container: nextContainer, data: nextData } = this.getData();
    this.showContainer(nextContainer, nextData);
  }

  autoSlide(timeout = 4000 /** in milisecond */) {
    this.slideNext();

    if (!this.timer) {
      this.timer = setInterval(this.slideNext, timeout);
    }
  }

  resetAutoSlide() {
    clearInterval(this.timer);
    this.timer = null;

    this.autoSlide();
  }
}

customElements.define('i-slider', Slider);