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

const storeInformation = newPaymentInfo => {
  const paymentInfo = getInformation();
  const newInfo = { ...paymentInfo, ...newPaymentInfo };

  storage.set(KEYS.PAYMENT_INFORMATION, JSON.stringify(newInfo));
};

const getInformation = () => {
  try {
    const json = storage.get(KEYS.PAYMENT_INFORMATION);
    const paymentInfo = JSON.parse(json);
    return paymentInfo;
  } catch (error) {
    console.error(error);
    storage.set(KEYS.PAYMENT_INFORMATION, '{}');
    return {};
  }
};

const toggleInformation = () => {
  const informationElement = document.getElementById('information');
  informationElement.classList.toggle('hidden');
};

const togglePayment = () => {
  const paymentElement = document.getElementById('payment-container');
  paymentElement.classList.toggle('hidden');
};

const addListenerForLinks = () => {
  const links = document.getElementsByClassName('link');
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', event => {
      event.preventDefault();
      toggleInformation();
      togglePayment();
    });
  }
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

const handleSubmitCryptoOrder = async (
  container,
  { address, city, state, zip, country, quantity, coinName }
) => {
  try {
    const order = await submitCryptoOrder({
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
  } catch (e) {
    setMessage(e.message, 'error');
  }
};

const handlePayment = async () => {
  const container = document.querySelector('#payment');
  if (!container) return;
  const orderInfoContainer = container.querySelector('#order-info');
  const productContainer = container.querySelector('#product-container');
  const paymentContainer = container.querySelector('#payment-container');
  const emailEl = container.querySelector('#email');
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

  const fillInformation = () => {
    const paymentInformation = getInformation();
    if (!paymentInformation) return;
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    } = paymentInformation;

    emailEl.value = email;
    firstNameEl.value = firstName;
    lastNameEl.value = lastName;
    addressStreetEl.value = address;
    addressCityEl.value = city;
    addressStreetEl.value = state;
    addressZipEl.value = zip;
    addressCountryEl.value = country;
  };

  const handleAddressStateChange = countryId => {
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
      storeInformation({
        email,
        address,
        name,
        city,
        zip,
        country,
        state,
        step: 1,
        firstName,
        lastName
      });
      toggleInformation();
      togglePayment();
    }

    return false;
  };

  const onSubmitPayment = () => {
    const address = addressStreetEl.value;
    const city = addressCityEl.value;
    const state = addressStateEl.value;
    const zip = addressZipEl.value;
    const country = addressCountryEl.value;
    const quantity = 1;

    if (!paymentContainer) return;
    const coinNameEl = paymentContainer.querySelector('#coin-name');
    if (!coinNameEl) return;
    const coinName = coinNameEl.value;

    if (!coinNameEl) {
      return showErrorMsg('Please select a coin');
    }

    handleSubmitCryptoOrder(container, {
      address,
      city,
      state,
      zip,
      country,
      coinName,
      quantity
    });
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

    handleAddressStateChange(countryId);
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

  addListenerForLinks();
  fillInformation();

  if (orderInfoContainer) {
    orderInfoContainer.addEventListener('submit', onSubmitOrderInfo);
  }

  if (paymentContainer) {
    const submitPaymentBtnEl = paymentContainer.querySelector(
      '#submit-payment-btn'
    );
    if (!submitPaymentBtnEl) return;
    submitPaymentBtnEl.addEventListener('click', onSubmitPayment);
  }
};

const showErrorMsg = message => {
  setMessage(message, 'error');
};

const main = () => {
  if (!isPath('/payment')) return;

  const paymentInformation = getInformation();
  if (
    paymentInformation &&
    paymentInformation.name &&
    paymentInformation.email &&
    paymentInformation.step === 1
  ) {
    toggleInformation();
  } else {
    togglePayment();
  }

  handlePayment();
};

main();
