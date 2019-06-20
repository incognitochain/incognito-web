import { trackEvent } from './utils/ga';

const headerEl = document.querySelector('#header .mobile-sidebar');
const hamburgerBtnEl = headerEl && headerEl.querySelector('.hamburger-btn');
const sidebarEl = headerEl && headerEl.querySelector('.sidebar');
const overlayEl = headerEl && headerEl.querySelector('.overlay');
const closeBtnEl = headerEl && headerEl.querySelector('.close');

hamburgerBtnEl && hamburgerBtnEl.addEventListener('click', () => {
  trackEvent({
    eventCategory: 'Menu',
    eventAction: 'click',
    eventLabel: 'Open menu sidebar'
  });

  sidebarEl.classList.add('show');
});

overlayEl && overlayEl.addEventListener('click', () => {
  trackEvent({
    eventCategory: 'Menu',
    eventAction: 'click',
    eventLabel: 'Close menu sidebar'
  });

  sidebarEl.classList.remove('show');
});

closeBtnEl && closeBtnEl.addEventListener('click', () => {
  trackEvent({
    eventCategory: 'Menu',
    eventAction: 'click',
    eventLabel: 'Close menu sidebar'
  });
  
  sidebarEl.classList.remove('show');
});