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
  if (typeof gapi === 'undefined') return;

  function updateSigninStatus(isSignedIn) {
    // When signin status changes, this function is called.
    // If the signin status is changed to signedIn, we make an API call.
    if (isSignedIn) {
      makeApiCall();
    }
  }

  function handleSignInClick(event) {
    // Ideally the button should only show up after gapi.client.init finishes, so that this
    // handler won't be called before OAuth is initialized.
    gapi.auth2.getAuthInstance().signIn();
  }

  function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  function makeApiCall() {
    // Make an API call to the People API, and print the user's given name.
    gapi.client.people.people.get({
      'resourceName': 'people/me',
      'requestMask.includeField': 'person.names'
    }).then(function(response) {
      console.log('Hello, ' + response.result.names[0].givenName);
    }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
    });
  }

  gapi.load('client', () => {
    gapi.client.init({
      'apiKey': APP_ENV.GOOGLE_API_KEY,
      // clientId and scope are optional if auth is not required.
      'discoveryDocs': ["https://people.googleapis.com/$discovery/rest?version=v1"],
      'clientId': APP_ENV.GOOGLE_CLIENT_ID,
      'scope': 'contacts.readonly',
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      
      // Handle the initial sign-in state.
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      } else {
        handleSignInClick();
      }      
    });
  });  
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

const renderBoxLevel = (levelData, isActive) => {
  if (!levelData) return;

  const DATA = {
    level1: {
      icon: {
        normal: require('../../image/icon/referral_level/everyman-normal.svg'),
        active: require('../../image/icon/referral_level/everyman-active.svg')
      },
      got: {
        others: '10 Privacy'
      }
    },
    level2: {
      topPercent: 50,
      icon: {
        normal: require('../../image/icon/referral_level/citizen-normal.svg'),
        active: require('../../image/icon/referral_level/citizen-active.svg')
      },
      got: {
        others: '50 Privacy'
      }
    },
    level3: {
      topPercent: 10,
      icon: {
        normal: require('../../image/icon/referral_level/keep-normal.svg'),
        active: require('../../image/icon/referral_level/keeper-active.svg')
      },
      got: {
        minner: 1,
        others: 'Your stake for 1 month'
      }
    },
    level4: {
      topPercent: 1,
      icon: {
        normal: require('../../image/icon/referral_level/guardian-normal.svg'),
        active: require('../../image/icon/referral_level/guardian-active.svg')
      },
      got: {
        minner: 1,
        others: 'Your stake for 12 months'
      }
    }
  };

  const data = DATA[levelData.name];
  const box = document.createElement('div');
  box.classList.add('box');
  isActive && box.classList.add('active');

  box.innerHTML = `
    <div class='top-percent'>
      ${
        data.topPercent ? `
        <span>Top </span>
        <span class='percent'>${data.topPercent}%</span>` :
        ''
      }
    </div>
    <div><img src='${data.icon[isActive ? 'active' : 'normal']}' /></div>
    <div class='desc'>${levelData.desc}</div>
    <div>${levelData.nums}</div>
    <div>${
      data.got.minner ?
        '<span class="minner">1 The Minner</span>' :
        `<span>${data.got.others}</span>`
    }</div>
    <div>${
      (data.got.others && data.got.minner) ? `<span>${data.got.others}</span>` : ''
    }</div>
  `;

  return box;
}

const handleShowInfo = async () => {
  try {
    const container = document.querySelector('#referral-info');
    if (!container) return;

    const statusEl = container.querySelector('.current-status .status');
    const friendNumberEl = container.querySelector('.referred-box .friend-number');
    const bringFriendNumberEl = container.querySelector('.referred-box .bring-friend-number');
    const nextStatusEl = container.querySelector('.referred-box .next-status');

    const { currentLevel, nextLevel, total, requiredNum, referralList } = await getReferralData() || {};

    statusEl && (statusEl.innerText = currentLevel && currentLevel.desc || 'Pending');

    if (nextLevel) {
      friendNumberEl && (friendNumberEl.innerText = total || 0);
      bringFriendNumberEl && (bringFriendNumberEl.innerText = requiredNum || 0);
      nextStatusEl && (nextStatusEl.innerText = nextLevel.desc);
    }

    if (referralList) {
      const levelBoxEl = container.querySelector('.level-box');
      referralList.forEach(data => {
        const isActive = currentLevel && (data.name === currentLevel.name);
        const el = renderBoxLevel(data, isActive);
        levelBoxEl.appendChild(el);
      });

      setTimeout(() => {
        const activeLevelEl = container.querySelector('.box.active');
        if (activeLevelEl) {
          activeLevelEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  } catch (e) {
    setMessage('Can not get your referral data, please try later', 'error');
  }
}

const handleIntro = () => {
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
}

const main = () => {
  if (!location.pathname.includes('/referral.html')) return;
  // handleShareGoogle();
  handleIntro();
  checkAuth();
  startCountdown();
  handleShowInfo();
};

main();