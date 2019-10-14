import storage from '../service/storage';
import KEYS from '../constant/keys';
import {
  getProductPrice,
  getExchangeRates,
  getShippingFee
} from '../service/api';

export default class Cart {
  constructor(container) {
    if (!container) {
      throw new Error('container not found');
    }

    this.price = 399;

    this.parentContainer = container;
    this.container = this.parentContainer.querySelector('#cart-container');
    this.getPriceFromLocalStorage();
    this.getCoinExchangeRateFromServer();
    this.getPriceFromServer();
  }

  saveCartToLocalStorage(cart) {
    try {
      storage.set(KEYS.CART_INFORMATION, JSON.stringify(cart));
    } catch {}
  }

  getCartFromLocalStorage() {
    let cart = {};
    try {
      cart = JSON.parse(storage.get(KEYS.CART_INFORMATION) || '{}');
    } catch {}
    return cart;
  }

  getPriceFromLocalStorage() {
    this.price = storage.get(KEYS.PRODUCT_PRICE) || this.price;
  }

  savePriceToLocalStorage(price) {
    storage.set(KEYS.PRODUCT_PRICE, price);
  }

  getPrice() {
    return this.price;
  }

  setPrice(price) {
    this.price = price || this.price;
    this.savePriceToLocalStorage(price);
  }

  getCartElements() {
    if (!this.container) return {};
    const quantityEl = null;
    const subTotalPriceEl = this.container.querySelector('.sub-total-price');
    const totalPriceEl = this.container.querySelector('.total-price');
    const shippingPriceEl = this.container.querySelector('.shipping-price');
    const taxPriceEl = this.container.querySelector('.tax-price');
    const productPriceEl = this.container.querySelector('.product-price');

    return {
      quantityEl,
      subTotalPriceEl,
      totalPriceEl,
      shippingPriceEl,
      taxPriceEl,
      productPriceEl
    };
  }

  updateCart({ shippingFee, tax, quantity, saveCart = false } = {}) {
    const {
      quantityEl,
      subTotalPriceEl,
      totalPriceEl,
      shippingPriceEl,
      taxPriceEl,
      productPriceEl
    } = this.getCartElements();

    const currentCart = this.getCartFromLocalStorage();
    shippingFee =
      shippingFee != null ? shippingFee : currentCart.shippingFee || 0;
    tax = tax != null ? tax : currentCart.tax || 0;
    quantity = quantity != null ? quantity : currentCart.quantity || 1;

    const price = this.getPrice();
    const subTotalPrice = quantity * price;
    const totalPrice = subTotalPrice + shippingFee + tax;

    quantity = quantityEl ? quantityEl.value : quantity;

    if (saveCart) {
      this.saveCartToLocalStorage({
        price,
        shippingFee,
        tax,
        quantity,
        totalPrice
      });
    }

    if (productPriceEl) productPriceEl.innerText = `$${price}`;
    if (subTotalPriceEl) subTotalPriceEl.innerText = `$${subTotalPrice}`;
    if (shippingPriceEl)
      shippingPriceEl.innerText = shippingFee ? `$${shippingFee}` : 'FREE';
    if (taxPriceEl) {
      if (tax > 0) {
        taxPriceEl.classList.add('show');
        taxPriceEl.innerText = tax;
      } else {
        taxPriceEl.classList.remove('show');
      }
    }
    if (totalPriceEl) totalPriceEl.innerText = `$${totalPrice}`;
  }

  async getCoinExchangeRateFromServer() {
    try {
      const exchangeRates = await getExchangeRates();
      storage.set(KEYS.COIN_FIAT_RATE, JSON.stringify(exchangeRates));
    } catch {}
  }

  async getPriceFromServer() {
    try {
      const productPrice = await getProductPrice();
      if (productPrice) {
        const { OfferPrice: price } = productPrice;
        this.setPrice(price);
      }
    } catch {}

    if (!this.container) return;
    const productPriceEl = this.container.querySelector('.product-price');
    if (!productPriceEl) return;
    productPriceEl.innerText = `$${this.getPrice()}`;

    this.updateCart();
  }

  async getShippingFeeFromServer({ address, city, zip, state, country }) {
    let quantity = 1;
    let shippingFee = 0;
    let tax = 0;

    try {
      const fee = await getShippingFee({ address, city, zip, state, country });
      if (fee) {
        const productPrice = fee.Price;
        this.setPrice(productPrice);
        shippingFee = fee.ShippingFee;
        tax = fee.Tax;
      }
    } catch {}

    this.updateCart({
      quantity,
      shippingFee,
      tax,
      saveCart: true
    });
  }
}
