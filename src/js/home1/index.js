import isPathname from '../common/utils/isPathname';
import YoutubePlayer from '../common/youtubePlayer';

function main() {
  if (!isPathname('/')) {
    return;
  }

  const container = document.querySelector('#home1-container');

  handleVideoPlayers(container);
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