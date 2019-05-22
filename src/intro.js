const changeCryptoName = ({ listName, timeout }) => {
  const cryptoNameEl = document.querySelector('#intro-container .crypto-name');
  let currentIndex = 0;
  setInterval(() => {
    cryptoNameEl.innerText = listName[currentIndex++];

    // reset
    if (currentIndex >= listName.length) {
      currentIndex = 0;
    }
  }, timeout);
}


// changeCryptoName({ listName: ['Bitcoin', 'Ethereum', 'BNB'], timeout: 1000 });