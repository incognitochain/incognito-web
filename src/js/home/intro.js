import { subscribe } from '../service/api';
import { setMessage } from '../service/message_box';

const changeCryptoName = ({ listName, timeout }) => {
  const cryptoNameEl = document.querySelector('#intro-container .crypto-name');
  let currentIndex = 1;
  const classAni = 'flip-ani';
  cryptoNameEl && setInterval(() => {
    cryptoNameEl.innerText = listName[currentIndex++];

    if (cryptoNameEl.classList.contains(classAni)) {
      cryptoNameEl.classList.remove(classAni);
    } else {
      cryptoNameEl.classList.add(classAni);
      setTimeout(() =>  cryptoNameEl.classList.remove(classAni), 500);
    }

    // reset
    if (currentIndex >= listName.length) {
      currentIndex = 0;
    }
  }, timeout);
}

const formHandle = () => {
  const emailEl = document.querySelector('#email-input');
  const form = document.querySelector('form.email-subscribe');
  const submitBtn = document.querySelector('button.submit-email');

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


changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'BNB'], timeout: 5000 });
formHandle();