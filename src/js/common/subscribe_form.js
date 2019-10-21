import { subscribe, auth } from '../service/api';
import { setMessage } from '../service/message_box';
import storage from '../service/storage';
import KEYS from '../constant/keys';
import { trackEvent } from './utils/ga';
import queryString from '../service/queryString';

const getReferralCode = () => {
  return storage.get(KEYS.REFERRAL_CODE) || undefined;
};

const formHandle = () => {
  const forms = document.querySelectorAll('form#email-subscribe');
  for (let form of forms) {
    const emailEl = form && form.querySelector('#email-input');
    const submitBtn = form && form.querySelector('button.submit-email');

    emailEl &&
      emailEl.addEventListener('input', function(event) {
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
          eventLabel: 'Subscribe email'
        });

        e.preventDefault();

        //set submit status
        const submitBtnText = submitBtn.querySelector('#text') || {};
        const originalBtnText = submitBtnText.innerText;
        submitBtnText.innerText = 'Sending...';
        submitBtn.disabled = 'disabled';
        submitBtn.classList.add('loading');

        try {
          const subscribedData = await subscribe(
            emailEl.value,
            getReferralCode()
          );
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
          submitBtnText.innerText = originalBtnText;
          submitBtn.disabled = undefined;
          submitBtn.classList.remove('loading');
        }
      });
  }
};

const handleAutoSignIn = () => {
  const email = queryString('email');

  if (email.trim()) {
    const emailForm = document.querySelector('#email-subscribe');
    if (!emailForm) return;
    const emailInput = emailForm.querySelector('#email-input');
    if (!emailInput) return;
    emailInput.value = email.trim();
    const submitButton = emailForm.querySelector('.submit-email');
    if (!submitButton) return;
    submitButton.click();
  }
};

const handleClickBuyNow = () => {
  const buyNowButtons = document.querySelectorAll('.buy-now-btn');
  buyNowButtons.forEach(buyNowButton => {
    buyNowButton.addEventListener('click', () => {
      trackEvent({
        eventCategory: 'Payment',
        eventAction: 'click',
        eventLabel: 'Buy Now'
      });
    });
  });
};

const handleRenderAmazonExpressCheckoutButton = () => {
  const amazonButtonSeller = document.querySelector(
    '#amazon-express-checkout-btn'
  );
  if (!amazonButtonSeller) return;
  OffAmazonPayments.Button(
    'amazon-express-checkout-btn',
    APP_ENV.AMAZON_SELLER_ID,
    {
      type: 'PwA',
      size: 'medium',
      color: 'Gold',
      authorization: () => {
        const loginOptions = {
          scope:
            'profile postal_code payments:widget payments:shipping_address payments:billing_address'
        };

        if (amazon && amazon.Login)
          amazon.Login.authorize(
            loginOptions,
            'payment.html?gateway=amazon-express'
          );
      },
      onError: error => {
        if (!APP_ENV.production) {
          console.error(error);
        }
      }
    }
  );
};

const main = () => {
  // formHandle();
  handleAutoSignIn();
  handleClickBuyNow();
  handleRenderAmazonExpressCheckoutButton();
};

main();
