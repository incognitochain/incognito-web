import { getErrorMessage } from './errorHandler';
import storage from './storage';
import KEYS from '../constant/keys';

const customFetch = (
  directUrl,
  { url, method, body, headers, token = storage.get(KEYS.TOKEN) }
) => {
  const _url = directUrl || url;
  const _headers = {
    Accept: '*/*',
    'Content-type': 'application/json',
    ...headers
  };

  token && (_headers['Authorization'] = `Bearer ${token}`);

  console.log('BASE_API_URL', APP_ENV.BASE_API_URL);
  const BASE_API_URL = "https://api.incognito.org"
  return fetch(`${BASE_API_URL}/${_url}`, {
    method,
    body: JSON.stringify(body),
    headers: _headers
  })
    .then(response => response.json())
    .then(
      json => {
        if (json && json.Error) {
          throw new Error(getErrorMessage(json.Error));
        }

        return json && json.Result;
      },
      e => {
        throw new Error('Opps! Something went wrong, please try later.');
      }
    )
    .catch(e => {
      throw e;
    });
};

export default customFetch;
