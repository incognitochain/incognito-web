import Swiper from 'swiper';
import YoutubePlayer from '../common/youtubePlayer';
import countdown from '../service/countdown';
import {
  getTotalSubscribe,
  getExchangeRates,
  getProductPrice,
} from '../service/api';
import { trackEvent } from '../common/utils/ga';
import isQueryStringExists from '../service/queryStringExists';
import KEYS from '../constant/keys';
import storage from '../service/storage';
import Sticky from '../common/sticky';
import { ORIGIN_PRODUCT_PRICE } from '../constant/payment';
import $ from 'jquery';

// for earning calculation
const earningStepPercent = 0.5;
const earningDefaultStartPercent = 0.5;
const earningMinPercent = 0;
const earningMaxPercent = 100;
const fixedEarningInUSDRate = {
  btc: 6.75,
  eth: 13.75,
  bnb: 4.5,
};
let coinFiatRate = {
  btc: 0.1,
  eth: 0.1,
  bnb: 0.1,
};
let sliderAffected = false;
const earningTooltips = [];

function main() {
  const container = document.querySelector('#home1-container');

  if (!container) {
    return;
  }
  console.log(`init home...`);
  handleVideoPlayers(container);
  // startCountdown(container);
  handleShowTotalSubscriber(container);
  handleScrollToFAQ(container);
  handleAutoPlayUnboxing(container);
  handleAutoPlayIntro(container);
  handleEarningSliders(container);
  handleGetProductPrice(container);
  handleSectionSwipers(container);
  handlePressSwiper(container);
  handleTestimonialSwiper(container);
  handleScrollToEmailSubscriber(container);

  window.addEventListener('load', () => {
    handleScrollToNavigationLinks(container);
  });
}

const handleTestimonialSwiper = (container) => {
  const testimonialContainerEl = container.querySelector(
    '#testimonial-container'
  );
  if (!testimonialContainerEl) return;
  const swiperEl = testimonialContainerEl.querySelector('.swiper-container');
  if (!swiperEl) return;
  const nextBtnEl = swiperEl.querySelector('.swiper-btn-next');
  const prevBtnEl = swiperEl.querySelector('.swiper-btn-prev');

  new Swiper(swiperEl, {
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    watchOverflow: true,
    spaceBetween: 50,
    navigation: {
      nextEl: nextBtnEl,
      prevEl: prevBtnEl,
    },
  });
};

const handleSectionSwipers = (container) => {
  const swiperEls = container.querySelectorAll(
    '.swiper-container.swiper-coverflow'
  );
  swiperEls.forEach((swiper) => {
    new Swiper(swiper, {
      effect: 'coverflow',
      loop: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      keyboardControl: true,
      mousewheelControl: true,
      lazy: {
        loadPrevNext: true,
      },
      preventClicks: false,
      preventClicksPropagation: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 500,
        modifier: 1,
        slideShadows: true,
      },
    });
  });
};

const handlePressSwiper = (container) => {
  const pressContainerEl = container.querySelector('.press-container');
  if (!pressContainerEl) return;
  const swiperEl = pressContainerEl.querySelector('.swiper-container');
  if (!swiperEl) return;
  const nextEl = pressContainerEl.querySelector('.swiper-button-next');
  const prevEl = pressContainerEl.querySelector('.swiper-button-prev');

  new Swiper(swiperEl, {
    slidesPerView: 1,
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 4,
      },
    },
    loop: true,
    navigation: {
      nextEl: nextEl,
      prevEl: prevEl,
    },
    watchOverflow: true,
    spaceBetween: 50,
    autoplay: {
      delay: 4000,
    },
  });
};

const handleShowTotalSubscriber = async () => {
  try {
    const num = await getTotalSubscribe();

    if (num) {
      const els = document.querySelectorAll(
        ".total-subcriber span[role='counter']"
      );
      for (const el of els) {
        el && (el.innerText = num);
      }
    }
  } catch {}
};

const startCountdown = () => {
  const countdownEls = document.querySelectorAll('.countdown');
  for (const countdownEl of countdownEls) {
    countdown(countdownEl, '2019-12-06T23:59:00.000-07:00', () => {
      // setMessage('The program was ended', 'error');
      countdownEl.remove();
      const earlyBirdPriceEls = document.querySelectorAll(
        '.price-info #early-bird-price-note'
      );
      earlyBirdPriceEls.forEach((earlyBirdPriceEl) => {
        earlyBirdPriceEl.remove();
      });
    });
  }
};

const handleVideoPlayers = (container) => {
  try {
    container;

    const links = container.querySelectorAll('.link[data-video-url]');

    links &&
      links.forEach((link) => {
        link.addEventListener('click', () => {
          const url = link.getAttribute('data-video-url');

          if (url) {
            const player = new YoutubePlayer(url);
            player.play();

            trackEvent({
              eventCategory: 'Youtube player',
              eventAction: 'click',
              eventLabel: `Play url ${url}`,
            });
          }
        });
      });
  } catch (e) {
    console.error('handleVideoPlayers failed', e);
  }
};

const handleScrollToFAQ = (container) => {
  const rootScrollerElm = container.querySelector('.right-content');
  if (!rootScrollerElm) return;
  const scrollBtn = container.querySelector('.scroll-down');

  rootScrollerElm.addEventListener('scroll', function (event) {
    const target = event.target;

    if (scrollBtn) {
      if (target.scrollTop > 0) {
        scrollBtn.classList.add('hide');
      } else {
        scrollBtn.classList.remove('hide');
      }
    }
  });
};

const handleScrollToEmailSubscriber = (container) => {
  const ctaEl = container.querySelector('.cta');
  const priceInfoElm = container.querySelector('.price-info');
  let subscribeEmailEl = ctaEl.querySelector('#buy-now-container');
  let stickyPosition = 0;
  const getZendeskEl = () => {
    return document.querySelector('iframe#launcher');
  };
  let zendeskEl = getZendeskEl();

  do {
    stickyPosition += subscribeEmailEl.offsetTop || 0;
    subscribeEmailEl = subscribeEmailEl.offsetParent;
  } while (subscribeEmailEl);

  // const priceElm = priceInfoElm.querySelector('.price');

  window.addEventListener('scroll', function () {
    let ctaElmHeight = ctaEl.offsetHeight;
    if (!zendeskEl) {
      zendeskEl = getZendeskEl();
    }
    // if (priceElm) {
    //   ctaElmHeight += priceElm.offsetHeight + 20;
    // }

    if (window.pageYOffset > stickyPosition) {
      ctaEl.classList.add('sticky');
      priceInfoElm.style.paddingTop = `${ctaElmHeight}px`;
      zendeskEl && zendeskEl.classList.add('sticky');
    } else {
      ctaEl.classList.remove('sticky');
      zendeskEl && zendeskEl.classList.remove('sticky');
      priceInfoElm.style.paddingTop = 0;
    }
  });
};

const handleScrollToNavigationLinks = (container) => {
  const navLinksEl = container.querySelector('.nav-links');
  new Sticky(navLinksEl);
};

const handleAutoPlayUnboxing = (container) => {
  if (isQueryStringExists(KEYS.UNBOXING_QUERY)) {
    const unboxingVideoButton = container.querySelector(".link[type='unbox']");
    if (unboxingVideoButton) {
      unboxingVideoButton.click();
    }
  }
};

const handleAutoPlayIntro = (container) => {
  if (isQueryStringExists(KEYS.INTRO_QUERY)) {
    const introVideoButton = container.querySelector(".link[type='intro']");
    if (introVideoButton) {
      introVideoButton.click();
    }
  }
};

const handleGetProductPrice = async (container) => {
  const priceInfoEls = container.querySelectorAll('.price-info');
  try {
    const productPrice = await getProductPrice();
    if (productPrice) {
      priceInfoEls.forEach((priceInfoEl) => {
        const priceEl = priceInfoEl.querySelector('.price');
        const endPriceEl = document.createElement('span');
        endPriceEl.classList.add('end-price');
        const promotePriceEl = document.createElement('span');
        promotePriceEl.classList.add('promote-price');
        endPriceEl.innerHTML = productPrice;
        if (productPrice < ORIGIN_PRODUCT_PRICE) {
          promotePriceEl.innerHTML = ORIGIN_PRODUCT_PRICE;
          priceEl.appendChild(promotePriceEl);
        }
        priceEl.appendChild(endPriceEl);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateEarningTooltip = () => {
  earningTooltips.map((tooltip) => {
    tooltip.updateTitleContent(
      !sliderAffected
        ? defaultEarningTooltipContent
        : affectedEarningTooltipContent
    );
  });
};

const handleEarningSliders = async (container) => {
  const sliderContainer = container.querySelector('.earning-slider-container');
  if (!sliderContainer) return;
  const currentRate = {
    btc: 0.5,
    eth: 0.5,
    bnb: 0.5,
  };
  const defaultSliderOptions = {
    start: earningDefaultStartPercent,
    connect: 'lower',
    step: earningStepPercent,
    range: {
      min: earningMinPercent,
      max: earningMaxPercent,
    },
    format: {
      to: (value) => {
        return value.toFixed(1);
      },
      from: (value) => {
        return Number(value).toFixed(1);
      },
    },
  };
  const sliders = {
    btc: sliderContainer.querySelector('#btc-slider'),
    eth: sliderContainer.querySelector('#eth-slider'),
    bnb: sliderContainer.querySelector('#bnb-slider'),
  };

  try {
    const newCoinFiatRate = await getExchangeRates();
    if (newCoinFiatRate) {
      coinFiatRate = {
        ...coinFiatRate,
        ...newCoinFiatRate,
      };

      storage.set(KEYS.COIN_FIAT_RATE, JSON.stringify(newCoinFiatRate));
    }

    updateEarningUI(container, calculateEarning(currentRate));
  } catch {}

  for (const coinName in sliders) {
    const sliderContainer = sliders[coinName];
    const slider = sliderContainer.querySelector('.slider-container');
    if (slider) {
      noUiSlider.create(slider, {
        ...defaultSliderOptions,
        start: currentRate[coinName],
      });
      slider.noUiSlider.on('slide', (values, handle, uncoded) => {
        // if (!sliderAffected) sliderAffected = true;
        const value = uncoded[0];
        const earningPercent = sliderContainer.querySelector(
          '.earning-percent'
        );
        earningPercent.innerText = value;
        currentRate[coinName] = Math.round(value * 10) / 10;
        updateEarningUI(container, calculateEarning(currentRate));
      });
    }
  }
};

const updateEarningUI = (container, earningData) => {
  updateEarningTooltip(container);

  const earningGroupEl = container.querySelector('.earning-group');
  const earningPriceEl = earningGroupEl.querySelector('.earning-price');
  const earningBTCEl = earningGroupEl.querySelector('#earning-btc');
  const earningETHEl = earningGroupEl.querySelector('#earning-eth');
  const earningBNBEl = earningGroupEl.querySelector('#earning-bnb');

  let totalEarningPrice = 0;

  Object.values(earningData).forEach((earning) => {
    totalEarningPrice += earning.fiat;
  });

  if (earningPriceEl)
    earningPriceEl.innerText = Math.round(totalEarningPrice).toLocaleString(
      'en-US'
    );
  if (earningBTCEl)
    earningBTCEl.innerText = Math.round(earningData.btc.coin * 1e6) / 1e6;
  if (earningETHEl)
    earningETHEl.innerText = Math.round(earningData.eth.coin * 1e4) / 1e4;
  if (earningBNBEl)
    earningBNBEl.innerText = Math.round(earningData.bnb.coin * 1e4) / 1e4;
};

const calculateEarning = (rates) => {
  const earning = {};

  for (const coinName in rates) {
    const rate = rates[coinName];
    const fixedEarningUSD = fixedEarningInUSDRate[coinName];
    const coinFiat = coinFiatRate[coinName];

    const earningInCoin =
      (fixedEarningUSD / coinFiat) * (rate / earningStepPercent);
    const earningInUSD = earningInCoin * coinFiat;

    earning[coinName] = { coin: earningInCoin, fiat: earningInUSD };
  }

  return earning;
};

$(document).ready(() => {
  main();
});
