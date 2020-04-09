import KEYS from '../constant/keys';
import storage from '../service/storage';

export const storeOrderInformationToLocalStorage = (newPaymentInfo) => {
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

export const getCountdown = (ele) => {
  // Set the date we're counting down to
  var countDownDate = new Date('April 10, 2020 21:00:00').getTime();

  // Update the count down every 1 second
  var x = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var result =
      `0${hours}`.slice(-2) +
      ':' +
      `0${minutes}`.slice(-2) +
      ':' +
      `0${seconds}`.slice(-2);
    const shouldShow = new Date('April 10, 2020 20:00:00').getTime();
    if (shouldShow <= now) {
      ele.innerHTML = `Offer ends in ${result}`;
    }
    // If the count down is over, write some text
    if (distance < 0) {
      clearInterval(x);
      ele.innerHTML = 'EXPIRED';
    }
  }, 1000);
};

export const handleCountdown = () => {
  try {
    const container = document.querySelectorAll(`#submit-order-btn`);
    const countDownEle = document.createElement('div');
    countDownEle.classList.add(['countdown-container']);
    container.forEach((ele) => ele.before(countDownEle));
    getCountdown(countDownEle);
  } catch (error) {
    console.log(error);
  }
};
