import isPath from '../common/utils/isPathname';
import Cart from './cart';
import Payment from './payment';
import YoutubePlayer from '../common/youtubePlayer';
import $ from 'jquery';
const handlePaymentGuide = container => {
  const paymentGuideContainers = container.querySelectorAll(
    '.crypto-payment-guide'
  );
  paymentGuideContainers.forEach(paymentGuideContainer => {
    const guides = paymentGuideContainer.querySelectorAll('.guide-link');
    guides.forEach(guide => {
      const videoUrl = guide.getAttribute('video-url');
      if (!videoUrl) return;
      guide.addEventListener('click', () => {
        const youtubePlayer = new YoutubePlayer(videoUrl);
        youtubePlayer.play();
      });
    });
  });
};

const main = () => {
  if (!isPath('/payment')) return;

  const container = document.querySelector('#payment');
  if (!container) return;

  handlePaymentGuide(container);

  const cart = new Cart(container);
  const payment = new Payment(container, cart);
};

$(document).ready(() => {
  main();
});
