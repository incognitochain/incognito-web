const headerEl = document.querySelector('#header .mobile-sidebar');
const hamburgerBtnEl = headerEl && headerEl.querySelector('.hamburger-btn');
const sidebarEl = headerEl && headerEl.querySelector('.sidebar');
const overlayEl = headerEl && headerEl.querySelector('.overlay');

hamburgerBtnEl && hamburgerBtnEl.addEventListener('click', () => {
  sidebarEl.classList.add('show');
});

overlayEl && overlayEl.addEventListener('click', () => {
  sidebarEl.classList.remove('show');
});