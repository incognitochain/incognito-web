import { subscribe } from './service';

const changeCryptoName = ({ listName, timeout }) => {
  const cryptoNameEl = document.querySelector('#intro-container .crypto-name');
  let currentIndex = 1;
  setInterval(() => {
    cryptoNameEl.innerText = listName[currentIndex++];

    if (cryptoNameEl.classList.contains('flip-ani')) {
      cryptoNameEl.classList.remove('flip-ani');
    } else {
      cryptoNameEl.classList.add('flip-ani');
      setTimeout(() =>  cryptoNameEl.classList.remove('flip-ani'), 500);
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

  emailEl.addEventListener("input", function (event) {
    if (emailEl.validity.patternMismatch || emailEl.validity.typeMismatch) {
      emailEl.setCustomValidity("This is not valid email!");
    } else {
      emailEl.setCustomValidity("");
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    //set submit status
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Sending...';

    subscribe(emailEl.value)
      .then(() => {
        alert('Subscribed!')
      })
      .catch((e) => {
        alert(e.message);
      })
      .finally(() => {
        submitBtn.innerText = originalBtnText;
      });
  });
}


changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'BNB'], timeout: 4000 });
formHandle();