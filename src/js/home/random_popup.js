const randomCurrency = () => {
  const currencies = [
    {
      prefix: '0x',
      symbol: 'ETH',
      maxRandomAmount: 20,
    }, {
      prefix: '',
      symbol: 'BTC',
      maxRandomAmount: 5,
    }, {
      prefix: 'bnb',
      symbol: 'BNB',
      maxRandomAmount: 5000,
    }
  ];

  const randomStr1 = [Math.random().toString(36).substr(2, 6), Math.random().toString(36).substr(2, 5)];
  const randomStr2 = [Math.random().toString(36).substr(2, 3), Math.random().toString(36).substr(2, 5)];
  const data = currencies[Math.round(Math.random()*2)];

  return {
    address1: `${data.prefix}${randomStr1[0]}..${randomStr1[1]}`,
    address2: `${data.prefix}${randomStr2[0]}..${randomStr2[1]}`,
    symbol: data.symbol,
    maxRandomAmount: data.maxRandomAmount
  };
}

const randomActivity = (address) => {
  const prefixes = ['Sent to', 'Received from'];

  return `${prefixes[Math.round(Math.random()*1)]} ${address}`
}

const randomBalance = (max = 100) => {
  return (Math.random() * max).toFixed(2);
}

const getTime = () => {
  const r = Math.random();
  if (r === 0 || r > 0.5) {
    const time = new Date();

    return `at ${time.getHours()}:${time.getMinutes()}`;
  }
  
  return `${Math.round(r * 120)}m ago`;
};

const createPopup = () => {
  const containerEl = document.createElement('div');
  const addressEl = document.createElement('span');
  const balanceEl = document.createElement('div');
  const balanceLabelEl = document.createElement('span');
  const balanceValueEl = document.createElement('span');
  const activityEl = document.createElement('div');
  const activityLabelEl = document.createElement('span');
  const activityValueEl = document.createElement('span');
  const activityTimeEl = document.createElement('span');
  const { address1, address2, symbol, maxRandomAmount } = randomCurrency();

  containerEl.classList.add('popup-random');
  balanceEl.classList.add('balance');
  activityEl.classList.add('activity');
  balanceLabelEl.classList.add('label');
  activityLabelEl.classList.add('label');
  activityValueEl.classList.add('value');
  balanceValueEl.classList.add('value');
  activityTimeEl.classList.add('value');

  balanceLabelEl.innerText = 'Balance';
  balanceValueEl.innerText = `${randomBalance(maxRandomAmount)} ${symbol}`;
  activityLabelEl.innerText = 'Activity';
  activityValueEl.innerText = randomActivity(address2);
  activityTimeEl.innerText = `(${getTime()})`;
  addressEl.innerText = address1;

  balanceEl.append(balanceLabelEl, balanceValueEl);
  activityEl.append(activityLabelEl, activityValueEl, activityTimeEl);
  containerEl.append(addressEl, balanceEl, activityEl);

  return containerEl;
};

export default () => {
  const container = document.querySelector('#home-container #intro-container');

  if (!container) return;

  container.appendChild(createPopup());
}
