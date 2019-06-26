import { getTotalSubscribe } from '../service/api';

const containerEl = document.querySelector('#intro-container');

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

const showTotalSubscribe = async () => {
  const numberOfSubscriber = containerEl.querySelector('.number-of-subscriber');
  
  if (numberOfSubscriber) {
    let number = 998;
    try {
      number = await getTotalSubscribe();
      number = number && Intl.NumberFormat().format(number);
    } catch (e) {}
    
    numberOfSubscriber.innerText = number;
  }
}

const main = () => {
  if (location.pathname === '/') {
    changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'crypto'], timeout: 4000 });
  }
}

main();