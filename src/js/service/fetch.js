import { getErrorMessage } from './errorHandler';
import storage from './storage';
import KEYS from '../constant/keys';

const customFetch = (directUrl, { url, method, body, headers }) => {
  const _url = directUrl || url;
  const token = storage.get(KEYS.TOKEN)
  const _headers = {
    "Content-type": "application/json; charset=UTF-8",
    ...headers
  };

  token && (_headers['Authorization'] = `Bearer ${token}`);

  return fetch(`${APP_ENV.BASE_API_URL}/${_url}`, {
    method,
    body: JSON.stringify(body),
    headers: _headers
  })
  .then(response => response.json())
  .then(json => {
    if (json && json.Error) {
      throw new Error(getErrorMessage(json.Error));
    }

    return json && json.Result;
  })
}

export default customFetch;