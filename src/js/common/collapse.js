import { trackEvent } from './utils/ga';

/**
 * required class: '.collapse-container'
 */

const collapseClassName = 'show-collapse';

const show = e => e && e.classList.add(collapseClassName);

const hide = e => e && e.classList.remove(collapseClassName);

const getCollapseGroups = () => document.querySelectorAll('.collapse-container');

const getItems = collapse => collapse && collapse.querySelectorAll('.collapse');

const main = () => {
  const collapses = getCollapseGroups();
  collapses && collapses.forEach(collapse => {
    let currentItem = null;
    const items = getItems(collapse);

    const toggle = (item) => {
      if (currentItem === item) {
        hide(currentItem);
        currentItem = null;
      } else {
        show(item);
        hide(currentItem);
        currentItem = item;
      }
    };

    items && items.forEach((item, index) => {
      if (index === 0) toggle(item);

      item && item.addEventListener('click', () => {
        trackEvent({
          eventCategory: 'Link',
          eventAction: 'toggle collapse',
          eventLabel: 'Toggle Collapse'
        });

        toggle(item);
      });
    })
  });
};

main();