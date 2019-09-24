import arrowIcon from '../../../image/icon/arrow_right_black.png';
import { trackEvent } from '../utils/ga';

const carouselStyleConfig = {
  normal: {
    button: {
      height: '10px',
      width: '10px',
      background: 'none',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    }
  },
  active: {
    button: {
      height: '15px',
      width: '15px',
      background: 'rgba(255, 255, 255, 0.8)',
      border: 'none'
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
    this.containers = this.data.map(data => {
      const container = document.createElement('div');
      container.style.cssText = `
      transform: scale(1.1);
      opacity: 0;
      width: 0px;
      height: 0px;
      height: inherit;
      transition: opacity 2s, transform 1s;
      background-size: cover;
      background-position: top right;
      background-image: url('${data.img}');
    `;

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

      shadow.appendChild(container);
      return container;
    });

   

    // style
    this.style.cssText = `
      position: relative;
      height: 100%;
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
      position: absolute;
      bottom: 50px;
      left: 50%;
    `;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: relative;
      left: -50%;
      display: flex;
      align-items: center;
    `

    const buttonCss = carouselStyleConfig.normal.button;
    this.data.forEach((_, i) => {
      const button = document.createElement('div');
      button.classList.add('button');
      button.addEventListener('click', () => {
        this.slideTo(i);
      });
      button.style.cssText = `
        border: ${buttonCss.border};
        width: ${buttonCss.width};
        height: ${buttonCss.height};
        border-radius: 50px;
        margin: 0 5px;
        background: ${buttonCss.background}
      `;

      wrapper.appendChild(button);
    });

    carousel.appendChild(wrapper);
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
        
      button.style.background = styleConfig.button.background;
      button.style.width = styleConfig.button.width;
      button.style.height = styleConfig.button.height;
      button.style.border = styleConfig.button.border;
    })
  }
}

customElements.define('i-slider', Slider);