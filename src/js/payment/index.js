import {
  getShippingFee,
  signUp,
  getProductPrice,
  submitCryptoOrder,
  submitPaypalOrder
} from '../service/api';
import isPath from '../common/utils/isPathname';
import storage from '../service/storage';
import { setMessage } from '../service/message_box';
import KEYS from '../constant/keys';
import csc from 'country-state-city';
import { isEmail } from '../common/utils/validate';
import { trackEvent } from '../common/utils/ga';
import queryString from '../service/queryString';

let globalProductPrice = 399; //product_price

const handleGetProductPrice = async container => {
  globalProductPrice = storage.get(KEYS.PRODUCT_PRICE) || globalProductPrice;
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

  updateCart({ price: globalProductPrice });
};

const handleUserSignup = async ({ name, email }) => {
  try {
    const userData = await signUp({ name: name, email });
    if (userData) {
      const token = userData.Token;
      storage.set(KEYS.TOKEN, token);
      return true;
    }
  } catch (e) {
    showErrorMsg(e.message);
  }
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

    if (!json) {
      return {};
    }

    const paymentInfo = JSON.parse(json);
    return paymentInfo;
  } catch (error) {
    if (!APP_ENV.production) {
      console.error(error);
    }
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

const handleChange = event => {
  const target = event.target || event;
  const value = target.value.trim();

  if (value && value.length > 0) {
    target.parentElement.classList.add('has-value');
  } else if (value.length === 0) {
    target.parentElement.classList.remove('has-value');
  }
};

const updateCart = ({
  price,
  shippingFee = 0,
  tax = 0,
  quantity = 1,
  saveCart = false
}) => {
  const productContainer = document.querySelector(
    '#payment #product-container'
  );

  const subTotalPrice = quantity * price;
  const totalPrice = subTotalPrice + shippingFee + tax;

  if (!productContainer) return;
  const quantityEl = null;
  const subTotalPriceEl = productContainer.querySelector('.sub-total-price');
  const totalPriceEl = productContainer.querySelector('.total-price');
  const shippingPriceEl = productContainer.querySelector('.shipping-price');
  const taxPriceEl = productContainer.querySelector('.tax-price');
  const productPriceEl = productContainer.querySelector('.product-price');

  quantity = quantityEl ? quantityEl.value : quantity;

  if (productPriceEl) {
    productPriceEl.innerText = `$${price}`;
  }

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

  if (saveCart) {
    saveCartInformation({
      price,
      shippingFee,
      tax,
      quantity,
      totalPrice
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
      globalProductPrice = productPrice || globalProductPrice;
      shippingFee = fee.ShippingFee;
      tax = fee.Tax;
    }
  } catch {}

  updateCart({
    price: globalProductPrice,
    quantity,
    shippingFee,
    tax,
    saveCart: true
  });
};

const resetPayment = () => {
  storage.set(KEYS.PAYMENT_INFORMATION, '');
};

const saveCartInformation = cart => {
  try {
    storage.set(KEYS.CART_INFORMATION, JSON.stringify(cart));
  } catch {}
};

const getCartInformation = () => {
  let cart = {};

  try {
    cart = JSON.parse(storage.get(KEYS.CART_INFORMATION) || '{}');
  } catch {}

  return cart;
};

const handleSubmitCryptoOrder = async (
  container,
  {
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country,
    quantity,
    coinName
  }
) => {
  const paymentContainer = container.querySelector('#payment-container');
  const submitPaymentBtnEl = paymentContainer.querySelector(
    '#submit-payment-btn'
  );
  if (submitPaymentBtnEl) {
    submitPaymentBtnEl.disabled = true;
    submitPaymentBtnEl.classList.add('loading');
  }

  try {
    const order = await submitCryptoOrder({
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country,
      coinName,
      quantity
    });
    if (order) {
      const thankyouContainer = container.querySelector('#thank-you-container');
      if (!thankyouContainer) return;
      const coinPriceEl = thankyouContainer.querySelector('.coin-price');
      const coinNameEl = thankyouContainer.querySelector('.coin-name');
      const walletAddressEl = thankyouContainer.querySelector(
        '#wallet-address'
      );
      const iconEl = thankyouContainer.querySelector('.icon');
      if (coinPriceEl) {
        coinPriceEl.innerText = order.TotalAmount;
      }
      if (coinNameEl) {
        coinNameEl.innerText = coinName;
      }
      if (walletAddressEl) {
        walletAddressEl.innerText = order.Address;
        walletAddressEl.setAttribute('data-copy-value', order.Address);
      }
      if (iconEl) {
        try {
          iconEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.Address}`;
          iconEl.classList.remove('hidden');
        } catch {}
      }
      togglePayment();
      thankyouContainer.classList.remove('hidden');
      resetPayment();
    }
  } catch (e) {
    setMessage(e.message, 'error');
  } finally {
    if (submitPaymentBtnEl) {
      submitPaymentBtnEl.disabled = false;
      submitPaymentBtnEl.classList.remove('loading');
    }
  }
};

const handlePayment = async container => {
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
  const coinNameEl = paymentContainer.querySelector('#coin-name');

  if (
    !emailEl ||
    !firstNameEl ||
    !lastNameEl ||
    !addressStreetEl ||
    !addressCityEl ||
    !addressStateEl ||
    !addressZipEl ||
    !addressCountryEl ||
    !coinNameEl
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

    emailEl.addEventListener('input', handleChange);
    firstNameEl.addEventListener('input', handleChange);
    lastNameEl.addEventListener('input', handleChange);
    addressStreetEl.addEventListener('input', handleChange);
    addressCityEl.addEventListener('input', handleChange);
    addressStateEl.addEventListener('input', handleChange);
    addressZipEl.addEventListener('input', handleChange);
    addressCountryEl.addEventListener('input', handleChange);
    coinNameEl.addEventListener('input', handleChange);

    if (email) {
      emailEl.value = email;
    }

    if (firstName) {
      firstNameEl.value = firstName;
    }

    if (lastName) {
      lastNameEl.value = lastName;
    }

    if (address) {
      addressStreetEl.value = address;
    }

    if (city) {
      addressCityEl.value = city;
    }

    if (zip) {
      addressZipEl.value = zip;
    }

    if (country) {
      addressCountryEl.value = country;
      addressCountryEl.dispatchEvent(new Event('change'));

      if (state) {
        addressStateEl.value = state;
      }
    }

    handleChange(emailEl);
    handleChange(firstNameEl);
    handleChange(lastNameEl);
    handleChange(addressStreetEl);
    handleChange(addressCityEl);
    handleChange(addressStateEl);
    handleChange(addressZipEl);
    handleChange(addressCountryEl);
    handleChange(coinNameEl);

    updateShipTo({ firstName, lastName, address, city, state, zip, country });
  };

  const updateShipTo = ({
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country
  }) => {
    const shipTo = `${firstName} ${lastName}, ${address}, ${city}, ${state} ${zip}, ${country}`;
    const shipToEl = paymentContainer.querySelector('#ship-to');
    if (shipToEl) shipToEl.innerText = shipTo;
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

  const onSubmitOrderInfo = async e => {
    e.preventDefault();
    if (!checkValidForm(orderInfoContainer)) return;

    const email = emailEl.value.trim();
    const firstName = (firstNameEl.value || '').trim();
    const lastName = (lastNameEl.value || '').trim();
    const name = `${firstName} ${lastName}`.trim();
    const address = addressStreetEl.value.trim();
    const city = addressCityEl.value.trim();
    const state = addressStateEl.value.trim();
    const zip = addressZipEl.value.trim();
    const country = addressCountryEl.value.trim();

    trackEvent({
      eventCategory: 'Button',
      eventAction: 'submit',
      eventLabel: 'Submit email and shipping info'
    });

    const submitBtnEl = orderInfoContainer.querySelector('#submit-order-btn');
    if (submitBtnEl) {
      submitBtnEl.disabled = true;
      submitBtnEl.classList.add('loading');
    }

    const isSignedIn = await handleUserSignup({ name, email });
    if (submitBtnEl) {
      submitBtnEl.disabled = false;
      submitBtnEl.classList.remove('loading');
    }

    if (isSignedIn) {
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
      updateShipTo({ firstName, lastName, address, city, state, zip, country });
      toggleInformation();
      togglePayment();
    }

    return false;
  };

  const onSubmitPayment = () => {
    const firstName = firstNameEl.value || '';
    const lastName = lastNameEl.value || '';
    const address = addressStreetEl.value;
    const city = addressCityEl.value;
    const state = addressStateEl.value;
    const zip = addressZipEl.value;
    const country = addressCountryEl.value;
    const quantity = 1;

    if (!paymentContainer) return;

    if (!coinNameEl) return;
    const coinName = coinNameEl.value;

    if (!coinNameEl) {
      return showErrorMsg('Please select a coin');
    }

    trackEvent({
      eventCategory: 'Button',
      eventAction: 'submit',
      eventLabel: `Submit payment with crypto: ${coinName}`
    });

    handleSubmitCryptoOrder(container, {
      firstName,
      lastName,
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
    await handleGetShippingFee(productContainer, {
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
  let selectedCountryId = -1;
  countries.forEach(country => {
    const option = document.createElement('option');
    option.setAttribute('id', country.id);
    option.value = country.sortname;
    option.innerText = country.name;
    option.selected = country.sortname.toLowerCase() === 'us';
    selectedCountryId =
      country.sortname.toLowerCase() === 'us' ? country.id : selectedCountryId;
    addressCountryEl.appendChild(option);
  });

  if (selectedCountryId > -1) handleAddressStateChange(selectedCountryId);
  handleFormValidation(orderInfoContainer);

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

const showLoading = container => {
  container = container || document.querySelector('#payment');
  const loadingContainer = container.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.classList.remove('hidden');
  }
};

const hideLoading = container => {
  container = container || document.querySelector('#payment');
  const loadingContainer = container.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.classList.add('hidden');
  }
};
//// FORM VALIDATION

const handleFormValidation = container => {
  const validatorClassName = 'validator';
  const errorClassName = 'error';

  const addError = field => {
    const message = field.getAttribute('error_message') || 'Enter a value';
    let validatorEl = field.parentNode.querySelector(`.${validatorClassName}`);
    if (!validatorEl) {
      validatorEl = document.createElement('div');
      validatorEl.classList.add(validatorClassName);
      field.parentNode.insertBefore(validatorEl, field.nextSibling);
    }
    validatorEl.innerHTML = message;
    field.classList.add(errorClassName);
    field.setAttribute('validated', false);
  };

  const removeError = field => {
    const validatorClassName = 'validator';
    const validatorEl = field.parentNode.querySelector(
      `.${validatorClassName}`
    );
    if (validatorEl) validatorEl.remove();
    field.classList.remove(errorClassName);
    field.setAttribute('validated', true);
  };

  const handleInputChange = field => {
    field.addEventListener('change', function() {
      const value = this.value.trim();
      const isEmailRequired =
        this.getAttribute('email_required') === 'true' || false;

      if (!value || (isEmailRequired && !isEmail(value))) {
        addError(field);
        return false;
      } else {
        removeError(field);
        return true;
      }
    });
  };
  const formFields = container.querySelectorAll('input, select');

  formFields.forEach(field => {
    const isRequired = field.required;
    if (!isRequired) {
      field.setAttribute('validated', true);
    }
    handleInputChange(field);
  });
};

const checkValidForm = formContainer => {
  const formFields = formContainer.querySelectorAll('input, select');

  for (let i = 0; i < formFields.length; i++) {
    const field = formFields[i];
    const fieldValidated = field.getAttribute('validated');
    const isFieldValid = fieldValidated ? fieldValidated === 'true' : true;
    if (!isFieldValid) {
      return false;
    }
  }

  return true;
};

//// PAYPALLLLL

const handlePaypalExpressButton = container => {
  paypal
    .Buttons({
      style: {
        height: 44,
        color: 'blue'
      },
      createOrder: (data, actions) => {
        const cart = getCartInformation();
        const { totalPrice = 0.01 } = cart;
        return actions.order.create({
          application_context: {
            shipping_preference: 'NO_SHIPPING',
            landing_page: 'BILLING',
            return_url: `${window.location}/payment.html`
          },
          purchase_units: [
            {
              amount: {
                value: totalPrice,
                currency_code: 'USD'
              }
            }
          ]
        });
      },
      onApprove: async (data, actions) => {
        const orderId = data.orderID;
        showLoading(container);
        try {
          const paymentInformation = getInformation();
          const {
            firstName,
            lastName,
            address,
            city,
            state,
            zip,
            country,
            quantity = 1
          } = paymentInformation;

          const orderInfo = await submitPaypalOrder({
            firstName,
            lastName,
            address,
            city,
            state,
            country,
            zip,
            orderId,
            quantity
          });

          resetPayment();
          window.location = '/thank-you.html';
        } catch (e) {
          showErrorMsg(e.message);
          actions.reject();
        } finally {
          hideLoading(container);
        }
      },
      onCancel: (data, actions) => {},
      onError: (data, actions) => {}
    })
    .render('#paypal-express-checkout-button');
};

const main = () => {
  if (!isPath('/payment')) return;

  const container = document.querySelector('#payment');
  if (!container) return;

  const testMode = queryString('testmode') || false;

  if (testMode) {
    const paypalEl = container.querySelector('#pay-with-paypal');
    if (paypalEl) {
      paypalEl.classList.remove('hidden');
    }
  }

  const paymentInformation = getInformation();
  if (
    paymentInformation &&
    paymentInformation.name &&
    paymentInformation.email
  ) {
    toggleInformation();
  } else {
    togglePayment();
  }

  handlePayment(container);
  handlePaypalExpressButton(container);
};

main();
