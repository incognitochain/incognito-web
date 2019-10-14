import isPath from '../common/utils/isPathname';
import Cart from './cart';
import Payment from './payment';

const main = () => {
  if (!isPath('/payment')) return;

  const container = document.querySelector('#payment');
  if (!container) return;

  const cart = new Cart(container);
  const payment = new Payment(container, cart);
};

main();
