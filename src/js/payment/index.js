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

const handleGetProductPrice = async () => {
  globalProductPrice = storage.get(KEYS.PRODUCT_PRICE) || productPrice;
  try {
    const productPrice = await getProductPrice();
    if (productPrice) {
      storage.set(KEYS.PRODUCT_PRICE, productPrice);
      globalProductPrice = productPrice;
    }
  } catch {}
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

const handleGetShippingFee = async ({ address, city, zip, state, country }) => {
  const quantityEl = null;
  const totalPriceEl = null;
  const shippingPriceEl = null;
  const taxPriceEl = null;

  const quantity = quantityEl ? quantityEl.value : 1;
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

  const totalPrice = quantity * globalProductPrice;

  if (shippingPriceEl) {
    shippingPriceEl.innerText = shippingFee || 'FREE';
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
    totalPriceEl.innerText = totalPrice;
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

  const countries = csc.getAllCountries();
  countries.forEach(country => {
    const option = document.createElement('option');
    option.setAttribute('id', country.id);
    option.value = country.sortname;
    option.innerText = country.name;
    if (country.sortname.toLowerCase() === 'us') {
      option.selected = true;
      handleChangeState(country.id);
    }
    addressCountryEl.appendChild(option);
  });

  const onSubmitOrderInfo = () => {
    const email = emailEl.value;
    const firstName = firstNameEl.value || '';
    const lastName = lastNameEl.value || '';
    const name = `${firstName} ${lastName}`;
    const address = addressStreetEl.value;
    const city = addressCityEl.value;
    const state = addressStateEl.value;
    const zip = addressZipEl.value;
    const country = addressCountryEl.value;

    if (!email) {
      return showErrorMsg('Please enter your email');
    }
    if (!name) {
      return showErrorMsg('Please enter your first name and last name');
    }
    if (!address) {
      return showErrorMsg('Please enter your shipping street');
    }
    if (!city) {
      return showErrorMsg('Please enter your shipping city');
    }
    if (!state) {
      return showErrorMsg('Please select your shipping state');
    }
    if (!zip) {
      return showErrorMsg('Please enter your shipping postal code');
    }
    if (!country) {
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
    handleGetShippingFee({ address, city, zip, state, country });
  };

  addressCountryEl.addEventListener('change', onCountryChange);
};

const showErrorMsg = message => {
  setMessage(message, 'error');
};

const main = () => {
  if (!isPath('/payment')) return;
  handleGetProductPrice();
  handlePayment();
};

main();
