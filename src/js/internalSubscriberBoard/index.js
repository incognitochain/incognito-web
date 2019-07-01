import { getTotalSubscribe } from '../service/api';
import { setMessage } from '../service/message_box';

const container = document.querySelector('#internal-subscriber-board');
let currentSubscriberNum = 0;

const getSubscriber = async () => {
  try {
    if (!container) return;

    const countEl = container.querySelector('.count');
    const notiEl = container.querySelector('audio');
  
    const subscriberNum = await getTotalSubscribe();

    if (subscriberNum > currentSubscriberNum) {
      currentSubscriberNum = subscriberNum;

      countEl.innerText = Intl.NumberFormat().format(currentSubscriberNum);
      notiEl.play();
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
  startMonitor(4000);
};

main();