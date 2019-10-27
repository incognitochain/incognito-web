import { sendReferralInvitation } from '../service/api';
import { setMessage } from '../service/message_box';
import { trackEvent } from './utils/ga';
import { isEmail } from '../common/utils/validate';

const parseData = emailStr => {
  try {
    const list = emailStr && emailStr.split(',');
    const isValid = list && list.every(isEmail);

    return [list, isValid];
  } catch (e) {
    return [null, false];
  }
};

const formHandle = () => {
  const form = document.querySelector('form.invite-email-form');
  const emailEl = form && form.querySelector('#email-input');
  const submitBtn = form && form.querySelector('button.submit-email');
  let listEmail = [];

  emailEl &&
    emailEl.addEventListener('input', function() {
      const [list, isValid] = parseData(emailEl.value);
      listEmail = list;

      if (!isValid) {
        emailEl.setCustomValidity(
          'Email list is invalid, make sure it is separated by commas'
        );
      } else {
        emailEl.setCustomValidity('');
      }
    });

  form &&
    form.addEventListener('submit', async e => {
      trackEvent({
        eventCategory: 'Button',
        eventAction: 'click',
        eventLabel: "Send invite via user's friend emails"
      });

      e.preventDefault();

      //set submit status
      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = 'disabled';

      try {
        await sendReferralInvitation(listEmail);
        setMessage('Sent invitation successfully', 'info');
      } catch (e) {
        setMessage(e.message, 'error');
      } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = undefined;
      }
    });
};

formHandle();
