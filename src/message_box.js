export const setMessage = (msg, type, timeout = 4000) => {
  const classType = type === 'error' ? 'error' : 'info';
  const msgContainerEl = document.getElementById('message-box');
  const msgEl = msgContainerEl.querySelector('.message');

  msgContainerEl.classList.add(classType);

  msgEl.innerText = msg;
  msgContainerEl.classList.add('show');

  // clear
  setTimeout(() => {
    msgContainerEl.classList.remove('show');
    msgContainerEl.classList.remove(classType);
  }, timeout);
}
