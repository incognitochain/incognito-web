import storage from '../service/storage';
import KEYS from "../constant/keys";
import { setMessage } from '../service/message_box';
import queryString from '../service/queryString';
import { verifyEmailToken } from '../service/api';
import isPathname from '../common/utils/isPathname';

const checkAuth = () => {
  const token = storage.get(KEYS.TOKEN);

  if (token && isPathname('/')) {
    location.pathname = '/referral.html';
  }
}

const checkVerifyEmailToken = () => {
  const token = queryString(KEYS.TOKEN_EMAIL_VERIFY_QS);
  if (token) {
    verifyEmailToken(token)
      .then(() => {
        setMessage('Your email has been verified', 'info');
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
    location.href = `${location.origin}/referral.html`;
  }
}

const main = () => {
  // checkAuth();
  checkVerifyEmailToken();
  checkReferralCode();
};


main();