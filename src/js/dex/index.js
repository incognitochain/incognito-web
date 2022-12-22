import axios from 'axios';
import $ from 'jquery';
import BigNumber from 'bignumber.js';

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

const getTokenList = () => axios.get(`https://api.incognito.org/ptoken/list`);

const getBeaconHeight = () =>
  axios.post(
    `https://mainnet.incognito.org/fullnode`,
    {
      jsonrpc: '1.0',
      method: 'getblockchaininfo',
      params: [],
      id: 1
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then(res => res.data.Result.BestBlocks[-1].Height);
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
  ).then(res => res.data.Result.PDEPoolPairs);

const calcTotalLiquid = tokens =>
  formatCurrencyByUSD(
    tokens
      .reduce((total, token) => {
        return new BigNumber(total)
          .plus(new BigNumber(token.usdtLiquid))
          .plus(
            new BigNumber(token.volume)
              .dividedBy(Math.pow(10, token.PDecimals))
              .multipliedBy(Math.pow(10, pUSDT.PDecimals))
          )
      }, 0)
      .dividedBy(Math.pow(10, 6))
  );
const formatCurrencyByUSD = price =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }).format(
    price
  );

const calcVolumeToken = (price, cirSupply) =>
  new BigNumber(price).multipliedBy(cirSupply).toString();

const calcPriceTokenByUSDT = (pDecimals, token) => {
  const a = new BigNumber(token.a);
  const b = new BigNumber(token.b);

  const k = a.multipliedBy(b);
  return b
    .minus(k.dividedBy(a.plus(Math.pow(10, pDecimals - 2))))
    .multipliedBy(1e2)
    .dividedBy(Math.pow(10, pUSDT.PDecimals));
};

const calcPriceChange = (price, prevPrice) => {
  if (prevPrice > 0) {
    const priceBN = new BigNumber(price);
    const lastPriceBN = new BigNumber(prevPrice);

    if (lastPriceBN.isEqualTo(priceBN)) {
      return '';
    }

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

const renderTradingBoard = (tokens, prevTokens) =>
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

const parseTokens = (pairs, tokenList, prevTokens) => {
  const tokenPairWithUSDT = getTokenPairWithUSDT(pairs);
  const tokensValid = tokenList.filter(token =>
    tokenPairWithUSDT.some(
      tokenPaired => tokenPaired.TokenID === token.TokenID
    )
  );
  return tokensValid
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
        priceChange:
          prevTokens ?
          calcPriceChange(
            price,
            (prevTokens.find(item => item.TokenID === item.TokenID) || { price: 0 }).price
          ) : '',
        usdtLiquid: tokenPaired.b,
        tokenLiquid: tokenPaired.a,
      };
      return [...arr, token];
    }, [])
    .sort((a, b) => {
      const aVolume = new BigNumber(a.volume);
      const bVolume = new BigNumber(b.volume);
      return bVolume.minus(aVolume);
    });
};

const fetchData = async () => {
  try {
    const tokenListData = await getTokenList();
    const tokenList = [...tokenListData.data.Result, pPRV];
    const beaconHeight = await getBeaconHeight();
    const prevPairs = await getPDex(beaconHeight - 1);
    const currentPairs = await getPDex(beaconHeight);
    const prevTokens = parseTokens(prevPairs, tokenList);
    const currentTokens = parseTokens(currentPairs, tokenList, prevTokens);

    $('#trading-board-container .tb-main').append(renderTradingBoard(currentTokens, prevTokens));
    $('#trading-board-container .tb-intro #total-liquid').text(
      `Liquidity pool: ${calcTotalLiquid(currentTokens)}`
    );
  } catch (error) {
    console.log(error);
  }
};

const main = () => {
  document.onreadystatechange = function() {
    if (document.readyState === 'complete') {
      fetchData();
    }
  };
};

main();
