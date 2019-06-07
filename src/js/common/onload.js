import storage from '../service/storage';
import KEYS from "../constant/keys";
import { setMessage } from '../service/message_box';
import queryString from '../service/queryString';
import { verifyEmailToken } from '../service/api';

const checkAuth = () => {
  const token = storage.get(KEYS.TOKEN);

  if (token && location.pathname === '/') {
    location.pathname = '/referral.html';
  }
}

const checkVerifyEmailToken = () => {
  const token = queryString(KEYS.TOKEN_EMAIL_VERIFY_QS);
  if (token) {
    verifyEmailToken(token)
      .then(() => {
        setMessage('Your email was verified', 'info');
      })
      .catch((e) => {
        setMessage(e.message, 'error');
      });
  }
}

const checkReferralCode = () => {
  const referralCode = queryString(KEYS.REFERRAL_QUERY);
  if (referralCode) {
    storage.set(KEYS.REFERRAL_CODE, referralCode);
  }
}

const main = () => {
  checkAuth();
  checkVerifyEmailToken();
  checkReferralCode();
};


main();