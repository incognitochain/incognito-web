import {
  getShippingFee,
  signUp,
  getProductPrice,
  submitCryptoOrder
} from '../service/api';
import isPath from '../common/utils/isPathname';
import storage from '../service/storage';
import { setMessage } from '../service/message_box';
import KEYS from '../constant/keys';
import csc from 'country-state-city';

let globalProductPrice = 199; //product_price

const handleGetProductPrice = async container => {
  globalProductPrice = storage.get(KEYS.PRODUCT_PRICE) || productPrice;
  try {
    const productPrice = await getProductPrice();
    if (productPrice) {
      storage.set(KEYS.PRODUCT_PRICE, productPrice);
      globalProductPrice = productPrice;
    }
  } catch {}

  if (!container) return;
  const productPriceEl = container.querySelector('.product-price');
  if (!productPriceEl) return;
  productPriceEl.innerText = `$${globalProductPrice}`;
};

const handleUserSignup = async ({ name, email }) => {
  try {
    const userData = await signUp({ name: name, email });
    if (userData) {
      const token = userData.Token;
      storage.set(KEYS.TOKEN, token);
      return true;
    }
  } catch {}
  return false;
};

const handleGetShippingFee = async (
  productContainer,
  { address, city, zip, state, country }
) => {
  let quantity = 1;
  let shippingFee = 0;
  let tax = 0;

  try {
    const fee = await getShippingFee({ address, city, zip, state, country });
    if (fee) {
      const productPrice = fee.Price;
      globalProductPrice = productPrice;
      shippingFee = fee.ShippingFee;
      tax = fee.Tax;
    }
  } catch {}

  const subTotalPrice = quantity * globalProductPrice;
  const totalPrice = subTotalPrice + shippingFee + tax;

  if (!productContainer) return;
  const quantityEl = null;
  const subTotalPriceEl = productContainer.querySelector('.sub-total-price');
  const totalPriceEl = productContainer.querySelector('.total-price');
  const shippingPriceEl = productContainer.querySelector('.shipping-price');
  const taxPriceEl = productContainer.querySelector('.tax-price');

  quantity = quantityEl ? quantityEl.value : quantity;

  if (subTotalPriceEl) {
    subTotalPriceEl.innerText = `$${subTotalPrice}`;
  }

  if (shippingPriceEl) {
    shippingPriceEl.innerText = shippingFee ? `$${shippingFee}` : 'FREE';
  }

  if (taxPriceEl) {
    if (tax > 0) {
      taxPriceEl.classList.add('show');
      taxPriceEl.innerText = tax;
    } else {
      taxPriceEl.classList.remove('show');
    }
  }

  if (totalPriceEl) {
    totalPriceEl.innerText = `$${totalPrice}`;
  }
};

const handleSubmitCryptoOrder = async ({
  email,
  name,
  address,
  city,
  state,
  zip,
  country,
  coinName
}) => {
  const quantityEl = null;

  const quantity = quantityEl ? quantityEl.value : 1;

  try {
    const order = await submitCryptoOrder({
      email,
      name,
      address,
      city,
      state,
      zip,
      country,
      coinName,
      quantity
    });
    if (order) {
    }
  } catch {}
};

const handlePayment = async () => {
  const container = document.querySelector('#payment');
  if (!container) return;
  const orderInfoContainer = container.querySelector('#order-info');
  const productContainer = container.querySelector('#product-container');
  const emailEl = container.querySelector('#contact');
  const firstNameEl = container.querySelector('#first-name');
  const lastNameEl = container.querySelector('#last-name');
  const addressStreetEl = container.querySelector('#address');
  const addressCityEl = container.querySelector('#city');
  const addressStateEl = container.querySelector('#state');
  const addressZipEl = container.querySelector('#postal-code');
  const addressCountryEl = container.querySelector('#country');

  if (
    !emailEl ||
    !firstNameEl ||
    !lastNameEl ||
    !addressStreetEl ||
    !addressCityEl ||
    !addressStateEl ||
    !addressZipEl ||
    !addressCountryEl
  ) {
    if (!APP_ENV.production) {
      console.error('missing some elements');
    }

    return;
  }

  const handleChangeState = countryId => {
    addressStateEl.innerHTML = '';

    const states = csc.getStatesOfCountry(countryId);
    addressStateEl.innerHTML = '';

    states.forEach(state => {
      const option = document.createElement('option');
      option.value = state.name;
      option.innerText = state.name;
      addressStateEl.appendChild(option);
    });
  };

  const onSubmitOrderInfo = e => {
    e.preventDefault();
    const email = emailEl.value;
    const firstName = firstNameEl.value || '';
    const lastName = lastNameEl.value || '';
    const name = `${firstName} ${lastName}`;
    const address = addressStreetEl.value;
    const city = addressCityEl.value;
    const state = addressStateEl.value;
    const zip = addressZipEl.value;
    const country = addressCountryEl.value;

    if (!email.trim()) {
      return showErrorMsg('Please enter your email');
    }
    if (!name.trim()) {
      return showErrorMsg('Please enter your first name and last name');
    }
    if (!address.trim()) {
      return showErrorMsg('Please enter your shipping street');
    }
    if (!city.trim()) {
      return showErrorMsg('Please enter your shipping city');
    }
    if (!state.trim()) {
      return showErrorMsg('Please select your shipping state');
    }
    if (!zip.trim()) {
      return showErrorMsg('Please enter your shipping postal code');
    }
    if (!country.trim()) {
      return showErrorMsg('Please select your shipping country');
    }

    if (handleUserSignup({ name, email })) {
    }
  };

  const onCountryChange = async () => {
    const address = addressStreetEl.value;
    const city = addressCityEl.value;
    const state = addressStateEl.value;
    const zip = addressZipEl.value;
    const country = addressCountryEl.value;
    const countryId = addressCountryEl.options[
      addressCountryEl.selectedIndex
    ].getAttribute('id');

    handleChangeState(countryId);
    handleGetShippingFee(productContainer, {
      address,
      city,
      zip,
      state,
      country
    });
  };

  handleGetProductPrice(productContainer);
  addressCountryEl.addEventListener('change', onCountryChange);

  const countries = csc.getAllCountries();
  countries.forEach(country => {
    const option = document.createElement('option');
    option.setAttribute('id', country.id);
    option.value = country.sortname;
    option.innerText = country.name;
    option.selected = country.sortname.toLowerCase() === 'us';
    addressCountryEl.appendChild(option);
  });

  // TODO: add IE polyfill
  addressCountryEl.dispatchEvent(new Event('change'));

  if (orderInfoContainer) {
    orderInfoContainer.addEventListener('submit', onSubmitOrderInfo);
  }
};

const showErrorMsg = message => {
  setMessage(message, 'error');
};

const main = () => {
  if (!isPath('/payment')) return;
  handlePayment();
};

main();
