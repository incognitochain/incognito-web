export const trackEvent = ({ eventCategory, eventAction, eventLabel, eventValue } = {}) => {
  if (typeof window.ga !== 'function') {
    return;
  }

  window.ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
}