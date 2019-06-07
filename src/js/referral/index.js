import storage from '../service/storage';
import KEYS from "../constant/keys";
import { popupCenter } from '../service/window';
import { setMessage } from '../service/message_box';
import countdown from '../service/countdown';
import { getUserTotalReferral, listReferralLevel } from '../service/api';

const checkAuth = () => {
  const token = storage.get(KEYS.TOKEN);

  if (!token && location.pathname.includes('/referral.html')) {
    location.pathname = '/';
  }
}

const getUserReferralUrl = () => {
  const code = storage.get(KEYS.MY_REFERRAL_CODE);
  if (!code) return undefined;

  const url = `${location.origin}/${code}`;
  return url;
}

const handleShareFb = (referralUrl) => {
  // https://www.facebook.com/sharer/sharer.php?u=${referralUrl}&quote=
  popupCenter(`https://www.facebook.com/sharer/sharer.php?u=${referralUrl}`, 'Share to Facebook');
}

const handleShareTwitter = (referralUrl) => {
  // https://twitter.com/share?url=${referralUrl}&via=i&text
  popupCenter(`https://twitter.com/share?url=${referralUrl}`, 'Share to Twitter');
}

const handleShareGoogle = () => {
  // if (typeof gapi === 'undefined') return;

  // gapi.load('client', () => {
  //   gapi.client.init({
  //     'apiKey': APP_ENV.GOOGLE_API_KEY,
  //     // clientId and scope are optional if auth is not required.
  //     'clientId': APP_ENV.GOOGLE_CLIENT_ID,
  //     'scope': 'profile',
  //   }).then(function() {
  //     return gapi.client.request({
  //       'path': 'https://people.googleapis.com/v1/people/me?requestMask.includeField=person.names',
  //     })
  //   }).then(function(response) {
  //     console.log(response.result);
  //   }, function(reason) {
  //     console.log('Error: ', reason);
  //   });
  // });  
}

const startCountdown = () => {
  const countdownEl = document.querySelector('.countdown');
  countdown(countdownEl, '2019-07-06T17:00:00.000Z', () => {
    setMessage('The program was ended', 'info');
  });
}

const getReferralData = async () => {
  try {
    const userTotal = await getUserTotalReferral();
    const referralList = await listReferralLevel();
    const foundIndex = referralList && referralList.findIndex((level, index, allLevel) => {
      return  allLevel[index+1] ? (userTotal >= level.nums && userTotal < allLevel[index+1].nums) : userTotal >= level.nums ;
    });
    const currentLevel = referralList[foundIndex];
    const nextLevel = referralList[foundIndex + 1];
    const requiredNum = nextLevel.nums - userTotal;

    return {
      total: userTotal,
      referralList,
      currentLevel,
      nextLevel,
      requiredNum
    };
  } catch {
    setMessage('Can not get referral program data', 'error');
  }
}


const main = () => {
  checkAuth();
  startCountdown();
  getReferralData().then(console.log);

  const container = document.querySelector('#referral-intro');
  if (!container) return;

  const elLink = container.querySelector('.referral-link'); 
  const elCopy = container.querySelector('.copy-content'); 
  const fbShareBtn = container.querySelector('.btns button.share-facebook'); 
  const twitterShareBtn = container.querySelector('.btns button.share-twitter'); 

  const referralUrl = getUserReferralUrl();
  if (referralUrl) {
    elLink && (elLink.innerText = referralUrl);
    elCopy && elCopy.setAttribute('data-copy-value', referralUrl);
    fbShareBtn && fbShareBtn.addEventListener('click', () => handleShareFb(referralUrl));
    twitterShareBtn && twitterShareBtn.addEventListener('click', () => handleShareTwitter(referralUrl));
  }
};

main();