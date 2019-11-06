const getOrderStatusDetailElements = container => {
  if (!container) return {};

  const paymentGatewayEl = container.querySelector('#payment-gateway');
  const paymentStatusEl = container.querySelector('#payment-status');
  const walletAddressContainerEl = container.querySelector(
    '#crypto-wallet-address-container'
  );
  const firstNameEl = container.querySelector('#first-name');
  const walletAddressEl = container.querySelector('#wallet-address');
  const shippingAddressEl = container.querySelector('#shipping-address');
  const cartContainerEl = container.querySelector('#cart-container');
  const contactEmailEl = container.querySelector('#contact-email');
  const orderNumberEl = container.querySelector('.order-number');
  const requestUpdateHrefEl = container.querySelector('#request-update-href');
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
    firstNameEl,
    orderNumberEl,
    contactEmailEl,
    requestUpdateHrefEl,
    productPriceEl,
    productQuantityEl,
    productSubtotalEl,
    productShippingFeeEl,
    productTotalPriceEl
  };
};

const getPaymentGateway = (paymentGateway, currencyType) => {
  switch (+paymentGateway) {
    case 1:
      return currencyType;
    case 2:
      return 'Paypal';
    case 3:
      return 'Zelle';
    case 4:
      return 'Amazon';
    case 5:
      return 'Credit card';
    default:
      return 'Unknow';
  }
};

const getPaymentStatus = status => {
  switch (+status) {
    case 0:
      return 'Pending';
    case 1:
    case 3:
    case 4:
      return 'Paid';
    default:
      return 'Failed';
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
    requestUpdateHrefEl,
    firstNameEl,
    orderNumberEl,
    contactEmailEl,
    productPriceEl,
    productQuantityEl,
    productSubtotalEl,
    productShippingFeeEl,
    productTotalPriceEl
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
    Status: orderStatus,
    CurrencyType: orderCurrencyType,
    CreatedAt: orderCreatedTime
  } = orderDetails;

  const productPrice = +orderProductPrice || 0;
  const productQuantity = +orderQuantity || 1;
  const productBasePrice = +orderPaymentType === 1 ? orderBasePrice || 1 : 1;
  const productSubtotal = productPrice * productQuantity;
  const productTotalPrice = orderTotalPrice
    ? Math.round(orderTotalPrice / productBasePrice)
    : 0;
  const tax = orderTax;
  const shippingFee = productTotalPrice - tax - productSubtotal;

  if (orderNumberEl && orderNumber) {
    orderNumberEl.innerText = `#${orderNumber}`;
  }

  if (firstNameEl && orderFirstName) {
    firstNameEl.innerText = orderFirstName;
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

  if (paymentStatusEl && orderStatus) {
    paymentStatusEl.innerText = getPaymentStatus(orderStatus);
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

  if (requestUpdateHrefEl) {
    requestUpdateHrefEl.href = `mailto:go@incognito.org?subject=${encodeURIComponent(
      `Order Update Request - #${orderNumber}`
    )}`;
  }
};
