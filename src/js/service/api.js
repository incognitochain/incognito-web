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
    }
  })
    .then(subscribeModel.fromJson)
    .catch(e => {
      throw new Error(
        e.message || 'Can not subscribe your email right now, please try later'
      );
    });
};

export const auth = email => {
  return fetch('auth/token', {
    method: 'POST',
    body: {
      Email: email
    }
  })
    .then(authModel.fromJson)
    .catch(e => {
      throw new Error(
        e.message || 'Can not register your email right now, please try later'
      );
    });
};

export const listReferralLevel = () => {
  return fetch('auth/referral-levels', {
    method: 'GET'
  })
    .then(data => data && data.map(referralLevelModel.fromJson))
    .catch(e => {
      throw new Error(e.message || 'Can not get referral program list');
    });
};

export const getUserTotalReferral = () => {
  return fetch('auth/total-referral', {
    method: 'GET'
  })
    .then(num => Number.parseInt(num) || 0)
    .catch(e => {
      throw new Error(e.message || 'Can not get user referral total');
    });
};

export const verifyEmailToken = token => {
  return fetch('auth/verify-email', {
    method: 'POST',
    body: {
      Token: token
    }
  }).catch(e => {
    throw new Error(e.message || 'Token is invalid');
  });
};

export const sendReferralInvitation = emails => {
  const emailStr = emails && emails.join(',');
  return fetch('auth/referral-invitation', {
    method: 'POST',
    body: {
      Email: emailStr
    }
  }).catch(e => {
    if (!APP_ENV.production) {
      console.error(e);
    }

    throw new Error(e.message || 'Can not send invitation to your email list');
  });
};

export const getTotalSubscribe = () => {
  return fetch('auth/total-subscrite', {
    method: 'GET'
  })
    .then(num => Intl.NumberFormat().format(num))
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }

      throw new Error(e.message || 'Can not get total subscriber');
    });
};

export const getExchangeRates = () => {
  return fetch('exchange/rates', {
    method: 'GET'
  })
    .then(rates => {
      const fiatRate = {};
      rates.forEach(rate => {
        fiatRate[rate.Base.toLowerCase()] = rate.Price;
      });
      return fiatRate;
    })
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }
    });
};

export const getProductPrice = () => {
  return fetch('order/price', {
    method: 'GET'
  })
    .then(price => price)
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }
    });
};

export const signUp = ({ name, email }) => {
  return fetch('auth/signup', {
    method: 'POST',
    body: {
      FullName: name,
      Email: email
    }
  })
    .then(user => user.fromJson)
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }
    });
};

export const getShippingFee = ({
  address = '',
  city = '',
  zip = '',
  state,
  country
}) => {
  return fetch('order/shipping-fee', {
    method: 'POST',
    body: {
      AddressStreet: address,
      AddressCity: city,
      AddressRegion: state,
      AddressPostalCode: zip,
      AddressCountry: country
    }
  })
    .then(fee => fee.fromJson)
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }
    });
};

export const submitCryptoOrder = ({
  email,
  name,
  address,
  city,
  state,
  country,
  zip,
  coinName,
  quantity
}) => {
  return fetch('order/crypto/checkout', {
    method: 'POST',
    body: {}
  })
    .then(orderInfo => orderInfo.fromJson)
    .catch(e => {
      if (!APP_ENV.production) {
        console.error(e);
      }
    });
};
