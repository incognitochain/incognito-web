import isPathname from '../common/utils/isPathname';
import YoutubePlayer from '../common/youtubePlayer';
import countdown from '../service/countdown';
import { getTotalSubscribe } from '../service/api';
import { trackEvent } from '../common/utils/ga';
import { setMessage } from '../service/message_box';

function main() {
  const container = document.querySelector('#home1-container');

  if (!container) {
    return;
  }

  handleVideoPlayers(container);
  startCountdown(container);
  handleShowTotalSubscriber(container);
  handleWindowScroll(container);
}

const handleShowTotalSubscriber = async (container) => {
  try {
    const num = await getTotalSubscribe();
    
    if (num) {
      const els = document.querySelectorAll(".total-subcriber span[role='counter']");
      for (const el of els) {
        el && (el.innerText = num);
      }
    }
  } catch {}
}

const startCountdown = (container) => {
  const countdownEls = document.querySelectorAll('.countdown');
  for(const countdownEl of countdownEls) {
    countdown(countdownEl, '2019-10-01T00:00:00.000', () => {
      setMessage('The program was ended', 'error');
    });
  }
}

const handleVideoPlayers = (container) => {
  try {
    container;

    const links = container.querySelectorAll('.link[data-video-url]');

    links && links.forEach(link => {

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
    })
  } catch (e) {
    console.error('handleVideoPlayers failed', e);
  }
}

const handleWindowScroll = (container) => {
  const ctaEl = container.querySelector(".cta");
  const priceInfoElm = container.querySelector(".price-info");
  let subscribeEmailEl = ctaEl.querySelector("#email-subscribe");
  let stickyPosition = 0;

  do {
    stickyPosition += subscribeEmailEl.offsetTop || 0;
    subscribeEmailEl = subscribeEmailEl.offsetParent;
  } while(subscribeEmailEl);

  const priceElm = priceInfoElm.querySelector(".price");

  window.addEventListener('scroll', function() {
    let ctaElmHeight = ctaEl.offsetHeight;
    if(priceElm) {
      ctaElmHeight += priceElm.offsetHeight + 20;
    }

    if(window.pageYOffset > stickyPosition) {
      ctaEl.classList.add("sticky");
      priceInfoElm.style.paddingTop = `${ctaElmHeight}px`;
    } else {
      ctaEl.classList.remove("sticky");
      priceInfoElm.style.paddingTop = 0;
    }
  });
}

main();