import { trackEvent } from './utils/ga';

const handleClickBuyNow = () => {
  const buyNowButtons = document.querySelectorAll('.buy-now-btn');
  buyNowButtons.forEach(buyNowButton => {
    buyNowButton.addEventListener('click', () => {
      trackEvent({
        eventCategory: 'Payment',
        eventAction: 'click',
        eventLabel: 'Buy Now'
      });
    });
  });
};

// const handleRenderAmazonExpressCheckoutButton = () => {
//   const amazonButtonSeller = document.querySelector(
//     '#amazon-express-checkout-btn'
//   );
//   if (!amazonButtonSeller) return;
//   OffAmazonPayments.Button(
//     'amazon-express-checkout-btn',
//     APP_ENV.AMAZON_SELLER_ID,
//     {
//       type: 'PwA',
//       size: 'medium',
//       color: 'Gold',
//       authorization: () => {
//         trackEvent({
//           eventCategory: 'Payment',
//           eventAction: 'click',
//           eventLabel: 'Pay with Amazon Express'
//         });
//         const loginOptions = {
//           scope:
//             'profile postal_code payments:widget payments:shipping_address payments:billing_address'
//         };

//         if (amazon && amazon.Login)
//           amazon.Login.authorize(
//             loginOptions,
//             'payment.html?gateway=amazon-express'
//           );
//       },
//       onError: error => {
//         if (!APP_ENV.production) {
//           console.error(error);
//         }
//       }
//     }
//   );
// };

const main = () => {
  handleClickBuyNow();
  // handleRenderAmazonExpressCheckoutButton();
};

main();
