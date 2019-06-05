import { getErrorMessage } from './errorHandler';

const customFetch = (directUrl, { url, method, body, headers }) => {
  const _url = directUrl || url;
  return fetch(`${APP_ENV.BASE_API_URL}/${_url}`, {
    method,
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...headers
    }
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