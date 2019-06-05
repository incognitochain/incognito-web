import fetch from './fetch';
import authModel from '../model/auth';
import subscribeModel from '../model/subscribe';

export const subscribe = email => {
  return fetch('auth/subscribe', {
    method: 'POST',
    body: {
      Email: email,
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