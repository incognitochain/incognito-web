import {
  getAmazonExpressSignature,
  submitCryptoOrder,
  submitZelleOrder,
  submitAmazonOrder
} from '../service/api';
import { trackEvent } from '../common/utils/ga';
import storage from '../service/storage';
import { setMessage } from '../service/message_box';
import KEYS from '../constant/keys';
import OrderInformation from './order_information';
import queryString from '../service/queryString';
import LoadingButton from '../common/loading_button';

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
    this.amazonExpressCheckoutPageId = 'amazon-express-checkout-container';

    this.parentContainer = container;
    this.cart = cart;
    this.container = this.parentContainer.querySelector(
      `#${this.paymentPageId}`
    );
    this.loadingContainer = this.parentContainer.querySelector(
      '.loading-container'
    );
    this.orderInformation = new OrderInformation(
      container,
      cart,
      this.onSubmitOrderInformationSuccess.bind(this)
    );
    this.setup();
  }

  getPaymentElements() {
    if (!this.container) return {};
    const zellePaymentBtnEl = this.container.querySelector(
      '#submit-zelle-payment-btn'
    );
    const cryptoPaymentBtnEl = this.container.querySelector(
      '#submit-crypto-payment-btn'
    );
    const cryptoPaymentCoinNameEl = this.container.querySelector(
      '#crypto-payment-coin-name'
    );
    const updateOrderInformationEls = this.container.querySelectorAll(
      '.change-order-information'
    );
    return {
      zellePaymentBtnEl,
      cryptoPaymentBtnEl,
      cryptoPaymentCoinNameEl,
      updateOrderInformationEls
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
    const { quantity = 1 } = this.cart.getCart();
    return {
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country,
      quantity
    };
  }

  getAmazonErrorMessage(errorCode) {
    switch (errorCode) {
      case 'BuyerAbandoned':
        return 'You have been canceled your order';
    }
    return 'There has been a temporary error processing your request, please try again shortly.';
  }

  setup() {
    if (queryString('gateway') === 'amazon-express') {
      return this.handleAmazonExpressPayment();
    }

    const {
      zellePaymentBtnEl,
      cryptoPaymentBtnEl,
      cryptoPaymentCoinNameEl,
      updateOrderInformationEls
    } = this.getPaymentElements();

    if (zellePaymentBtnEl)
      zellePaymentBtnEl.addEventListener(
        'click',
        this.onSubmitZelleOrder.bind(this)
      );
    if (cryptoPaymentBtnEl)
      cryptoPaymentBtnEl.addEventListener(
        'click',
        this.onSubmitCryptoOrder.bind(this)
      );
    if (cryptoPaymentCoinNameEl)
      this.handleSelectElementChanged(
        cryptoPaymentCoinNameEl,
        this.onCryptoPaymentCoinNameChanged.bind(this)
      );
    updateOrderInformationEls.forEach(updateOrderInformationEl => {
      updateOrderInformationEl.addEventListener(
        'click',
        this.onChangeOrderInformationClicked.bind(this)
      );
    });

    this.handleAmazonPayment();
  }

  setupAmazonPaymentButton({
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country
  }) {
    const amazonPaymentBtnId = 'amazon-payment-button';
    const { quantity } = this.cart.getCart();
    const amazonPaymentBtnEl = this.container.querySelector(
      `#${amazonPaymentBtnId}`
    );
    if (amazonPaymentBtnEl) {
      amazonPaymentBtnEl.innerHTML = '';
    }

    OffAmazonPayments.Button(amazonPaymentBtnId, process.env.AMAZON_SELLER_ID, {
      type: 'hostedPayment',
      hostedParametersProvider: done => {
        getAmazonExpressSignature({
          firstName,
          lastName,
          address,
          city,
          state,
          zip,
          country,
          quantity
        })
          .then(paymentInformation => {
            done(paymentInformation);
          })
          .catch(e => {
            setMessage(e.message, 'error');
          });
      },
      onError: errorCode => {
        console.log('amazon pay error', errorCode.getErrorMessage());
      }
    });
  }

  onChangeOrderInformationClicked() {
    this.showPage(this.informationPageId);
  }

  async onSubmitZelleOrder() {
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
          eventCategory: 'Zelle Payment Page',
          eventAction: 'show',
          eventLabel: 'Shown zelle page'
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
          eventCategory: 'Crypto Payment Page',
          eventAction: 'show',
          eventLabel: 'Shown crypto wallet address to user'
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

  async onSubmitAmazonOrder(orderReferenceId, orderAccessToken) {
    const paymentInformation = this.getPaymentInformation();
    this.showLoading();

    try {
      const orderId = await submitAmazonOrder({
        ...paymentInformation,
        orderReferenceId,
        orderAccessToken
      });

      this.resetPayment();
      window.location = 'thankyou.html';
    } catch (e) {
      setMessage(e.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  onSubmitOrderInformationSuccess({
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country
  }) {
    this.setupAmazonPaymentButton({
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    });
    this.showPage(this.paymentPageId);
    this.updateShipTo({
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country
    });
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

  handleAmazonPayment() {
    const amazonSellerId = queryString('sellerId');
    if (!amazonSellerId || amazonSellerId !== process.env.AMAZON_SELLER_ID)
      return;

    const resultCode = queryString('resultCode');
    if (!resultCode) return;
    if (resultCode === 'Failure') {
      const failureCode = queryString('failureCode');
      setMessage(this.getAmazonErrorMessage(failureCode), 'error');
      window.history.pushState('', '', window.location.pathname);
      return;
    }
    if (resultCode !== 'Success') return;

    const orderReferenceId = queryString('orderReferenceId');
    const orderAccessToken = '';

    if (!orderReferenceId)
      return setMessage(
        'There was a problem while processing your order. Please contact us'
      );

    window.history.pushState('', '', window.location.pathname);
    this.onSubmitAmazonOrder(orderReferenceId, orderAccessToken);
  }

  handleAmazonExpressPayment() {
    this.showPage(this.amazonExpressCheckoutPageId);

    const accessToken = queryString('access_token');
    if (!accessToken) window.location = '/payment.html';
  }
}
