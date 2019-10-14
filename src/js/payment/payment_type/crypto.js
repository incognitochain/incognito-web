export default class CryptoPayment {
  constructor(container) {
    if (!container) {
      throw new Error('container not found');
    }

    this.parentContainer = container;
  }
}
