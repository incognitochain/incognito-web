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
  id: '0000000000000000000000000000000000000000000000000000000000000004',
  pDecimal: '9'
};

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

const calPriceTokenByUSDT = (pDecimals, token) => {
  const a = new BigNumber(token.a);
  const b = new BigNumber(token.b);
  const k = a.multipliedBy(b);
  return b
    .minus(k.dividedBy(a.plus(Math.pow(10, pDecimals))))
    .dividedBy(Math.pow(10, pUSDT.PDecimals))
    .toFixed(4);
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

const fetchData = async () => {
  try {
    const tokenListData = await getTokenList();
    const tokenList = tokenListData.data.Result;
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
        const token = {
          ...item,
          price: calPriceTokenByUSDT(item.PDecimals, tokenPaired)
        };
        return [...arr, token];
      }, [])
      .map(
        item =>
          `
        <div class="crypto-item">
          <div class="crypto-img">
            <img src="http://s3.amazonaws.com/incognito-org/wallet/cryptocurrency-icons/32@2x/color/${item.Symbol.toLowerCase()}@2x.png" alt="" />
          </div>
          <p class="crypto-name">
            ${item.PSymbol}
          </p>
          <p class="last-price">
            ${item.price}
          </p>
          <div class="price-action">
            <img alt="" src=""/>
          </div>
        </div>
      `
      );
    $('#trading-board-container .tb-main').append(tokens);
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
