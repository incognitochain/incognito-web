import { subscribe } from '../service/api';
import { setMessage } from '../service/message_box';

const formHandle = () => {
  const form = document.querySelector('form#email-subscribe');
  const emailEl = form && form.querySelector('#email-input');
  const submitBtn = form && form.querySelector('button.submit-email');

  emailEl && emailEl.addEventListener("input", function (event) {
    if (emailEl.validity.patternMismatch || emailEl.validity.typeMismatch) {
      emailEl.setCustomValidity("This is not valid email!");
    } else {
      emailEl.setCustomValidity("");
    }
  });

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();

    //set submit status
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Sending...';

    subscribe(emailEl.value)
      .then(() => {
        setMessage('Your email has been subscribed!')
      })
      .catch((e) => {
        setMessage(e.message, 'error');
      })
      .finally(() => {
        submitBtn.innerText = originalBtnText;
      });
  });
}

formHandle();