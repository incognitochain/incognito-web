import KEYS from '../constant/keys';
import storage from '../service/storage';

export const storeOrderInformationToLocalStorage = newPaymentInfo => {
  const paymentInfo = getOrderInformationFromLocalStorage();
  const newInfo = { ...paymentInfo, ...newPaymentInfo };

  storage.set(KEYS.PAYMENT_INFORMATION, JSON.stringify(newInfo));
};

export const getOrderInformationFromLocalStorage = () => {
  try {
    const json = storage.get(KEYS.PAYMENT_INFORMATION) || '{}';
    const paymentInfo = JSON.parse(json);
    return paymentInfo;
  } catch (error) {
    if (!APP_ENV.production) {
      console.error(error);
    }
  }
  return {};
};
