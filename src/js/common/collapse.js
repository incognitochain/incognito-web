import { trackEvent } from './utils/ga';

/**
 * required class: '.collapse'
 */

 const collapse = e => {
  const className = 'show-collapse';
  if (e.classList.contains(className)) {
    e.classList.remove(className);
  } else {
    e.classList.add(className);
  }
};

const els = document.querySelectorAll('.collapse');

els && els.forEach(item => {
  const handleClick = () => collapse(item);
  item.addEventListener('click', () => {
    trackEvent({
      eventCategory: 'Link',
      eventAction: 'toggle collapse',
      eventLabel: 'Toggle FAQs'
    });

    handleClick();
  });
});
