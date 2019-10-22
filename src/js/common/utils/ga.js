export const trackEvent = ({
  eventCategory,
  eventAction,
  eventLabel,
  eventValue,
  hitCallback
} = {}) => {
  if (typeof window.ga !== 'function') {
    return;
  }

  console.log('Track event', {
    eventCategory,
    eventAction,
    eventLabel,
    eventValue
  });
  window.ga(
    'send',
    'event',
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    hitCallback && {
      hitCallback: function() {
        hitCallback();
      }
    }
  );
};

const addProductTrackEvent = ({
  id,
  name,
  category = '',
  brand = '',
  variant = '',
  price = 0,
  quantity = 1,
  coupon = '',
  position = 1
}) => {
  if (typeof window.ga !== 'function') return;

  console.log('Add product track event', {
    id,
    name,
    category,
    brand,
    variant,
    price,
    quantity,
    coupon,
    position
  });
  window.ga('ec:addProduct', {
    id,
    name,
    category,
    brand,
    variant,
    price,
    quantity,
    coupon,
    position
  });
};

const setActionTrackEvent = (action, options) => {
  if (typeof window.ga !== 'function') return;

  console.log('Set action track event', { action, options });
  window.ga('ec:setAction', action, { ...options });
};

export const checkoutTrackEvent = (
  { product, options },
  checkoutType = 'checkout'
) => {
  addProductTrackEvent({ ...product });
  setActionTrackEvent(checkoutType, options);
};

export const addCartTrackEvent = product => {
  addProductTrackEvent(product);
  setActionTrackEvent('add');
};

export const purchaseTrackEvent = ({ product, options }) => {
  addProductTrackEvent({ ...product });
  setActionTrackEvent('purchase', options);
};
