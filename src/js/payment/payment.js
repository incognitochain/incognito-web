import OrderInformation from './order_information';

export default class Payment {
  constructor(container, cart) {
    if (!container) {
      throw new Error('container not found');
    }

    if (!cart) {
      throw new Error('cart not found');
    }

    this.informationPageId = 'information-container';
    this.paymentPageId = 'payment-container';
    this.cryptoThankyouPageId = 'crypto-thank-you-container';
    this.zelleThankyouPageId = 'zelle-thank-you-container';

    this.parentContainer = container;
    this.cart = cart;
    this.container = this.parentContainer.querySelector(
      `#${this.paymentPageId}`
    );
    this.orderInformation = new OrderInformation(
      container,
      cart,
      this.onSubmitOrderInformationSuccess.bind(this)
    );
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
    // toggleInformation();
    // togglePayment();
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

  async handleSubmitZelleOrder({
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    country,
    quantity
  }) {
    const paymentContainer = container.querySelector('#payment-container');
    const productContainer = container.querySelector('#product-container');
    const submitPaymentBtnEl = paymentContainer.querySelector(
      '#submit-payment-zelle-btn'
    );
    if (submitPaymentBtnEl) {
      submitPaymentBtnEl.disabled = true;
      submitPaymentBtnEl.classList.add('loading');
    }

    try {
      const order = await submitZelleOrder({
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        country,
        quantity
      });
      if (order) {
        const { TotalPrice: totalPrice, OrderID: orderId } = order;
        trackEvent({
          eventCategory: 'Zelle Payment Page',
          eventAction: 'show',
          eventLabel: 'Shown zelle page'
        });
        const thankyouContainer = container.querySelector(
          '#zelle-thank-you-container'
        );
        if (!thankyouContainer) return;
        const totalAmountEl = thankyouContainer.querySelector('.total-price');
        const orderNumberEls = thankyouContainer.querySelectorAll(
          '.order-number'
        );
        if (totalAmountEl) {
          totalAmountEl.innerText = totalPrice;
        }
        orderNumberEls.forEach(orderNumberEl => {
          orderNumberEl.innerText = orderId;
        });
        if (productContainer) {
          const paymentGuideEl = productContainer.querySelector(
            '#payment-guide'
          );
          const payWithCryptoEl = productContainer.querySelector(
            '#pay-with-crypto'
          );
          if (paymentGuideEl) {
            paymentGuideEl.classList.add('hidden');
          }
          if (payWithCryptoEl) {
            payWithCryptoEl.classList.add('hidden');
          }
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
  }
}
