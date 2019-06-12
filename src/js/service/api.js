import fetch from './fetch';
import authModel from '../model/auth';
import subscribeModel from '../model/subscribe';
import referralLevelModel from '../model/referralLevel';

export const subscribe = (email, referralCode) => {
  return fetch('auth/subscribe', {
    method: 'POST',
    body: {
      Email: email,
      ReferralCode: referralCode
    },
  })
  .then(subscribeModel.fromJson)
  .catch((e) => {
    throw new Error(e.message || 'Can not subscribe your email right now, please try later')
  });
}

export const auth = email => {
  return fetch('auth/token', {
    method: 'POST',
    body: {
      Email: email,
    },
  })
  .then(authModel.fromJson)
  .catch((e) => {
    throw new Error(e.message || 'Can not register your email right now, please try later')
  });
}

export const listReferralLevel = () => {
  return fetch('auth/referral-levels', {
    method: 'GET'
  })
  .then(data => data && data.map(referralLevelModel.fromJson))
  .catch((e) => {
    throw new Error(e.message || 'Can not get referral program list')
  });
}

export const getUserTotalReferral = () => {
  return fetch('auth/total-referral', {
    method: 'GET'
  })
  .then(num => Number.parseInt(num) || 0)
  .catch((e) => {
    throw new Error(e.message || 'Can not get user referral total')
  });
}

export const verifyEmailToken = (token) => {
  return fetch('auth/verify-email', {
    method: 'POST',
    body: {
      Token: token
    }
  })
  .catch((e) => {
    throw new Error(e.message || 'Token is invalid')
  });
}

export const sendReferralInvitation = (emails) => {
  const emailStr = emails && emails.join(',');
  return fetch('auth/referral-invitation', {
    method: 'POST',
    body: {
      Email: emailStr
    }
  })
  .catch((e) => {
    if (!APP_ENV.production) {
      console.error(e);
    }
    
    throw new Error(e.message || 'Can not send invitation to your email list')
  });
}

