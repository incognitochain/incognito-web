import csc from 'country-state-city';
import KEYS from '../constant/keys';
import { trackEvent } from '../common/utils/ga';
import { isEmail } from '../common/utils/validate';
import { setMessage } from '../service/message_box';
import { signUp } from '../service/api';
import storage from '../service/storage';
import LoadingButton from '../common/loading_button';

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
    if (!this.container) return {};
    const orderInformationFormEl = this.getOrderInformationForm();
    const emailEl = orderInformationFormEl.querySelector('#email');
    const firstNameEl = orderInformationFormEl.querySelector('#first-name');
    const lastNameEl = orderInformationFormEl.querySelector('#last-name');
    const addressEl = orderInformationFormEl.querySelector('#address');
    const cityEl = orderInformationFormEl.querySelector('#city');
    const stateEl = orderInformationFormEl.querySelector('#state');
    const zipEl = orderInformationFormEl.querySelector('#postal-code');
    const countryEl = orderInformationFormEl.querySelector('#country');
    const submitBtnEl = orderInformationFormEl.querySelector(
      '#submit-order-btn'
    );

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
    this.handleFormValidation(orderInformationFormEl);

    const { countryEl } = this.getOrderInformationElements();
    if (countryEl)
      this.handleSelectElementChanged(
        countryEl,
        this.onCountryChange.bind(this)
      );

    const countries = csc.getAllCountries();
    let selectedCountryId = -1;
    countries.forEach(country => {
      const option = document.createElement('option');
      option.setAttribute('id', country.id);
      option.value = country.sortname;
      option.innerText = country.name;
      option.selected = country.sortname.toLowerCase() === 'us';
      selectedCountryId =
        country.sortname.toLowerCase() === 'us'
          ? country.id
          : selectedCountryId;
      countryEl.appendChild(option);
    });
    this.updateAddressStateList(selectedCountryId);

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
      eventCategory: 'Button',
      eventAction: 'click',
      eventLabel: 'Submit email and shipping info'
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
    const target = e.target;
    const {
      address,
      city,
      state,
      zip,
      country
    } = this.getOrderInformationValues();
    this.cart.getShippingFeeFromServer({ address, city, state, zip, country });

    const countryId = target.options[target.selectedIndex].getAttribute('id');
    this.updateAddressStateList(countryId);
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

  updateAddressStateList(countryId) {
    const { stateEl } = this.getOrderInformationElements();
    if (stateEl) {
      stateEl.innerHTML = '';
      const states = csc.getStatesOfCountry(countryId);

      states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.name;
        option.innerText = state.name;
        stateEl.appendChild(option);
      });
    }
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
    if (emailEl && email) emailEl.value = email;
    if (firstNameEl && firstName) firstNameEl.value = firstName;
    if (lastNameEl && lastName) lastNameEl.value = lastName;
    if (addressEl && address) addressEl.value = address;
    if (cityEl && city) cityEl.value = city;
    if (zipEl && zip) zipEl.value = zip;
    if (countryEl && country) {
      countryEl.value = country;
      countryEl.dispatchEvent(new Event('blur'));
    }
    if (stateEl && state) stateEl.value = state;

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
      const userData = await signUp({ name: name, email });
      if (userData) {
        const token = userData.Token;
        storage.set(KEYS.TOKEN, token);
        return true;
      }
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
    const hasValueClass = 'has-value';

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
        const wrapper = this.parentNode;
        const value = this.value.trim();
        const isEmailRequired =
          this.getAttribute('email_required') === 'true' || false;

        const previousSibling = this.previousSibling;
        if (previousSibling.tagName === 'LABEL' && wrapper) {
          if (value && value.length > 0) wrapper.classList.add(hasValueClass);
          else wrapper.classList.remove(hasValueClass);
        }

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
}
