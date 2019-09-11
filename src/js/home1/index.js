import isPathname from '../common/utils/isPathname';
import YoutubePlayer from '../common/youtubePlayer';
import countdown from '../service/countdown';
import { setMessage } from '../service/message_box';

function main() {
  const container = document.querySelector('#home1-container');

  if (!container) {
    return;
  }

  handleVideoPlayers(container);
  startCountdown(container);
}

const startCountdown = (container) => {
  const countdownEl = container.querySelector('.countdown');
  countdown(countdownEl, '2019-09-25T00:00:00.000', () => {
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
        }
      });
    })
  } catch (e) {
    console.error('handleVideoPlayers failed', e);
  }
}

main();