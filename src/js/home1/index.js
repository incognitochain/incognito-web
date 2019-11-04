import YoutubePlayer from '../common/youtubePlayer';
import countdown from '../service/countdown';
import {
  getTotalSubscribe,
  getExchangeRates,
  getProductPrice
} from '../service/api';
import { trackEvent } from '../common/utils/ga';
import isQueryStringExists from '../service/queryStringExists';
import KEYS from '../constant/keys';
import storage from '../service/storage';

// for earning calculation
const earningStepPercent = 0.5;
const earningDefaultStartPercent = 0.5;
const earningMinPercent = 0;
const earningMaxPercent = 100;
const fixedEarningInUSDRate = {
  btc: 6.75,
  eth: 13.75,
  bnb: 4.5
};
let coinFiatRate = {
  btc: 0.1,
  eth: 0.1,
  bnb: 0.1
};
let sliderAffected = false;
const earningTooltips = [];

function main() {
  const container = document.querySelector('#home1-container');

  if (!container) {
    return;
  }

  handleVideoPlayers(container);
  startCountdown(container);
  handleShowTotalSubscriber(container);
  handleScrollToEmailSubscriber(container);
  handleScrollToFAQ(container);
  handleAutoPlayUnboxing(container);
  handleAutoPlayIntro(container);
  handleEarningSliders(container);
  handleGetProductPrice(container);
}

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
    countdown(countdownEl, '2019-10-20T23:59:00.000-07:00', () => {
      // setMessage('The program was ended', 'error');
      countdownEl.remove();
      const earlyBirdPriceEls = document.querySelectorAll(
        '.price-info #early-bird-price-note'
      );
      earlyBirdPriceEls.forEach(earlyBirdPriceEl => {
        earlyBirdPriceEl.remove();
      });
    });
  }
};

const handleVideoPlayers = container => {
  try {
    container;

    const links = container.querySelectorAll('.link[data-video-url]');

    links &&
      links.forEach(link => {
        link.addEventListener('click', () => {
          const url = link.getAttribute('data-video-url');

          if (url) {
            const player = new YoutubePlayer(url);
            player.play();

            trackEvent({
              eventCategory: 'Youtube player',
              eventAction: 'click',
              eventLabel: `Play url ${url}`
            });
          }
        });
      });
  } catch (e) {
    console.error('handleVideoPlayers failed', e);
  }
};

const handleScrollToFAQ = container => {
  const rootScrollerElm = container.querySelector('.right-content');
  if (!rootScrollerElm) return;
  const scrollBtn = container.querySelector('.scroll-down');

  rootScrollerElm.addEventListener('scroll', function(event) {
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

const handleScrollToEmailSubscriber = container => {
  const ctaEl = container.querySelector('.cta');
  const priceInfoElm = container.querySelector('.price-info');
  let subscribeEmailEl = ctaEl.querySelector('#buy-now-container');
  let stickyPosition = 0;

  do {
    stickyPosition += subscribeEmailEl.offsetTop || 0;
    subscribeEmailEl = subscribeEmailEl.offsetParent;
  } while (subscribeEmailEl);

  // const priceElm = priceInfoElm.querySelector('.price');

  window.addEventListener('scroll', function() {
    let ctaElmHeight = ctaEl.offsetHeight;
    // if (priceElm) {
    //   ctaElmHeight += priceElm.offsetHeight + 20;
    // }

    if (window.pageYOffset > stickyPosition) {
      ctaEl.classList.add('sticky');
      priceInfoElm.style.paddingTop = `${ctaElmHeight}px`;
    } else {
      ctaEl.classList.remove('sticky');
      priceInfoElm.style.paddingTop = 0;
    }
  });
};

const handleAutoPlayUnboxing = container => {
  if (isQueryStringExists(KEYS.UNBOXING_QUERY)) {
    const unboxingVideoButton = container.querySelector(".link[type='unbox']");
    if (unboxingVideoButton) {
      unboxingVideoButton.click();
    }
  }
};

const handleAutoPlayIntro = container => {
  if (isQueryStringExists(KEYS.INTRO_QUERY)) {
    const introVideoButton = container.querySelector(".link[type='intro']");
    if (introVideoButton) {
      introVideoButton.click();
    }
  }
};

const handleGetProductPrice = async container => {
  const priceInfoEls = container.querySelectorAll('.price-info');
  try {
    const productPrice = await getProductPrice();
    if (productPrice) {
      const { OfferPrice: price } = productPrice;
      priceInfoEls.forEach(priceInfoEl => {
        const priceEl = priceInfoEl.querySelector('.end-price');
        // const offerCountdownEl = priceInfoEl.querySelector('.offer-countdown');
        // const offerWrapperEl = priceInfoEl.querySelector('.offer-wrapper');
        // if (quantityRemaining < 1) {
        //   offerWrapperEl.remove();
        // } else {
        //   if (offerCountdownEl) offerCountdownEl.innerText = quantityRemaining;
        // }
        if (priceEl) priceEl.innerText = price;
      });
    }
  } catch {}
};

const updateEarningTooltip = () => {
  earningTooltips.map(tooltip => {
    tooltip.updateTitleContent(
      !sliderAffected
        ? defaultEarningTooltipContent
        : affectedEarningTooltipContent
    );
  });
};

const handleEarningSliders = async container => {
  const sliderContainer = container.querySelector('.earning-slider-container');
  if (!sliderContainer) return;
  const currentRate = {
    btc: 0.5,
    eth: 0.5,
    bnb: 0.5
  };
  const defaultSliderOptions = {
    start: earningDefaultStartPercent,
    connect: 'lower',
    step: earningStepPercent,
    range: {
      min: earningMinPercent,
      max: earningMaxPercent
    },
    format: {
      to: value => {
        return value.toFixed(1);
      },
      from: value => {
        return Number(value).toFixed(1);
      }
    }
  };
  const sliders = {
    btc: sliderContainer.querySelector('#btc-slider'),
    eth: sliderContainer.querySelector('#eth-slider'),
    bnb: sliderContainer.querySelector('#bnb-slider')
  };

  try {
    const newCoinFiatRate = await getExchangeRates();
    if (newCoinFiatRate) {
      coinFiatRate = {
        ...coinFiatRate,
        ...newCoinFiatRate
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
        start: currentRate[coinName]
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

  Object.values(earningData).forEach(earning => {
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

const calculateEarning = rates => {
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

main();
