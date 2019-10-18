// polyfills for cross browsers
import '@babel/polyfill';
import 'intersection-observer';
import 'nodelist-foreach-polyfill';
import '@webcomponents/custom-elements';
import '@webcomponents/shadydom';

window.onAmazonLoginReady = function() {
  amazon.Login.setClientId(APP_ENV.AMAZON_CLIENT_ID);
};

import '../scss/main.scss';
import './referral';
import './common';
import './home1';
import './about';
import './payment';
// import './internalSubscriberBoard';
