import storage from '../service/storage';
import KEYS from "../constant/keys";

const getUserReferralUrl = () => {
  const code = storage.get(KEYS.MY_REFERRAL_CODE);
  if (!code) return undefined;

  const url = `${location.origin}/${code}`;
  return url;
}

const main = () => {
  const container = document.querySelector('#referral-intro');
  if (!container) return;

  const elLink = container.querySelector('.referral-link'); 
  const elCopy = container.querySelector('.copy-content'); 

  const referralUrl = getUserReferralUrl();
  if (referralUrl) {
    elLink && (elLink.innerText = referralUrl);
    elCopy && elCopy.setAttribute('data-copy-value', referralUrl);
  }
};

main();