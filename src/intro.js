const changeCryptoName = ({ listName, timeout }) => {
  const cryptoNameEl = document.querySelector('#intro-container .crypto-name');
  let currentIndex = 1;
  setInterval(() => {
    debugger
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


changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'BNB'], timeout: 4000 });