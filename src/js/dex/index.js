import fit from '../common/utils/fit';
import { subscribe } from '../service/api';
import { setMessage } from '../service/message_box';
import axios from 'axios';
import $ from 'jquery';
import BigNumber from 'bignumber.js';

const handleResizeLeftImage = container => {
  const imageContainerEl = container.querySelector('.image .image-container');
  if (!imageContainerEl) return;
  const imageEl = imageContainerEl.querySelector('.desktop');
  fit(imageEl, imageContainerEl, {
    // Alignment
    hAlign: fit.CENTER, // or fit.LEFT, fit.RIGHT
    vAlign: fit.CENTER, // or fit.TOP, fit.BOTTOM
    cover: true,
    watch: true,
    apply: true
  });
};

const handleSubscribeForm = container => {
  const formContainerEl = container.querySelector('');
  if (!formContainerEl) return;
  const emailInputEl = formContainerEl.querySelector('');
  const submitBtnEl = formContainerEl.querySelector('');

  if (!emailInputEl || !submitBtnEl) return;

  const onSubmitBtnClicked = () => {
    const email = emailInputEl.value;
    try {
      subscribe(email, '', 'dex');
      setMessage('Your email has been subscribed!');
    } catch (e) {
      setMessage(e, 'error');
    }
  };

  submitBtnEl.addEventListener('click', onSubmitBtnClicked);
};

const pUSDT = {
  ID: 9,
  CreatedAt: '2019-11-06T05:49:57Z',
  UpdatedAt: '2019-11-06T05:49:57Z',
  DeletedAt: null,
  TokenID: '716fd1009e2a1669caacc36891e707bfdf02590f96ebd897548e8963c95ebac0',
  Symbol: 'USDT',
  OriginalSymbol: '',
  Name: 'Tether USD',
  ContractID: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  Decimals: 6,
  PDecimals: 6,
  Status: 1,
  Type: 1,
  CurrencyType: 3,
  PSymbol: 'pUSDT',
  Default: true,
  UserID: 10538,
  Verified: true
};

const pPRV = {
  PSymbol: 'PRV',
  Symbol: 'PRV',
  PDecimals: 9,
  TokenID: '0000000000000000000000000000000000000000000000000000000000000004'
};

const PDEX_TOKENS = 'pDexTokens';

const getTokenList = () => axios.get(`https://api.incognito.org/ptoken/list`);

const getBeaconHeight = () =>
  axios.post(
    `https://mainnet.incognito.org/fullnode`,
    {
      jsonrpc: '1.0',
      method: 'getbeaconbeststate',
      params: [],
      id: 1
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
const getPDex = BeaconHeight =>
  axios.post(
    `https://mainnet.incognito.org/fullnode`,
    {
      id: 1,
      jsonrpc: '1.0',
      method: 'getpdestate',
      params: [
        {
          BeaconHeight
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

const calcTotalLiquid = tokens =>
  formatCurrencyByUSD(
    tokens
      .reduce((total, token) => {
        return new BigNumber(total).plus(new BigNumber(token.liquid));
      }, 0)
      .dividedBy(Math.pow(10, 6))
      .toFixed(4)
  );
const formatCurrencyByUSD = price =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    price
  );

const calcVolumeToken = (price, cirSupply) =>
  new BigNumber(price).multipliedBy(cirSupply).toString();

const calcPriceTokenByUSDT = (pDecimals, token) => {
  const a = new BigNumber(token.a);
  const b = new BigNumber(token.b);
  const k = a.multipliedBy(b);
  return b
    .minus(k.dividedBy(a.plus(Math.pow(10, pDecimals))))
    .dividedBy(Math.pow(10, pUSDT.PDecimals))
    .toFixed(4);
};

const calcPriceChange = (price, tokenID) => {
  if (PDEX_TOKENS in localStorage) {
    const pDexTokens = JSON.parse(localStorage.getItem(PDEX_TOKENS));
    const { price: lastPrice } = pDexTokens.find(
      item => item.TokenID === tokenID
    );
    const priceBN = new BigNumber(price);
    const lastPriceBN = new BigNumber(lastPrice);
    if (lastPriceBN.isGreaterThan(priceBN)) {
      return 'price_up';
    }
    return 'price_down';
  }
  return '';
};

const getTokenPairWithUSDT = PDEPoolPairs =>
  Object.keys(PDEPoolPairs)
    .filter(key => {
      const item = PDEPoolPairs[key];
      return (
        item.Token1IDStr === pUSDT.TokenID || item.Token2IDStr === pUSDT.TokenID
      );
    })
    .reduce((arr, key) => {
      const item = { ...PDEPoolPairs[key] };
      if (pUSDT.TokenID === item.Token1IDStr) {
        item.TokenID = item.Token2IDStr;
        item.a = item.Token2PoolValue;
        item.b = item.Token1PoolValue;
      } else {
        item.TokenID = item.Token1IDStr;
        item.a = item.Token1PoolValue;
        item.b = item.Token2PoolValue;
      }
      return [...arr, item];
    }, []);

const renderTradingBoard = tokens =>
  [...tokens].map(item => {
    return new BigNumber(item.price).isGreaterThanOrEqualTo(new BigNumber(0.001))
      ? `
<div class="crypto-item" id=${item.TokenID}>
  <div class="crypto-img">
    <img src="http://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/${item.Symbol.toLowerCase()}@2x.png" alt="" />
  </div>
  <p class="crypto-name">
    ${item.PSymbol}
  </p>
  <p class="last-price">
    ${formatCurrencyByUSD(item.price)}
  </p>
  <div class="price-action">
    <img alt="" src="${
      !!item.priceChange
        ? `${require(`../../image/dex/${item.priceChange}.svg`)}`
        : ''
    }"/>
  </div>
</div>
`
      : null;
  });

const fetchData = async () => {
  try {
    const tokenListData = await getTokenList();
    const tokenList = [...tokenListData.data.Result, pPRV];
    const beaconHeightData = await getBeaconHeight();
    const { BeaconHeight } = beaconHeightData.data.Result;
    const pdex = await getPDex(BeaconHeight);
    const { PDEPoolPairs } = pdex.data.Result;
    const tokenPairWithUSDT = getTokenPairWithUSDT(PDEPoolPairs);
    const tokensValid = tokenList.filter(token =>
      tokenPairWithUSDT.some(
        tokenPaired => tokenPaired.TokenID === token.TokenID
      )
    );
    const tokens = tokensValid
      .reduce((arr, item) => {
        const tokenPaired = tokenPairWithUSDT.find(
          tokenPaired => tokenPaired.TokenID === item.TokenID
        );
        const price = calcPriceTokenByUSDT(item.PDecimals, tokenPaired);
        const volume = calcVolumeToken(price, tokenPaired.a);
        const token = {
          ...item,
          price,
          volume,
          priceChange: calcPriceChange(price, item.TokenID),
          liquid: tokenPaired.b
        };
        return [...arr, token];
      }, [])
      .sort((a, b) => {
        const aVolume = new BigNumber(a.volume);
        const bVolume = new BigNumber(b.volume);
        return bVolume.minus(aVolume);
      });
    localStorage.setItem(PDEX_TOKENS, JSON.stringify(tokens));
    $('#trading-board-container .tb-main').append(renderTradingBoard(tokens));
    $('#trading-board-container .tb-intro #total-liquid').text(
      `Liquidity pool: ${calcTotalLiquid(tokens)}`
    );
  } catch (error) {
    console.log(error);
  }
};

const main = () => {
  document.onreadystatechange = function() {
    if (document.readyState == 'complete') {
      fetchData();
    }
  };
};

main();
