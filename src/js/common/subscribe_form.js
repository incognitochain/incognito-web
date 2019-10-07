import { subscribe, auth } from '../service/api';
import { setMessage } from '../service/message_box';
import storage from '../service/storage';
import KEYS from '../constant/keys';
import { trackEvent } from './utils/ga';
import queryString from '../service/queryString';

const getReferralCode = () => {
  return storage.get(KEYS.REFERRAL_CODE) || undefined;
};

const formHandle = () => {
  const forms = document.querySelectorAll('form#email-subscribe');
  for (let form of forms) {
    const emailEl = form && form.querySelector('#email-input');
    const submitBtn = form && form.querySelector('button.submit-email');

    emailEl &&
      emailEl.addEventListener('input', function(event) {
        if (emailEl.validity.patternMismatch || emailEl.validity.typeMismatch) {
          emailEl.setCustomValidity('This is not valid email!');
        } else {
          emailEl.setCustomValidity('');
        }
      });

    form &&
      form.addEventListener('submit', async e => {
        trackEvent({
          eventCategory: 'Button',
          eventAction: 'submit',
          eventLabel: 'Subscribe email'
        });

        e.preventDefault();

        //set submit status
        const submitBtnText = submitBtn.querySelector('#text') || {};
        const originalBtnText = submitBtnText.innerText;
        submitBtnText.innerText = 'Sending...';
        submitBtn.disabled = 'disabled';
        submitBtn.classList.add('loading');

        try {
          const subscribedData = await subscribe(
            emailEl.value,
            getReferralCode()
          );
          const authData = await auth(emailEl.value);

          setMessage('Your email has been subscribed!');

          // store data to local
          storage.setMultiple({
            [KEYS.TOKEN]: authData.token,
            [KEYS.MY_REFERRAL_CODE]: subscribedData.code
          });

          location.pathname = '/referral.html';
        } catch (e) {
          setMessage(e.message, 'error');
        } finally {
          submitBtnText.innerText = originalBtnText;
          submitBtn.disabled = undefined;
          submitBtn.classList.remove('loading');
        }
      });
  }
};

const handleAutoSignIn = () => {
  const email = queryString('email');

  if (email.trim()) {
    const emailForm = document.querySelector('#email-subscribe');
    if (!emailForm) return;
    const emailInput = emailForm.querySelector('#email-input');
    if (!emailInput) return;
    emailInput.value = email.trim();
    const submitButton = emailForm.querySelector('.submit-email');
    if (!submitButton) return;
    submitButton.click();
  }
};

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
      domain: 'incognito-org.myshopify.com',
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
              price: false
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
  formHandle();
  handleAutoSignIn();
  // handleBuyButton();
};

main();
