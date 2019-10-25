import { subscribe, auth } from '../service/api';
import { setMessage } from '../service/message_box';
import storage from '../service/storage';
import KEYS from '../constant/keys';
import { trackEvent } from './utils/ga';
import LoadingButton from './loading_button';

const getReferralCode = () => {
  return storage.get(KEYS.REFERRAL_CODE) || undefined;
};

const formHandle = () => {
  const forms = document.querySelectorAll('form#email-subscribe');
  for (let form of forms) {
    const from = form.getAttribute('from') || '';
    const emailEl = form && form.querySelector('#email-input');
    const submitBtn = form && form.querySelector('button.submit-email');

    emailEl &&
      emailEl.addEventListener('input', function() {
        if (emailEl.validity.patternMismatch || emailEl.validity.typeMismatch) {
          emailEl.setCustomValidity('This is not valid email!');
        } else {
          emailEl.setCustomValidity('');
        }
      });

    form &&
      form.addEventListener('submit', async e => {
        trackEvent({
          eventCategory: 'Button',
          eventAction: 'submit',
          eventLabel: `Subscribe email${from && ` from ${from}`}`
        });

        e.preventDefault();

        const loadingSubmitBtn = new LoadingButton(submitBtn);
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';

        loadingSubmitBtn.show();

        try {
          const subscribedData = await subscribe(
            emailEl.value,
            getReferralCode(),
            from
          );
          const authData = await auth(emailEl.value);

          setMessage('Your email has been subscribed!');

          // store data to local
          storage.setMultiple({
            [KEYS.TOKEN]: authData.token,
            [KEYS.MY_REFERRAL_CODE]: subscribedData.code
          });
        } catch (e) {
          setMessage(e.message, 'error');
        } finally {
          submitBtn.innerText = originalBtnText;
          loadingSubmitBtn.hide();
        }
      });
  }
};

// const handleAutoSignIn = () => {
//   const email = queryString('email');

//   if (email.trim()) {
//     const emailForm = document.querySelector('#email-subscribe');
//     if (!emailForm) return;
//     const emailInput = emailForm.querySelector('#email-input');
//     if (!emailInput) return;
//     emailInput.value = email.trim();
//     const submitButton = emailForm.querySelector('.submit-email');
//     if (!submitButton) return;
//     submitButton.click();
//   }
// };

const main = () => {
  formHandle();
  // handleAutoSignIn();
};

main();
