import { getErrorMessage } from './errorHandler';

export const subscribe = email => {
  return fetch(`${APP_ENV.BASE_API_URL}/auth/subscribe`, {
    method: 'POST',
    body: JSON.stringify({
      Email: email,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(response => response.json())
  .then(json => {
    if (json && json.Error) {
      throw new Error(getErrorMessage(json.Error));
    }

    return json;
  })
  .catch((e) => {
    throw new Error(e.message || 'Can not subscribe your email right now, please try later')
  });
}