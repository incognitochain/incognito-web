import isPathname from '../common/utils/isPathname';

const handleBuyButton = () => {
  var scriptURL =
    'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (
      document.getElementsByTagName('head')[0] ||
      document.getElementsByTagName('body')[0]
    ).appendChild(script);
    script.onload = ShopifyBuyInit;
  }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'checkout.incognito.org',
      storefrontAccessToken: '0738109b2d77c9740efebdde8414cb91'
    });
    ShopifyBuy.UI.onReady(client).then(function(ui) {
      ui.createComponent('product', {
        id: '4180147437671',
        node: document.getElementById('product-component-1570420254197'),
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
          product: {
            styles: {
              product: {
                '@media (min-width: 601px)': {
                  'max-width': 'calc(25% - 20px)',
                  'margin-left': '20px',
                  'margin-bottom': '50px'
                }
              },
              button: {
                'font-size': '16px',
                'padding-top': '16px',
                'padding-bottom': '16px',
                'border-radius': '6px',
                'padding-left': '67px',
                'padding-right': '67px'
              },
              quantityInput: {
                'font-size': '16px',
                'padding-top': '16px',
                'padding-bottom': '16px'
              }
            },
            buttonDestination: 'checkout',
            contents: {
              img: false,
              title: false,
              price: false,
              quantity: true
            },
            text: {
              button: 'Buy now'
            },
            iframe: false,
            classes: {
              button: 'submit-email'
            }
          },
          cart: {
            popup: false,
            styles: {
              button: {
                'font-size': '16px',
                'padding-top': '16px',
                'padding-bottom': '16px',
                'border-radius': '6px'
              }
            },
            text: {
              total: 'Subtotal',
              button: 'Checkout'
            }
          },
          toggle: {
            styles: {
              count: {
                'font-size': '16px'
              }
            }
          }
        }
      });
    });
  }
};

const main = () => {
  if (!isPathname('/payment')) return;
  handleBuyButton();
};

main();
