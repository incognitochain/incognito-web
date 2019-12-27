import countdown from '@/js/service/countdown';
import store from '@/js/service/store';

const DEAD_LINE = '2020-01-18T02:00:00.000Z';

function main() {
  window.addEventListener('load', () => {
    const countdownEl = document.querySelector('.countdown');
    countdown(countdownEl, DEAD_LINE);
    store();
  });
}

main();
