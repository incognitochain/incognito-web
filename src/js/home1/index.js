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
}

const handleShowTotalSubscriber = async (container) => {
  try {
    const num = await getTotalSubscribe();
    
    if (num) {
      const el = container.querySelector(".total-subcriber span[role='counter']");
      el && (el.innerText = num);
    }
  } catch {}
}

const startCountdown = (container) => {
  const countdownEl = container.querySelector('.countdown');
  countdown(countdownEl, '2019-10-01T00:00:00.000', () => {
    setMessage('The program was ended', 'error');
  });
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

main();