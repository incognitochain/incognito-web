import { updateOrderDetails } from './details';
import { setupOrderStatusForm } from './form';

const container = document.querySelector('#order-history-container');

const getElements = () => {
  if (!container) return {};
  const orderStatusFormContainerEl = container.querySelector(
    '#order-history-form-container'
  );
  const orderStatusDetailsContainerEl = container.querySelector(
    '#order-history-details-container'
  );

  return {
    orderStatusFormContainerEl,
    orderStatusDetailsContainerEl
  };
};

const onOrderDetailsUpdated = async (orderNumber, orderDetails) => {
  const {
    orderStatusFormContainerEl,
    orderStatusDetailsContainerEl
  } = getElements();

  if (orderDetails) {
    updateOrderDetails(
      orderStatusDetailsContainerEl,
      orderNumber,
      orderDetails
    );

    if (orderStatusFormContainerEl) {
      orderStatusFormContainerEl.classList.add('hidden');
    }

    if (orderStatusDetailsContainerEl) {
      orderStatusDetailsContainerEl.classList.remove('hidden');
    }
  }
};

const main = () => {
  const { orderStatusFormContainerEl } = getElements();
  setupOrderStatusForm(orderStatusFormContainerEl, onOrderDetailsUpdated);
};

main();
