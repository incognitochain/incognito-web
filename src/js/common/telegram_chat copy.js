import { trackEvent } from './utils/ga';

const el = document.querySelector('#telegram-chat-float');

if (el) {
  el.addEventListener('click', () => {
    trackEvent({
      eventCategory: 'Telegram action button',
      eventAction: 'Click',
      eventLabel: 'Click on Telegram action button'
    });
  });
}