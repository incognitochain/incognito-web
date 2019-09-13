import isPathname from '../common/utils/isPathname';
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

const main = () => {
  if (!container) return;

  highlightItem();
}

main();