import { getCoinName } from '../common/utils/crypto';
import { replaceVariables } from '../common/utils/string';
import {
  PAYMENT_TYPE,
  PAYMENT_TYPE_TEXT,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ZELLE_PAYMENT_ADDRESS
} from '../constant/payment';

const contactEmail = 'go@incognito.org';
const contactEmailSubject = 'Order Update Request #{{ order_number }}';

const messages = {
  title: {
    success: 'Thank you, {{ first_name }}!',
    fail: '{{ first_name }}, your order did not go through.',
    pending: '{{ first_name }}, your order is pending.'
  },
  heading: {
    success: 'Your order is confirmed',
    fail: 'Your payment was unsuccessful',
    pending: {
      [PAYMENT_TYPE.CRYPTO]: 'Please make a transfer to complete your order.',
      [PAYMENT_TYPE.ZELLE]: 'Please make a transfer to complete your order.'
    }
  },
  description: {
    success:
      'Thanks! We’re getting your Node ready. Please keep an eye on this page for updates on your shipping status. If you would like to change your shipping address, please send a message asap to <a href="{{ support_email_href }}">{{ support_email }}</a>.',
    fail:
      'You can still place a new order anytime. If this is a mistake, or if you need assistance completing your order, please contact <a href="{{ support_email_href }}">{{ support_email }}</a> and we will be happy to assist.',
    pending: {
      [PAYMENT_TYPE.CRYPTO]:
        '<div class="description">Please send <span class="strong">{{ amount }} {{ coin_name }}</span> to the wallet address below.</div>\
        <div class="description script copiable wallet-address strong" data-copy-value={{ wallet_address }}>{{ wallet_address }}</div>\
        <div class="description">If you need a little more time, simply place an order again when you are ready. For assistance completing your order, please reach out to us at <a href="{{ support_email_href }}">{{ support_email }}</a>. Thanks!</div>',
      [PAYMENT_TYPE.ZELLE]: `<div class="description">Simply make a transfer to the Incognito Zelle account.</div>\
        <div class="description">Order number: <span class="strong">#{{ order_number }}</span><br />Amount: <span class="strong">\${{ amount }}</span><br />Send to: <span class="strong highlight">${ZELLE_PAYMENT_ADDRESS}</span></div>\
        <div class="description note">\
          <h3 class="heading">Please note:</h3>\
          When making a Zelle transfer, please include your order number #<span class="strong">{{ order_number }}</span> in the Notes section.\
        </div>
        <div class="description">If you need any assistance completing your order, please reach out to <a href="{{ support_email_href }}">{{ support_email }}</a>. Thanks for your interest in Node!</div>`
    }
  }
};

const getOrderStatusDetailElements = container => {
  if (!container) return {};

  const paymentGatewayEl = container.querySelector('#payment-gateway');
  const paymentStatusEl = container.querySelector('#payment-status');
  const walletAddressContainerEl = container.querySelector(
    '#crypto-wallet-address-container'
  );
  const mainHeaderEl = container.querySelector('#main-header');
  const walletAddressEl = container.querySelector('#wallet-address');
  const shippingAddressEl = container.querySelector('#shipping-address');
  const cartContainerEl = container.querySelector('#cart-container');
  const contactEmailEl = container.querySelector('#contact-email');
  const orderNumberEl = container.querySelector('.order-number');
  const requestUpdateHrefEls = container.querySelectorAll(
    '.request-update-href'
  );
  const orderConfirmationTextContainerEl = container.querySelector(
    '#order-confirmation-text-container'
  );
  const orderConfirmationTitleEl =
    orderConfirmationTextContainerEl &&
    orderConfirmationTextContainerEl.querySelector('.heading');
  const orderConfirmationDescriptionEl =
    orderConfirmationTextContainerEl &&
    orderConfirmationTextContainerEl.querySelector('.description-container');
  const productPriceEl =
    cartContainerEl && cartContainerEl.querySelector('.product-price');
  const productQuantityEl =
    cartContainerEl && cartContainerEl.querySelector('.product-quantity');
  const productSubtotalEl =
    cartContainerEl && cartContainerEl.querySelector('.sub-total-price');
  const productShippingFeeEl =
    cartContainerEl && cartContainerEl.querySelector('.shipping-price');
  const productTotalPriceEl =
    cartContainerEl && cartContainerEl.querySelector('.total-price');

  return {
    paymentGatewayEl,
    paymentStatusEl,
    walletAddressEl,
    walletAddressContainerEl,
    shippingAddressEl,
    mainHeaderEl,
    orderNumberEl,
    contactEmailEl,
    requestUpdateHrefEls,
    productPriceEl,
    productQuantityEl,
    productSubtotalEl,
    productShippingFeeEl,
    productTotalPriceEl,
    orderConfirmationTitleEl,
    orderConfirmationDescriptionEl
  };
};

const getPaymentGateway = (paymentGateway, currencyType) => {
  switch (+paymentGateway) {
    case PAYMENT_TYPE.CRYPTO:
      return getCoinName(currencyType);
    default:
      return PAYMENT_TYPE_TEXT[paymentGateway] || 'Unknow';
  }
};

export const updateOrderDetails = (container, orderNumber, orderDetails) => {
  if (!orderDetails) return;
  const {
    paymentGatewayEl,
    paymentStatusEl,
    walletAddressContainerEl,
    walletAddressEl,
    shippingAddressEl,
    requestUpdateHrefEls,
    mainHeaderEl,
    orderNumberEl,
    contactEmailEl,
    productPriceEl,
    productQuantityEl,
    productSubtotalEl,
    productShippingFeeEl,
    productTotalPriceEl,
    orderConfirmationTitleEl,
    orderConfirmationDescriptionEl
  } = getOrderStatusDetailElements(container);

  const {
    FirstName: orderFirstName,
    LastName: orderLastName,
    Email: orderEmail,
    AddressStreet: orderShippingAddress,
    AddressRegion: orderShippingState,
    AddressCity: orderShippingCity,
    AddressPostalCode: orderShippingZip,
    AddressCountry: orderShippingCountry,
    Quantity: orderQuantity,
    WalletAddress: orderCryptoWalletAddress,
    Price: orderProductPrice,
    Tax: orderTax,
    BasePrice: orderBasePrice,
    TotalPrice: orderTotalPrice,
    PaymentType: orderPaymentType,
    CurrencyType: orderCurrencyType,
    ExpiredAt: orderExpiredTime
  } = orderDetails;

  let { Status: orderStatus } = orderDetails;

  if (
    orderExpiredTime &&
    orderPaymentType === PAYMENT_TYPE.CRYPTO &&
    orderStatus === ORDER_STATUS.PENDING &&
    new Date(orderExpiredTime) < Date.now()
  ) {
    orderStatus = ORDER_STATUS.TIMED_OUT;
  }

  const contactEmailHref = `mailto:${contactEmail}?subject=${encodeURIComponent(
    replaceVariables(contactEmailSubject, {
      order_number: orderNumber
    })
  )}`;

  const productPrice = +orderProductPrice || 0;
  const productQuantity = +orderQuantity || 1;
  const productBasePrice = +orderPaymentType === 1 ? orderBasePrice || 1 : 1;
  const productSubtotal = productPrice * productQuantity;
  let productTotalPrice = orderTotalPrice
    ? Math.round(orderTotalPrice / productBasePrice)
    : 0;
  const tax = orderTax;
  let shippingFee = productTotalPrice - tax - productSubtotal;
  shippingFee = shippingFee < 0 ? 0 : shippingFee;
  productTotalPrice =
    productTotalPrice < productSubtotal ? productSubtotal : productTotalPrice;

  if (orderNumberEl && orderNumber) {
    orderNumberEl.innerText = `#${orderNumber}`;
  }

  switch (+orderStatus) {
    case ORDER_STATUS.PENDING:
      if (mainHeaderEl) {
        const titleMessage = messages.title.pending;
        mainHeaderEl.innerText = replaceVariables(titleMessage, {
          first_name: orderFirstName
        });
      }

      if (orderConfirmationTitleEl) {
        const headingMessage = messages.heading.pending[orderPaymentType];

        if (headingMessage) {
          orderConfirmationTitleEl.innerText = headingMessage;
        }
      }

      if (orderConfirmationDescriptionEl) {
        const descriptionMessage =
          messages.description.pending[orderPaymentType];

        if (descriptionMessage) {
          orderConfirmationDescriptionEl.innerHTML = replaceVariables(
            descriptionMessage,
            {
              order_number: orderNumber,
              amount: orderTotalPrice,
              support_email: contactEmail,
              support_email_href: contactEmailHref,
              coin_name: orderCurrencyType,
              wallet_address: orderCryptoWalletAddress
            }
          );
        }
      }
      break;
    case ORDER_STATUS.RECEIVE_COIN:
    case ORDER_STATUS.PAYMENT_SUCCESS:
    case ORDER_STATUS.SENT_MASTER_WALLET:
      if (mainHeaderEl) {
        const titleMessage = messages.title.success;
        mainHeaderEl.innerText = replaceVariables(titleMessage, {
          first_name: orderFirstName
        });
      }

      if (orderConfirmationTitleEl) {
        const headingMessage = messages.heading.success;
        orderConfirmationTitleEl.innerText = headingMessage;
      }

      if (orderConfirmationDescriptionEl) {
        const descriptionMessage = messages.description.success;
        orderConfirmationDescriptionEl.innerHTML = replaceVariables(
          descriptionMessage,
          {
            support_email: contactEmail,
            support_email_href: contactEmailHref
          }
        );
      }
      break;
    default:
      if (mainHeaderEl) {
        mainHeaderEl.innerText = replaceVariables(messages.title.fail, {
          first_name: orderFirstName
        });
      }

      if (orderConfirmationTitleEl) {
        const headingMessage = messages.heading.fail;
        orderConfirmationTitleEl.innerText = headingMessage;
      }

      if (orderConfirmationDescriptionEl) {
        const descriptionMessage = messages.description.fail;
        orderConfirmationDescriptionEl.innerHTML = replaceVariables(
          descriptionMessage,
          {
            support_email: contactEmail,
            support_email_href: contactEmailHref
          }
        );
      }
  }

  if (contactEmailEl && orderEmail) {
    contactEmailEl.innerText = orderEmail;
  }

  if (paymentGatewayEl && orderPaymentType) {
    paymentGatewayEl.innerText = getPaymentGateway(
      orderPaymentType,
      orderCurrencyType
    );
  }

  if (paymentStatusEl) {
    paymentStatusEl.innerText = ORDER_STATUS_TEXT[+orderStatus];
  }

  if (+orderPaymentType === 1 && walletAddressEl && orderCryptoWalletAddress) {
    walletAddressEl.innerText = orderCryptoWalletAddress;
    walletAddressContainerEl &&
      walletAddressContainerEl.classList.remove('hidden');
  }

  if (shippingAddressEl) {
    const shippingAddress = `${orderFirstName || ''} ${orderLastName || ''}
        ${orderShippingAddress ? `<br/>${orderShippingAddress}` : ''}
        ${orderShippingCity ? `<br/>${orderShippingCity}` : ''}\
        ${orderShippingState ? ` ${orderShippingState}` : ''}\
        ${orderShippingZip ? ` ${orderShippingZip}` : ''}\
        ${orderShippingCountry ? `<br/>${orderShippingCountry}` : ''}
    `;

    shippingAddressEl.innerHTML = shippingAddress;
  }

  if (productPriceEl && productPrice) {
    productPriceEl.innerText = `$${productPrice}`;
  }

  if (productQuantityEl && productQuantity) {
    productQuantityEl.innerText = productQuantity;
  }

  if (productSubtotalEl && productSubtotal) {
    productSubtotalEl.innerText = `$${productSubtotal}`;
  }

  if (productTotalPriceEl && productTotalPrice) {
    productTotalPriceEl.innerText = `$${productTotalPrice}`;
  }

  if (productShippingFeeEl && shippingFee) {
    productShippingFeeEl.innerText = shippingFee ? `$${shippingFee}` : 'FREE';
  }

  if (requestUpdateHrefEls) {
    requestUpdateHrefEls.forEach(requestUpdateHrefEl => {
      requestUpdateHrefEl.href = contactEmailHref;
    });
  }
};
