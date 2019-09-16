export const trackEvent = ({ eventCategory, eventAction, eventLabel, eventValue } = {}) => {
  if (typeof window.ga !== 'function') {
    return;
  }

  console.log('Track event', {eventCategory, eventAction, eventLabel, eventValue});
  window.ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
}