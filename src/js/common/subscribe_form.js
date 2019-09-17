import { subscribe, auth } from '../service/api';
import { setMessage } from '../service/message_box';
import storage from '../service/storage';
import KEYS from '../constant/keys';
import { trackEvent } from './utils/ga';

const getReferralCode = () => {
  return storage.get(KEYS.REFERRAL_CODE) || undefined;
}

const formHandle = () => {
  const forms = document.querySelectorAll('form#email-subscribe');
  for (let form of forms) {
    const emailEl = form && form.querySelector('#email-input');
    const submitBtn = form && form.querySelector('button.submit-email');

    emailEl && emailEl.addEventListener("input", function (event) {
      if (emailEl.validity.patternMismatch || emailEl.validity.typeMismatch) {
        emailEl.setCustomValidity("This is not valid email!");
      } else {
        emailEl.setCustomValidity("");
      }
    });

    form && form.addEventListener('submit', async (e) => {
      trackEvent({
        eventCategory: 'Button',
        eventAction: 'submit',
        eventLabel: 'Subscribe email',
      });

      e.preventDefault();

      //set submit status
      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = 'disabled';

      try {
        const subscribedData = await subscribe(emailEl.value, getReferralCode());
        const authData = await auth(emailEl.value);

        setMessage('Your email has been subscribed!');

        // store data to local
        storage.setMultiple({
          [KEYS.TOKEN]: authData.token,
          [KEYS.MY_REFERRAL_CODE]: subscribedData.code
        });

        location.pathname = '/referral.html';

      } catch (e) {
        setMessage(e.message, 'error');
      } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = undefined;
      }
    });
  }
}

formHandle();