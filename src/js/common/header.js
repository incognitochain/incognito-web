import isPathname from '../common/utils/isPathname';
import { trackEvent } from './utils/ga';
const container = document.querySelector('nav#header .desktop-menu');

const highlightItem = () => {
  const className = 'highlight-btn';
  const items = container.querySelectorAll('.menu-item');

  items.forEach(item => {
    if (isPathname(item.pathname)) {
      item.classList.add(className);
    } else {
      item.classList.remove(className);
    }
  });
}

const trackMenuItemEvent = (container) => {
  const els = container.querySelectorAll('.menu-item');

  if (els && els.length) {
    els.forEach(el => {
      el.addEventListener('click', () => {

        trackEvent({
          eventCategory: 'Menu item',
          eventAction: 'Click',
          eventLabel: `Click on menu item ${el.pathname}`
        });
      });
    })
  }
}

const main = () => {
  if (!container) return;

  trackMenuItemEvent(container);
  highlightItem();
}


main();

