import storage from '../service/storage';
import KEYS from "../constant/keys";
import { popupCenter } from '../service/window';
import { setMessage } from '../service/message_box';
import countdown from '../service/countdown';
import { getUserTotalReferral, listReferralLevel, sendReferralInvitation } from '../service/api';
import { openModal, closeModal } from '../service/modal';
import top50Img from '../../image/top50.svg';
import top10Img from '../../image/top10.svg';
import top1Img from '../../image/top1.svg';

const socialShareMsg = 'Can’t wait to get The Miner.  It’s going to earn me Bitcoin while I sleep';

const checkAuth = () => {
  const token = storage.get(KEYS.TOKEN);

  if (!token && location.pathname.includes('/referral.html')) {
    location.pathname = '/';
  }
}

const getUserReferralUrl = () => {
  const code = storage.get(KEYS.MY_REFERRAL_CODE);
  if (!code) return undefined;

  const url = `${location.origin}?referral=${code}`;
  return url;
}

const handleShareFb = (referralUrl) => {
  // https://www.facebook.com/sharer/sharer.php?u=${referralUrl}&quote=
  popupCenter(`https://www.facebook.com/sharer/sharer.php?u=${referralUrl}&quote=${socialShareMsg}`, 'Share to Facebook');
}

const handleShareTwitter = (referralUrl) => {
  // https://twitter.com/share?url=${referralUrl}&via=i&text
  popupCenter(`https://twitter.com/share?url=${referralUrl}&text=${socialShareMsg}`, 'Share to Twitter');
}

const handleSendEmail = async emails => {
  try {
    await sendReferralInvitation(emails);
    setMessage('Sent invitation successfully', 'info');
  } catch (e) {
    setMessage(e.message, 'error');
  }
}

const handleShowEmailList = emails => {
  const container = document.createElement('div');
  container.classList.add('share-google-container');

  const listEl = document.createElement('div');
  listEl.classList.add('list');

  const shareEl = document.createElement('button');
  shareEl.classList.add('share-btn');
  shareEl.innerText = 'Share';

  const renderEmail = (email, onClear) => {
    if (!email) return;
    const emailEl = document.createElement('div');
    emailEl.classList.add('email');
    emailEl.innerHTML = `
      <span>${email}</span>
      <span class='clear'>X</span>
    `;
    const clearEl = emailEl.querySelector('.clear');
    clearEl && clearEl.addEventListener('click', () => {
      listEl.removeChild(emailEl);
      onClear(email);
    });

    return emailEl;
  }

  const handleClear = email => {
    const foundIndex = emails.findIndex(e => e === email);
    
    if (foundIndex >=0) {
      emails.splice(foundIndex, 1);
    }
  }

  emails.forEach(email => {
    const emailEl = renderEmail(email, handleClear);
    emailEl && listEl.appendChild(emailEl);
  });

  container.appendChild(listEl);
  container.appendChild(shareEl);

  const modal = openModal('Select contact to share', container);

  shareEl.addEventListener('click', () => {
    handleSendEmail(emails);
    closeModal(modal);
  });
}

const handleShareGoogle = (referralUrl) => {
  if (typeof gapi === 'undefined') return;

  gapi.load('client', () => {
    gapi.client.init({
      'apiKey': APP_ENV.GOOGLE_API_KEY,
      // clientId and scope are optional if auth is not required.
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      'clientId': APP_ENV.GOOGLE_CLIENT_ID,
      'scope': 'https://www.googleapis.com/auth/contacts.readonly',
    }).then(function () {
      gapi.auth2.getAuthInstance().signIn().then(response => {
        const token = response && response.Zi.access_token;

        if (token) {
          fetch(`https://www.google.com/m8/feeds/contacts/default/full?access_token=${token}&alt=json`)
            .then(res => res.json())
            .then(data => {
              const feed = data.feed;
              const entry = feed.entry || [];
              const shared_emails = [];
              for (let i = 0; i < entry.length; i++) {
                const item = entry[i];
                if (item.hasOwnProperty('gd$email')) {
                  const email = item.gd$email[0].address;
                  if(/[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{2,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/.test(email)) shared_emails.push(email);
                }
              }

              handleShowEmailList(shared_emails);
            })
            .catch(() => {
              setMessage('Can not get your contact list');
            })
        }
      });    
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
      got: 'The Miner',
      desc: '10% OFF'
    },
    level2: {
      topPercent: top50Img,
      got: 'The Miner',
      desc: '25% OFF'
    },
    level3: {
      topPercent: top10Img,
      got: 'The Miner',
      desc: '50% OFF'
    },
    level4: {
      topPercent: top1Img,
      got: 'The Miner',
      desc: 'For FREE'
    }
  };

  const data = DATA[levelData.name];
  const box = document.createElement('div');
  box.classList.add('box');
  isActive && box.classList.add('active');

  box.innerHTML = `
    <div class='top-percent'>
      ${data.topPercent ? `<img src='${data.topPercent}' />` : ''}
    </div>
    <div class='desc'>${levelData.desc}</div>
    <div>${levelData.nums}</div>
    <div><span>${data.got}</span></div>
    <div><span class='minner'>${data.desc}</span></div>
  `;

  return box;
}

const handleShowInfo = async () => {
  try {
    const container = document.querySelector('#referral-info');
    if (!container) return;

    const statusContainerEl = container.querySelector('.current-status');
    const statusEl = container.querySelector('.current-status .status');
    const friendNumberContainerEl = container.querySelector('.referred-box');

    const { currentLevel, nextLevel, requiredNum, referralList } = await getReferralData() || {};

    if (currentLevel) {
      statusEl && (statusEl.innerText = currentLevel.desc);
    } else {
      statusContainerEl.innerText = 'You\'re Nobody.';
    }

    friendNumberContainerEl.innerText = `As the community grows, you need to grow too. Right now, you need to refer ${requiredNum} friends to level up to ${nextLevel.desc}.`;

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
  const googleShareBtn = container.querySelector('.btns button.share-google'); 

  const referralUrl = getUserReferralUrl();
  if (referralUrl) {
    elLink && (elLink.innerText = referralUrl);
    elCopy && elCopy.setAttribute('data-copy-value', referralUrl);
    fbShareBtn && fbShareBtn.addEventListener('click', () => handleShareFb(referralUrl));
    twitterShareBtn && twitterShareBtn.addEventListener('click', () => handleShareTwitter(referralUrl));
    googleShareBtn && googleShareBtn.addEventListener('click', () => handleShareGoogle(referralUrl));
  }
}

const main = () => {
  if (!location.pathname.includes('/referral.html')) return;
  handleIntro();
  checkAuth();
  // startCountdown();
  handleShowInfo();
};

main();
