const headerEl = document.querySelector('#header .mobile-sidebar');
const hamburgerBtnEl = headerEl && headerEl.querySelector('.hamburger-btn');
const sidebarEl = headerEl && headerEl.querySelector('.sidebar');
const overlayEl = headerEl && headerEl.querySelector('.overlay');
const closeBtnEl = headerEl && headerEl.querySelector('.close');

hamburgerBtnEl && hamburgerBtnEl.addEventListener('click', () => {
  sidebarEl.classList.add('show');
});

overlayEl && overlayEl.addEventListener('click', () => {
  sidebarEl.classList.remove('show');
});

closeBtnEl && closeBtnEl.addEventListener('click', () => {
  sidebarEl.classList.remove('show');
});