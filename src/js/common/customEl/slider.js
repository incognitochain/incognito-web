import arrowIcon from '../../../image/icon/arrow_right_black.png';
import { trackEvent } from '../utils/ga';

const carouselStyleConfig = {
  normal: {
    button: {
      height: '80px',
      width: '80px',
      border: 'none'
    }
  },
  active: {
    button: {
      height: '80px',
      width: '80px',
      border: '2px solid #3a84ee'
    }
  }
};

class Slider extends HTMLElement {
  constructor() {
    super();
    this.data = this.getImageData();

    this.containers = [];
    this.timer = null;
    this.currentIndex = -1;

    this.render = this.render.bind(this);
    this.getData = this.getData.bind(this);
    this.slideNext = this.slideNext.bind(this);
    this.slidePrev = this.slidePrev.bind(this);
    this.autoSlide = this.autoSlide.bind(this);
    this.slideTo = this.slideTo.bind(this);
  }

  getImageData() {
    try {
      return JSON.parse(this.getAttribute('images'));
    } catch {}
  }

  isAutoSlide() {
    const defaultIsAutoSlide = false;
    try {
      return this.getAttribute('auto_slide') || defaultIsAutoSlide;
    } catch {}
    return false;
  }

  getAutoSlideTime() {
    const defaultTime = 5 * 1000;
    try {
      return this.getAttribute('auto_slide_time') || defaultTime;
    } catch {}
    return defaultTime;
  }

  connectedCallback() {
    this.render();
    if(this.isAutoSlide()) {
      this.resetAutoSlide();
    } else {
      this.slideNext();
    }
  }

  disconnectedCallback() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: relative;
    `
    this.containers = this.data.map(data => {
      const container = document.createElement('div');
      container.style.cssText = `
        opacity: 0;
        transition: opacity 3s;
        display: none;
      `;
      const image = document.createElement('img');
      image.style.cssText = `
        width: 100%;
        max-width: 600px;
        height: auto;
        object-fit: contain;
      `;
      image.src = data.img;
      container.appendChild(image);

      if (this.data && this.data.length > 1) {
        container.addEventListener('click', () => {
          trackEvent({
            eventCategory: 'Slider',
            eventAction: 'click',
            eventLabel: 'Move to next image'
          });
          this.resetAutoSlide();
          this.slideNext();
        });
      }

      wrapper.appendChild(container);
      return container;
    });

    shadow.appendChild(wrapper);

    // style
    this.style.cssText = `
      position: relative;
      display: block;
      overflow: hidden;
      cursor: ${this.data && this.data.length > 1 ? 'pointer' : 'initial'};
    `;

    if (this.data && this.data.length > 1) {
      // this.renderNextPrevButtons(shadow);
      this.renderCarouselButton(shadow);
    }
  }

  renderCarouselButton (container) {
    const carousel = document.createElement('div');
    carousel.classList.add('carousel');
    carousel.style.cssText = `
      display: flex;
      align-items: center;
      margin-top: 3px;
    `;

    const buttonCss = carouselStyleConfig.normal.button;
    this.data.forEach((item, i) => {
      const button = document.createElement('div');
      button.classList.add('button');
      button.addEventListener('click', () => {
        this.slideTo(i);
      });
      button.style.cssText = `
        border: ${buttonCss.border};
        width: ${buttonCss.width};
        height: ${buttonCss.height};
        margin: 0 5px;
        border-radius: 6px;
        ${i === 0 && 'margin-left: 0px;'}
      `;
      
      const image = document.createElement('img');
      image.src = item.img;
      image.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 6px;
      `;
      button.appendChild(image);

      carousel.appendChild(button);
    });

    container.appendChild(carousel);
  } 

  renderNextPrevButtons (container) {
    const nextBtn = document.createElement('div');
    const prevBtn = document.createElement('div');

    nextBtn.style.cssText = `
      position: absolute;
      z-index: 1000;
      color: red;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      cursor: pointer;
      background: url('${arrowIcon}');
      background-size: cover;
    `;

    prevBtn.style.cssText = `
      ${nextBtn.style.cssText}
      left: 20px;
      right: unset;
      transform: translateY(-50%) rotate(180deg);
    `;

    // event
    nextBtn.addEventListener('click', () => {
      trackEvent({
        eventCategory: 'Slider',
        eventAction: 'click',
        eventLabel: 'Move to next image'
      });
      this.slideNext();
    });
    
    prevBtn.addEventListener('click', () => {
      trackEvent({
        eventCategory: 'Slider',
        eventAction: 'click',
        eventLabel: 'Move to prev image'
      });
      this.slidePrev();
    });

    container.appendChild(nextBtn);
    container.appendChild(prevBtn);
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
    // container.style.width = 0;
    // container.style.height = 0;
    container.style.opacity = 0;
    container.style.display = 'none';
    // container.style.transform = 'scale(1.1)';
    // container.style.backgroundPosition = 'top right';
  }

  showContainer(container, data) {
    // container.style.width = '100%';
    // container.style.height = 'calc(100% - 100px)';
    container.style.display = 'block';
    container.style.opacity = 1;
    // container.style.transform = 'scale(1)';
    // container.style.backgroundPosition = data.position;
    this.updateCarouselActive();
  }

  hideAllContainers() {
    this.containers.map(container => {
      this.hideContainer(container);
    })
  }

  slideTo(index) {
    this.resetAutoSlide();
    this.hideAllContainers();

    if(index >= this.data.length) {
      index = 0;
    } else if(index < 0) {
      index = this.data.length - 1;
    }
    this.currentIndex = index;

    const {container: nextContainer, data: nextData} = this.getData();
    this.showContainer(nextContainer, nextData);
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

    if(this.autoSlide()) {
      this.autoSlide(this.getAutoSlideTime());
    }
  }

  updateCarouselActive() {
    const carouselButtons = this.shadowRoot.querySelectorAll('.carousel .button');

    carouselButtons.forEach((button, i) => {
      let styleConfig = { 
        ...carouselStyleConfig.normal,
        ...(i === this.currentIndex ? carouselStyleConfig.active : {})
      };
        
      button.style.width = styleConfig.button.width;
      button.style.height = styleConfig.button.height;
      button.style.border = styleConfig.button.border;
    })
  }
}

customElements.define('i-slider', Slider);