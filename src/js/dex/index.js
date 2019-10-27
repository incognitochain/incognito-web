import fit from '../common/utils/fit';
import { subscribe } from '../service/api';
import { setMessage } from '../service/message_box';

const handleResizeLeftImage = container => {
  const imageContainerEl = container.querySelector('.image .image-container');
  if (!imageContainerEl) return;
  const imageEl = imageContainerEl.querySelector('.desktop');
  fit(imageEl, imageContainerEl, {
    // Alignment
    hAlign: fit.CENTER, // or fit.LEFT, fit.RIGHT
    vAlign: fit.CENTER, // or fit.TOP, fit.BOTTOM
    cover: true,
    watch: true,
    apply: true
  });
};

const handleSubscribeForm = container => {
  const formContainerEl = container.querySelector('');
  if (!formContainerEl) return;
  const emailInputEl = formContainerEl.querySelector('');
  const submitBtnEl = formContainerEl.querySelector('');

  if (!emailInputEl || !submitBtnEl) return;

  const onSubmitBtnClicked = () => {
    const email = emailInputEl.value;
    try {
      subscribe(email, '', 'dex');
      setMessage('Your email has been subscribed!');
    } catch (e) {
      setMessage(e, 'error');
    }
  };

  submitBtnEl.addEventListener('click', onSubmitBtnClicked);
};

const main = () => {
  const container = document.querySelector('#dex-container');
  if (!container) return;
  handleResizeLeftImage(container);
  // handleSubscribeForm(container);
};

main();
