// import { trackEvent } from './utils/ga';

/**
 * required class: '.collapse-container'
 */

const collapseClassName = 'show-collapse';

const show = e => e && e.classList.add(collapseClassName);

const hide = e => e && e.classList.remove(collapseClassName);

const getCollapseGroups = () =>
  document.querySelectorAll('.collapse-container');

const getItems = collapse => collapse && collapse.querySelectorAll('.collapse');

const main = () => {
  const collapses = getCollapseGroups();
  collapses &&
    collapses.forEach(collapse => {
      const autoCollapseFirstItem =
        collapse.getAttribute('auto-collapse-first-item') || '';
      let currentItem = null;
      const items = getItems(collapse);

      const toggle = item => {
        if (currentItem === item) {
          hide(currentItem);
          currentItem = null;
        } else {
          hide(currentItem);
          show(item);
          currentItem = item;
        }
      };

      items &&
        items.forEach((item, index) => {
          if (autoCollapseFirstItem.toLowerCase() === 'true' && index === 0)
            toggle(item);

          const label = item.querySelector('.label');

          label &&
            label.addEventListener('click', () => {
              // trackEvent({
              //   eventCategory: 'Link',
              //   eventAction: 'toggle collapse',
              //   eventLabel: 'Toggle Collapse'
              // });

              toggle(item);
              label && label.scrollIntoView({ block: 'start' });
            });
        });
    });
};

main();
