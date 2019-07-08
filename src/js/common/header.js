const container = document.querySelector('nav#header .desktop-menu');

const highlightItem = () => {
  const className = 'highlight-btn';
  const items = container.querySelectorAll('.menu-item');
  const currentRoute = location.pathname;

  items.forEach(item => {
    if (currentRoute === item.pathname) {
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