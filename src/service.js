export const subscribe = email => {
  return fetch('https://test-api.incognito.org/auth/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      Email: email,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(response => response.json())
  .catch(() => {
    throw new Error('Can not subscribe your email right now, please try later')
  });
}