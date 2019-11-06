import { getOrderHistory } from '../service/api';
import { setMessage } from '../service/message_box';
import LoadingButton from '../common/loading_button';

const getOrderStatusFormElements = container => {
  if (!container) return {};

  const emailEl = container.querySelector('#email');
  const orderNumberEl = container.querySelector('#order-id');
  const submitBtnEl = container.querySelector('#submit-btn');

  return {
    emailEl,
    orderNumberEl,
    submitBtnEl
  };
};

export const setupOrderStatusForm = (container, onOrderDetailsUpdated) => {
  const { emailEl, orderNumberEl, submitBtnEl } = getOrderStatusFormElements(
    container
  );

  submitBtnEl &&
    submitBtnEl.addEventListener('click', async () => {
      const email = emailEl && emailEl.value;
      const orderNumber =
        orderNumberEl &&
        orderNumberEl.value &&
        orderNumberEl.value.replace('#', '');

      if (!email) {
        return setMessage('Please enter your email', 'error');
      }

      if (!orderNumber) {
        return setMessage('Please enter your order number', 'error');
      }

      const submitBtnLoadingEl = new LoadingButton(submitBtnEl);
      submitBtnLoadingEl.show();

      try {
        const orderDetails = await getOrderHistory({ email, orderNumber });
        onOrderDetailsUpdated &&
          onOrderDetailsUpdated(orderNumber, orderDetails);
      } catch (e) {
        setMessage('Your order details are incorrect', 'error');
      } finally {
        submitBtnLoadingEl.hide();
      }
    });
};
