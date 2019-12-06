import { trackEvent } from '@/js/common/utils/ga';

const main = () => {
  const trackingElements = document.querySelectorAll('*[ga-tracking]');

  for (let trackingElement of trackingElements) {
    trackingElement.addEventListener('click', function() {
      const eventCategory = this.getAttribute('data-ga-event-category');
      const eventAction = this.getAttribute('data-ga-event-action');
      const eventLabel = this.getAttribute('data-ga-event-label');
      const eventValue = this.getAttribute('data-ga-event-value');

      trackEvent({
        eventCategory,
        eventAction,
        eventLabel,
        eventValue
      });
    });
  }
};

main();
