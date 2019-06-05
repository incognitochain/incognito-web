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

changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'BNB'], timeout: 2000 });