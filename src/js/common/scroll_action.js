/**
 * required class: 'scroll-action-btn'
 * required attr: 'data-scroll-to'
 */

const els = document.querySelectorAll('.scroll-action-btn');

if (els.length > 0) {
  console.log('aaa');
  els.forEach(el => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-scroll-to');
      const scrollEl = target && document.querySelector(target);
      scrollEl && scrollEl.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
