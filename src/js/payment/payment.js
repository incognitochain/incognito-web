import {
  submitCryptoOrder,
  submitZelleOrder,
  submitCreditCardOrder,
  checkCCPaymentGatewayLimit
} from '../service/api';
import {
  trackEvent,
  checkoutTrackEvent,
  purchaseTrackEvent
} from '../common/utils/ga';
import storage from '../service/storage';
import { setMessage } from '../service/message_box';
import KEYS from '../constant/keys';
import OrderInformation from './order_information';
import LoadingButton from '../common/loading_button';
import Card from 'card';
import AddressForm from './address_form';

export default class Payment {
  constructor(container, cart) {
    if (!container) {
      throw new Error('container not found');
    }

    if (!cart) {
      throw new Error('cart not found');
    }

    this.informationPageId = 'order-information-container';
    this.paymentPageId = 'payment-container';
    this.cryptoThankyouPageId = 'crypto-thank-you-container';
    this.zelleThankyouPageId = 'zelle-thank-you-container';

    this.parentContainer = container;
    this.cart = cart;
    this.container = this.parentContainer.querySelector(
      `#${this.paymentPageId}`
    );
    this.loadingContainer = this.parentContainer.querySelector(
      '.loading-container'
    );

    this.setup();
    this.orderInformation = new OrderInformation(
      container,
      cart,
      this.onSubmitOrderInformationSuccess.bind(this)
    );
  }

  getPaymentElements() {
    if (!this.container) return {};
    const paymentFormEl = this.container.querySelector('form#payment-form');
    const updateOrderInformationEls = this.container.querySelectorAll(
      '.change-order-information'
    );
    return {
      updateOrderInformationEls,
      paymentFormEl
    };
  }

  getPaymentFormElements() {
    const { paymentFormEl } = this.getPaymentElements();
    if (!paymentFormEl) return;

    const paymentMethodContainerEl = paymentFormEl.querySelector(
      '#payment-method-container'
    );
    const billingAddressContainerEl = paymentFormEl.querySelector(
      '#billing-address-container'
    );
    const submitOrderBtnEl = paymentFormEl.querySelector('#submit-order-btn');
    const creditCardFormEl = paymentFormEl.querySelector('#pay-with-card');
    const cardContainerEl =
      creditCardFormEl && creditCardFormEl.querySelector('#card-container');
    const cardPaymentGatewayInputEl = paymentFormEl.querySelector(
      '.payment-gateway[data-select-gateway="card"]'
    );
    const billingAddressFormEl = paymentFormEl.querySelector(
      '#different-billing-address-form'
    );
    const paymentGatewayInputEl = paymentFormEl.querySelector(
      'input[name="payment_gateway"]:checked'
    );
    const differentBillingAddressInputEl = paymentFormEl.querySelector(
      'input[name="different_billing_address"]:checked'
    );
    const cryptoPaymentTypeInputEl = paymentFormEl.querySelector(
      '#crypto-payment-coin-name'
    );
    const creditCardNumberEl = paymentFormEl.querySelector('#card-number');
    const creditCardExpiryEl = paymentFormEl.querySelector('#card-expiry');
    const creditCardCodeEl = paymentFormEl.querySelector('#card-cvv');

    return {
      paymentMethodContainerEl,
      billingAddressContainerEl,
      creditCardFormEl,
      cardContainerEl,
      cardPaymentGatewayInputEl,
      billingAddressFormEl,
      paymentGatewayInputEl,
      differentBillingAddressInputEl,
      cryptoPaymentTypeInputEl,
      submitOrderBtnEl,
      creditCardNumberEl,
      creditCardExpiryEl,
      creditCardCodeEl
    };
  }

  getZelleThankyouPageElements() {
    const container = this.parentContainer.querySelector(
      `#${this.zelleThankyouPageId}`
    );
    if (!container) return {};
    const totalAmountEls = container.querySelectorAll('.total-price');
    const orderNumberEls = container.querySelectorAll('.order-number');
    return { totalAmountEls, orderNumberEls };
  }

  getCryptoThankyouPageElements() {
    const container = this.parentContainer.querySelector(
      `#${this.cryptoThankyouPageId}`
    );
    if (!container) return {};
    const coinPriceEls = container.querySelectorAll('.coin-price');
    const coinNameEls = container.querySelectorAll('.coin-name');
    const walletAddressEls = container.querySelectorAll('.wallet-address');
    const iconEl = container.querySelector('.icon');
    return { coinPriceEls, coinNameEls, walletAddressEls, iconEl };
  }

  getPaymentInformation() {
    const {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    } = this.orderInformation.getOrderInformationValues();
    const {
      price,
      shippingFee,
      tax,
      totalPrice,
      quantity = 1
    } = this.cart.getCart();
    return {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country,
      quantity,
      price,
      shippingFee,
      tax,
      totalPrice
    };
  }

  toggleAriaControls(container, ariaControlsName) {
    const ariaControlsEls = container.querySelectorAll(
      '.content-box__container__row.content'
    );
    ariaControlsEls.forEach(ariaControlsEl => {
      const id = ariaControlsEl.id;
      if (!id) return;
      if (id === ariaControlsName) {
        ariaControlsEl.classList.remove('hidden');
        ariaControlsEl.disabled = false;
      } else {
        ariaControlsEl.classList.add('hidden');
        ariaControlsEl.disabled = true;
      }
    });
  }

  async setup() {
    this.setupPaymentForm();
    this.setupBillingForm();

    const {
      paymentFormEl,
      updateOrderInformationEls
    } = this.getPaymentElements();

    // handle events while back to shipping address form
    updateOrderInformationEls.forEach(updateOrderInformationEl => {
      updateOrderInformationEl.addEventListener(
        'click',
        this.onChangeOrderInformationClicked.bind(this)
      );
    });

    paymentFormEl &&
      paymentFormEl.addEventListener(
        'submit',
        this.onPaymentFormSubmitted.bind(this)
      );
  }

  disableCCPaymentGateway() {
    const {
      creditCardFormEl,
      cardPaymentGatewayInputEl
    } = this.getPaymentFormElements();
    const { paymentFormEl } = this.getPaymentElements();
    creditCardFormEl && creditCardFormEl.remove();
    cardPaymentGatewayInputEl && cardPaymentGatewayInputEl.remove();

    const paymentGatewayContainerEls =
      paymentFormEl && paymentFormEl.querySelectorAll('.payment-gateway');

    paymentGatewayContainerEls &&
      paymentGatewayContainerEls.length > 0 &&
      paymentGatewayContainerEls[0] &&
      paymentGatewayContainerEls[0].click();
  }

  enableCCPaymentGateway() {
    const {
      cardPaymentGatewayInputEl,
      creditCardFormEl
    } = this.getPaymentFormElements();

    creditCardFormEl && creditCardFormEl.classList.remove('hidden');

    if (cardPaymentGatewayInputEl) {
      cardPaymentGatewayInputEl.classList.remove('hidden');
      cardPaymentGatewayInputEl.click();
    }
  }

  async setupPaymentForm() {
    const {
      paymentMethodContainerEl,
      billingAddressContainerEl,
      creditCardFormEl,
      cardContainerEl,
      cryptoPaymentTypeInputEl,
      submitOrderBtnEl
    } = this.getPaymentFormElements();

    cryptoPaymentTypeInputEl &&
      this.handleSelectElementChanged(
        cryptoPaymentTypeInputEl,
        this.onCryptoPaymentCoinNameChanged.bind(this)
      );

    // mask credit card form
    creditCardFormEl &&
      new Card({
        form: creditCardFormEl,
        container: cardContainerEl,
        formSelectors: {
          numberInput: 'input[name="card-number"]',
          expiryInput: 'input[name="card-expiry"]',
          cvcInput: 'input[name="card-cvv"]',
          nameInput: 'input[name="card-name"]'
        },
        placeholders: {
          number: '•••• •••• •••• ••••',
          name: 'Full Name',
          expiry: '••/••',
          cvc: '•••'
        }
      });

    if (
      !paymentMethodContainerEl ||
      !billingAddressContainerEl ||
      !submitOrderBtnEl
    )
      return;

    const self = this;
    const defaultSubmitOrderBtnText = submitOrderBtnEl.innerText;
    const submitOrderBtnPayNowText = submitOrderBtnEl.getAttribute(
      'data-pay-now-text'
    );
    const paymentMethodEls = paymentMethodContainerEl.querySelectorAll(
      '.content-box__container__row'
    );
    paymentMethodEls.forEach(paymentMethodEl => {
      const paymentMethodInputEl = paymentMethodEl.querySelector(
        'input[name="payment_gateway"]'
      );

      const onPaymentMethodInputChanged = function() {
        const ariaControls = this.getAttribute('aria-controls');
        const paymentGateway = this.value;
        self.toggleAriaControls(paymentMethodContainerEl, ariaControls);
        self.cart.hideTotalPriceInCryptoEl();
        billingAddressContainerEl.classList.add('hidden');
        submitOrderBtnEl.innerText = defaultSubmitOrderBtnText;

        switch (paymentGateway) {
          case 'card':
            billingAddressContainerEl.classList.remove('hidden');
            submitOrderBtnEl.innerText =
              submitOrderBtnPayNowText || defaultSubmitOrderBtnText;
            break;
          case 'crypto':
            self.cart.showTotalPriceInCryptoEl();
            break;
          default:
        }
      };

      paymentMethodInputEl &&
        paymentMethodInputEl.addEventListener(
          'change',
          onPaymentMethodInputChanged
        );

      paymentMethodEl.addEventListener('click', function() {
        paymentMethodInputEl && paymentMethodInputEl.click();
      });

      const isDefault =
        paymentMethodEl.getAttribute('data-default') === 'true' || false;
      isDefault && paymentMethodEl.click();
    });
  }

  async setupBillingForm() {
    const {
      billingAddressContainerEl,
      billingAddressFormEl
    } = this.getPaymentFormElements();
    if (!billingAddressContainerEl) return;

    if (billingAddressFormEl)
      this.billingAddressForm = new AddressForm(
        billingAddressFormEl,
        'billing'
      );

    const self = this;
    const billingAddressEls = billingAddressContainerEl.querySelectorAll(
      '.content-box__container__row'
    );
    billingAddressEls.forEach(billingAddressEl => {
      const billingAddressInputEl = billingAddressEl.querySelector(
        'input[name="different_billing_address"]'
      );

      const onBillingAddressChanged = function() {
        const ariaControls = this.getAttribute('aria-controls');
        self.toggleAriaControls(billingAddressContainerEl, ariaControls);
      };

      billingAddressInputEl &&
        billingAddressInputEl.addEventListener(
          'click',
          onBillingAddressChanged
        );

      billingAddressEl.addEventListener('click', function() {
        billingAddressInputEl && billingAddressInputEl.click();
      });

      const isDefault =
        billingAddressEl.getAttribute('data-default') === 'true' || false;
      isDefault && billingAddressEl.click();
    });
  }

  async onPaymentFormSubmitted(e) {
    e.preventDefault();

    const {
      paymentGatewayInputEl,
      differentBillingAddressInputEl,
      cryptoPaymentTypeInputEl,
      submitOrderBtnEl,
      creditCardNumberEl,
      creditCardExpiryEl,
      creditCardCodeEl
    } = this.getPaymentFormElements();

    if (!paymentGatewayInputEl) return;

    const paymentGateway = paymentGatewayInputEl.value;
    const isDifferentBillingAddress =
      differentBillingAddressInputEl &&
      differentBillingAddressInputEl.value === 'true';

    const paymentInformation = this.getPaymentInformation();
    const submitOrderLoadingBtnEl = new LoadingButton(submitOrderBtnEl);
    submitOrderLoadingBtnEl.show();

    switch (paymentGateway) {
      case 'card':
        const {
          firstName: billingFirstName,
          lastName: billingLastName,
          address: billingAddress,
          city: billingCity,
          state: billingState,
          zip: billingZip,
          country: billingCountry
        } = paymentInformation;

        let billingAddressInformation;

        if (isDifferentBillingAddress && this.billingAddressForm) {
          const {
            firstNameEl,
            lastNameEl,
            addressEl,
            cityEl,
            stateEl,
            zipEl,
            countryEl
          } = this.billingAddressForm.getAddressFormElements();

          billingAddressInformation = {
            billingFirstName: firstNameEl.value.trim(),
            billingLastName: lastNameEl.value.trim(),
            billingAddress: addressEl.value.trim(),
            billingCity: cityEl.value.trim(),
            billingState: stateEl.value.trim(),
            billingZip: zipEl.value.trim(),
            billingCountry: countryEl.value.trim()
          };
        } else {
          billingAddressInformation = {
            billingFirstName,
            billingLastName,
            billingAddress,
            billingCity,
            billingState,
            billingZip,
            billingCountry
          };
        }

        const creditCardInformation = {
          cardNumber: creditCardNumberEl.value.replace(/\s+/g, ''),
          cardExpiry: creditCardExpiryEl.value.replace(/\s+/g, ''),
          cardCode: creditCardCodeEl.value
        };

        await this.onSubmitCreditCardOrder({
          ...paymentInformation,
          ...billingAddressInformation,
          ...creditCardInformation
        });
        break;
      case 'zelle':
        await this.onSubmitZelleOrder(paymentInformation);
        break;
      case 'crypto':
        const selectedCryptoName =
          cryptoPaymentTypeInputEl && cryptoPaymentTypeInputEl.value;
        await this.onSubmitCryptoOrder({
          ...paymentInformation,
          coinName: selectedCryptoName
        });
        break;
    }

    submitOrderLoadingBtnEl.hide();
  }

  onChangeOrderInformationClicked() {
    this.showPage(this.informationPageId);
  }

  async onSubmitCreditCardOrder(paymentInformation) {
    this.trackCheckoutPaymentTypeEvent('credit-card');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with credit card'
    });

    try {
      const orderInfo = await submitCreditCardOrder({
        ...paymentInformation
      });

      const orderNumber = orderInfo.OrderID;
      this.resetPayment();
      this.trackPurchaseSuccessEvent('credit-card', orderNumber);
      trackEvent({
        eventCategory: 'Payment',
        eventAction: 'show',
        eventLabel: 'Credit card confirmation page',
        hitCallback: () => {
          this.resetPayment();
          window.location = 'thankyou.html';
        }
      });
    } catch (e) {
      setMessage(e.message, 'error');
    }
  }

  async onSubmitZelleOrder(paymentInformation) {
    this.trackCheckoutPaymentTypeEvent('zelle');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with Zelle'
    });

    try {
      const order = await submitZelleOrder({
        ...paymentInformation
      });
      if (order) {
        const { TotalPrice: totalPrice, OrderID: orderId } = order;
        trackEvent({
          eventCategory: 'Payment',
          eventAction: 'show',
          eventLabel: 'Zelle confirmation page'
        });
        const {
          totalAmountEls = [],
          orderNumberEls = []
        } = this.getZelleThankyouPageElements();
        totalAmountEls.forEach(totalAmountEl => {
          totalAmountEl.innerText = totalPrice;
        });
        orderNumberEls.forEach(orderNumberEl => {
          orderNumberEl.innerText = orderId;
        });
        this.showPage(this.zelleThankyouPageId);
        this.cart.hideTotalPriceInCryptoEl();
        this.resetPayment();
      }
    } catch (e) {
      setMessage(e.message, 'error');
    }
  }

  async onSubmitCryptoOrder(paymentInformation) {
    this.trackCheckoutPaymentTypeEvent('crypto');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with Crypto'
    });

    try {
      const order = await submitCryptoOrder({
        ...paymentInformation
      });
      if (order) {
        trackEvent({
          eventCategory: 'Payment',
          eventAction: 'show',
          eventLabel: 'Crypto confirmation page'
        });
        const {
          TotalAmount: totalAmount = 0,
          Address: walletAddress = ''
        } = order;
        const { coinName } = paymentInformation;
        const {
          coinPriceEls = [],
          coinNameEls = [],
          walletAddressEls = [],
          iconEl
        } = this.getCryptoThankyouPageElements();
        coinPriceEls.forEach(coinPriceEl => {
          coinPriceEl.innerText = totalAmount;
        });
        coinNameEls.forEach(coinNameEl => {
          coinNameEl.innerText = coinName;
        });
        walletAddressEls.forEach(walletAddressEl => {
          walletAddressEl.innerText = walletAddress;
          walletAddressEl.setAttribute('data-copy-value', walletAddress);
        });
        if (iconEl) {
          try {
            iconEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`;
            iconEl.classList.remove('hidden');
          } catch {}
        }
        this.showPage(this.cryptoThankyouPageId);
        this.cart.showCryptoPaymentGuide();
        this.resetPayment();
      }
    } catch (e) {
      setMessage(e.message, 'error');
    }
  }

  onSubmitOrderInformationSuccess(
    addressInfo = {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    }
  ) {
    this.shippingAddress = addressInfo;
    this.showPage(this.paymentPageId);
    this.updateShipTo(addressInfo);
    this.updateBillingAddress(addressInfo);
    this.showLoading();
    checkCCPaymentGatewayLimit()
      .then(isEnabled => {
        isEnabled
          ? this.enableCCPaymentGateway()
          : this.disableCCPaymentGateway();
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  onCryptoPaymentCoinNameChanged(e) {
    const target = e.target;
    this.cart.setSelectedCoinName(target.value);
    this.cart.updateTotalPriceInCrypto();
  }

  updateShipTo({ firstName, lastName, address, city, state, zip, country }) {
    const shipTo = `${firstName} ${lastName}, ${address}, ${city}, ${state} ${zip}, ${country}`;
    const shipToEl = this.container.querySelector('#ship-to');
    if (shipToEl) shipToEl.innerText = shipTo;
  }

  updateBillingAddress(
    addressInfo = {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    }
  ) {
    if (this.billingAddressForm)
      this.billingAddressForm.fillInformation(addressInfo);
  }

  showPage(pageId = this.informationPageId) {
    const pages = this.parentContainer.querySelectorAll('.payment-page');
    pages.forEach(page => {
      if (page.id === pageId) {
        page.classList.remove('hidden');
      } else {
        page.classList.add('hidden');
      }
    });
  }

  showLoading() {
    if (this.loadingContainer) this.loadingContainer.classList.remove('hidden');
  }

  hideLoading() {
    if (this.loadingContainer) this.loadingContainer.classList.add('hidden');
  }

  resetPayment() {
    storage.set(KEYS.PAYMENT_INFORMATION, '');
    storage.set(KEYS.CART_INFORMATION, '');
  }

  handleSelectElementChanged(element, onChange) {
    element.addEventListener('blur', onChange);
    element.addEventListener('change', onChange);
  }

  trackCheckoutPaymentTypeEvent(paymentType) {
    if (!paymentType) return;

    const { quantity, price, id = 'node', name = 'Node' } = this.cart.getCart();

    checkoutTrackEvent({
      product: {
        id,
        name,
        price,
        quantity
      },
      options: {
        step: 2,
        option: paymentType
      }
    });
  }

  trackPurchaseSuccessEvent(paymentType, orderNumber) {
    if (!paymentType) return;
    if (!orderNumber) return;

    const {
      quantity,
      price,
      tax,
      shippingFee,
      id = 'node',
      name = 'Node'
    } = this.cart.getCart();

    purchaseTrackEvent({
      product: {
        id,
        name,
        price,
        quantity
      },
      options: {
        id: orderNumber,
        tax,
        shipping: shippingFee
      }
    });
  }
}
