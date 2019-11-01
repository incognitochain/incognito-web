import {
  submitCryptoOrder,
  submitZelleOrder,
  submitCreditCardOrder,
  isCreditCardDisabled
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
    const cryptoPaymentCoinNameEl = this.container.querySelector(
      '#crypto-payment-coin-name'
    );
    const updateOrderInformationEls = this.container.querySelectorAll(
      '.change-order-information'
    );
    return {
      cryptoPaymentCoinNameEl,
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
    const billingAddressFormEl = paymentFormEl.querySelector(
      '#different-billing-address-form'
    );

    return {
      paymentMethodContainerEl,
      billingAddressContainerEl,
      creditCardFormEl,
      cardContainerEl,
      billingAddressFormEl,
      submitOrderBtnEl
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
      cryptoPaymentCoinNameEl,
      updateOrderInformationEls
    } = this.getPaymentElements();

    if (cryptoPaymentCoinNameEl)
      this.handleSelectElementChanged(
        cryptoPaymentCoinNameEl,
        this.onCryptoPaymentCoinNameChanged.bind(this)
      );

    // handle events while back to shipping address form
    updateOrderInformationEls.forEach(updateOrderInformationEl => {
      updateOrderInformationEl.addEventListener(
        'click',
        this.onChangeOrderInformationClicked.bind(this)
      );
    });
  }

  async setupPaymentForm() {
    const {
      paymentMethodContainerEl,
      billingAddressContainerEl,
      creditCardFormEl,
      cardContainerEl,
      submitOrderBtnEl
    } = this.getPaymentFormElements();
    if (
      !paymentMethodContainerEl ||
      !billingAddressContainerEl ||
      !submitOrderBtnEl
    )
      return;

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

        if (paymentGateway === 'card') {
          billingAddressContainerEl.classList.remove('hidden');
          submitOrderBtnEl.innerText =
            submitOrderBtnPayNowText || defaultSubmitOrderBtnText;
        } else {
          billingAddressContainerEl.classList.add('hidden');
          submitOrderBtnEl.innerText = defaultSubmitOrderBtnText;
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

  onChangeOrderInformationClicked() {
    this.showPage(this.informationPageId);
  }

  async onSubmitCreditCardOrder() {
    this.trackCheckoutPaymentTypeEvent('credit-card');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with credit card'
    });
    this.showLoading();
    const paymentInformation = this.getPaymentInformation();

    try {
      const orderInfo = await submitCreditCardOrder({
        ...paymentInformation,
        orderReferenceId,
        orderAccessToken
      });

      const orderNumber = orderInfo.OrderID;
      this.resetPayment();
      this.trackPurchaseSuccessEvent('credit-card', orderNumber);
      trackEvent({
        eventCategory: 'Payment',
        eventAction: 'show',
        eventLabel: 'Credit card confirmation page',
        hitCallback: () => {
          window.location = 'thankyou.html';
        }
      });
    } catch (e) {
      setMessage(e.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  async onSubmitZelleOrder() {
    this.trackCheckoutPaymentTypeEvent('zelle');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with Zelle'
    });

    const paymentInformation = this.getPaymentInformation();
    const { zellePaymentBtnEl } = this.getPaymentElements();
    const zellePaymentLoadingBtn = new LoadingButton(zellePaymentBtnEl);
    zellePaymentLoadingBtn.show();

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
    } finally {
      zellePaymentLoadingBtn.hide();
    }
  }

  async onSubmitCryptoOrder() {
    this.trackCheckoutPaymentTypeEvent('crypto');
    trackEvent({
      eventCategory: 'Payment',
      eventAction: 'click',
      eventLabel: 'Pay with Crypto'
    });

    const paymentInformation = this.getPaymentInformation();
    const {
      cryptoPaymentBtnEl,
      cryptoPaymentCoinNameEl
    } = this.getPaymentElements();

    if (!cryptoPaymentCoinNameEl) {
      return setMessage('Please select a cryptocurrency', 'error');
    }

    const coinName = cryptoPaymentCoinNameEl.value;
    const cryptoPaymentLoadingBtn = new LoadingButton(cryptoPaymentBtnEl);
    cryptoPaymentLoadingBtn.show();

    try {
      const order = await submitCryptoOrder({
        ...paymentInformation,
        coinName
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
    } finally {
      cryptoPaymentLoadingBtn.hide();
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
    this.cart.showTotalPriceInCryptoEl();
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
