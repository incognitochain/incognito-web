import KEYS from '../constant/keys';
import {
  trackEvent,
  addCartTrackEvent,
  checkoutTrackEvent
} from '../common/utils/ga';
import { isEmail } from '../common/utils/validate';
import { setMessage } from '../service/message_box';
import { signUpAndSaveToStorage } from '../common/user';
import { handleSelectElementChanged, handleInputChange } from '../common/form';
import storage from '../service/storage';
import LoadingButton from '../common/loading_button';
import AddressForm from './address_form';

export default class OrderInformation {
  constructor(container, cart, onSubmitSuccess) {
    if (!container) {
      throw new Error('container not found');
    }

    if (!cart) {
      throw new Error('cart not found');
    }

    this.parentContainer = container;
    this.cart = cart;
    this.onSubmitSuccess = onSubmitSuccess;
    this.container = this.parentContainer.querySelector(
      '#order-information-container'
    );

    this.setup();
  }

  getOrderInformationForm() {
    if (!this.container) return;
    return this.container.querySelector('form#order-info');
  }

  getOrderInformationElements() {
    if (!this.container || !this.addressForm) return {};
    const orderInformationFormEl = this.getOrderInformationForm();
    const emailEl = orderInformationFormEl.querySelector('#email');
    const submitBtnEl = orderInformationFormEl.querySelector(
      '#submit-order-btn'
    );

    const {
      firstNameEl,
      lastNameEl,
      addressEl,
      cityEl,
      stateEl,
      zipEl,
      countryEl
    } = this.addressForm.getAddressFormElements();

    return {
      emailEl,
      firstNameEl,
      lastNameEl,
      addressEl,
      cityEl,
      stateEl,
      zipEl,
      countryEl,
      submitBtnEl
    };
  }

  getOrderInformationValues() {
    const {
      emailEl,
      firstNameEl,
      lastNameEl,
      addressEl,
      cityEl,
      stateEl,
      zipEl,
      countryEl
    } = this.getOrderInformationElements();
    let email = '';
    let firstName = '';
    let lastName = '';
    let address = '';
    let city = '';
    let state = '';
    let zip = '';
    let country = 'US';

    if (emailEl) email = emailEl.value.trim();
    if (firstNameEl) firstName = firstNameEl.value.trim();
    if (lastNameEl) lastName = lastNameEl.value.trim();
    if (addressEl) address = addressEl.value.trim();
    if (cityEl) city = cityEl.value.trim();
    if (stateEl) state = stateEl.value.trim();
    if (zipEl) zip = zipEl.value.trim();
    if (countryEl) country = countryEl.value.trim();

    return { email, firstName, lastName, address, city, state, zip, country };
  }

  setup() {
    const orderInformationFormEl = this.getOrderInformationForm();
    if (!orderInformationFormEl) return;
    this.addressForm = new AddressForm(orderInformationFormEl, 'shipping');
    this.handleFormValidation(orderInformationFormEl);

    const { countryEl, emailEl } = this.getOrderInformationElements();
    countryEl &&
      handleSelectElementChanged(countryEl, this.onCountryChange.bind(this));
    emailEl && handleInputChange(emailEl);

    orderInformationFormEl.addEventListener(
      'submit',
      this.onSubmitForm.bind(this)
    );

    this.fillOrderInformationForm();
  }

  async onSubmitForm(e) {
    e.preventDefault();
    const orderInformationFormEl = this.getOrderInformationForm();
    if (!this.isFormValidated(orderInformationFormEl)) return;

    const { submitBtnEl } = this.getOrderInformationElements();
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    } = this.getOrderInformationValues();

    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Submit shipping information'
    });

    const submitBtnLoading = new LoadingButton(submitBtnEl);
    submitBtnLoading.show();

    try {
      const isSignedIn = await this.handleSignUp({ name, email });

      if (isSignedIn) {
        this.storeOrderInformationToLocalStorage({
          email,
          firstName,
          lastName,
          address,
          name,
          city,
          zip,
          country,
          state,
          step: 1
        });

        if (this.onSubmitSuccess) {
          this.onSubmitSuccess({
            firstName,
            lastName,
            address,
            city,
            state,
            zip,
            country
          });
        }

        // trackAddCartEvent();
        this.trackSelectShippingEvent();
      }
    } catch {
      setMessage(
        'There has been a temporary error processing your request, please try again shortly.',
        'error'
      );
    } finally {
      submitBtnLoading.hide();
    }

    return false;
  }

  onCountryChange(e) {
    const {
      address,
      city,
      state,
      zip,
      country
    } = this.getOrderInformationValues();
    this.cart.getShippingFeeFromServer({ address, city, state, zip, country });
  }

  isFormValidated(formContainer) {
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
  }

  storeOrderInformationToLocalStorage(newPaymentInfo) {
    const paymentInfo = this.getOrderInformationFromLocalStorage();
    const newInfo = { ...paymentInfo, ...newPaymentInfo };

    storage.set(KEYS.PAYMENT_INFORMATION, JSON.stringify(newInfo));
  }

  getOrderInformationFromLocalStorage() {
    try {
      const json = storage.get(KEYS.PAYMENT_INFORMATION) || '{}';
      const paymentInfo = JSON.parse(json);
      return paymentInfo;
    } catch (error) {
      if (!APP_ENV.production) {
        console.error(error);
      }
    }
    return {};
  }

  fillOrderInformationForm() {
    const { emailEl } = this.getOrderInformationElements();
    const {
      email,
      address,
      city,
      zip,
      country,
      state,
      firstName,
      step,
      lastName
    } = this.getOrderInformationFromLocalStorage();

    if (emailEl && email) {
      emailEl.value = email;
      emailEl.dispatchEvent(new Event('input'));
    }
    this.addressForm &&
      this.addressForm.fillInformation({
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country
      });

    if (step === 1 && this.onSubmitSuccess) {
      this.onSubmitSuccess({
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country
      });
    }
  }

  async handleSignUp({ name, email }) {
    try {
      return await signUpAndSaveToStorage({ name: name, email });
    } catch (e) {
      setMessage(e.message, 'error');
    }
    return false;
  }

  handleSelectElementChanged(element, onChange) {
    element.addEventListener('blur', onChange);
    element.addEventListener('change', onChange);
  }

  handleFormValidation(container) {
    const validatorClassName = 'validator';
    const errorClassName = 'error';

    const addError = field => {
      const message = field.getAttribute('error_message') || 'Enter a value';
      let validatorEl = field.parentNode.querySelector(
        `.${validatorClassName}`
      );
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
      field.addEventListener('input', function() {
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
  }

  // GA Tracking

  trackAddCartEvent() {
    const {
      quantity,
      price,
      productId: id = 'node',
      productName: name = 'Node'
    } = this.cart.getCart();

    addCartTrackEvent({ id, name, price, quantity });
  }

  trackSelectShippingEvent() {
    const {
      quantity,
      price,
      productId: id = 'node',
      productName: name = 'Node'
    } = this.cart.getCart();

    checkoutTrackEvent({
      product: {
        id,
        name,
        price,
        quantity
      },
      options: {
        step: 1
      }
    });
  }
}
