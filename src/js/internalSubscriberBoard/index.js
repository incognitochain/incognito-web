import { getTotalSubscribe } from '../service/api';
import { setMessage } from '../service/message_box';

const container = document.querySelector('#internal-subscriber-board');
let currentSubscriberNum = 0;

const isSilient = (now) => {
  let silient = false;
  try {
    const h = now.getHours();
    const m = now.getMinutes();
    if (h === 12 || (h === 13 && m < 30)) { // silient from 12PM - 13:30
      return true;
    }
  } catch (e) {}

  return silient;
}

const getSubscriber = async () => {
  try {
    if (!container) return;

    const countEl = container.querySelector('.count');
    const notiEl = container.querySelector('audio');
  
    const subscriberNum = await getTotalSubscribe();

    if (subscriberNum > currentSubscriberNum) {
      currentSubscriberNum = subscriberNum;

      countEl.innerText = Intl.NumberFormat().format(currentSubscriberNum);

      if (!isSilient(new Date())) {
        notiEl.play();
      }
    }
  } catch (e) {
    setMessage(`Get subscriber with error: ${e.message}`, 'error', 10000);
  }
}

const startMonitor = (timeout) => {
  // first time
  getSubscriber();

  setInterval(getSubscriber, timeout);
}

const main = () => {
  startMonitor(30000);
};

main();