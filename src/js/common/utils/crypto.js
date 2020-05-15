export const getCoinName = coin => {
  switch (coin) {
    case 'BTC':
      return 'Bitcoin';
    case 'ETH':
      return 'Ethereum';
    case 'BNB':
      return 'Binance';
    case 'USDT':
      return 'Tether - ERC20';
    case 'USDC':
      return 'USD Coin';
    case 'TUSD':
      return 'TrueUSD';
    case 'PAX':
      return 'Paxos Standard';
    case 'GUSD':
      return 'Gemini Dollar';
    case 'USDS':
      return 'Stably';
    case 'BUSD':
      return 'Binance USD';
    case 'PRV':
      return 'PRV';
    default: 
      return coin;
  }
};
