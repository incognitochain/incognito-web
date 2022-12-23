import csc from 'country-state-city';
import { handleSelectElementChanged, handleInputChange } from '../common/form';

export default class AddressForm {
  constructor(container, prefix = 'shipping') {
    if (!container) {
      throw new Error('container not found');
    }

    this.container = container;
    this.prefix = prefix;

    this.setup();
  }

  getAddressFormElements() {
    const firstNameEl = this.container.querySelector(
      `#${this.prefix}-first-name`
    );
    const lastNameEl = this.container.querySelector(
      `#${this.prefix}-last-name`
    );
    const addressEl = this.container.querySelector(`#${this.prefix}-address`);
    const cityEl = this.container.querySelector(`#${this.prefix}-city`);
    const stateEl = this.container.querySelector(`#${this.prefix}-state`);
    const zipEl = this.container.querySelector(`#${this.prefix}-postal-code`);
    const countryEl = this.container.querySelector(`#${this.prefix}-country`);
    const phoneNumberEl = this.container.querySelector(
      `#${this.prefix}-phone-number`
    );

    return {
      firstNameEl,
      lastNameEl,
      addressEl,
      cityEl,
      stateEl,
      zipEl,
      countryEl,
      phoneNumberEl
    };
  }

  fillCountryList() {
    const { countryEl } = this.getAddressFormElements();
    if (!countryEl) return;

    handleSelectElementChanged(countryEl, this.onCountryChange.bind(this));

    const countries = csc.getAllCountries().filter(country => !['UA', "RU"].includes(country.sortname));
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
    this.fillStateList(selectedCountryId);
  }

  fillStateList(countryId) {
    const { stateEl } = this.getAddressFormElements();
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

  onCountryChange(e) {
    const target = e.target;
    const countryId = target.options[target.selectedIndex].getAttribute('id');
    this.fillStateList(countryId);
  }

  setup() {
    const addressFormElements = this.getAddressFormElements();
    Object.values(addressFormElements).forEach(element => {
      if (element) handleInputChange(element);
    });
    this.fillCountryList();
  }

  fillInformation({
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country,
    phoneNumber
  }) {
    const {
      firstNameEl,
      lastNameEl,
      addressEl,
      cityEl,
      stateEl,
      zipEl,
      countryEl,
      phoneNumberEl
    } = this.getAddressFormElements();

    if (firstNameEl && firstName != null) {
      firstNameEl.value = firstName;
      firstNameEl.dispatchEvent(new Event('input'));
    }
    if (lastNameEl && lastName != null) {
      lastNameEl.value = lastName;
      lastNameEl.dispatchEvent(new Event('input'));
    }
    if (addressEl && address != null) {
      addressEl.value = address;
      addressEl.dispatchEvent(new Event('input'));
    }
    if (cityEl && city != null) {
      cityEl.value = city;
      cityEl.dispatchEvent(new Event('input'));
    }
    if (zipEl && zip != null) {
      zipEl.value = zip;
      zipEl.dispatchEvent(new Event('input'));
    }
    if (countryEl && country != null) {
      countryEl.value = country;
      countryEl.dispatchEvent(new Event('blur'));
    }
    if (stateEl && state != null) {
      stateEl.value = state;
      stateEl.dispatchEvent(new Event('blur'));
    }
    if (phoneNumberEl && phoneNumber != null) {
      phoneNumberEl.value = phoneNumber;
      phoneNumberEl.dispatchEvent(new Event('input'));
    }
  }
}
