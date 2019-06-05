import { setMessage } from '../service/message_box';
/**
 * required class: '.copiable'
 * attr data: data-copy-value
 */

const copiable = e => {
  const text = e.getAttribute('data-copy-value');
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    if (successful) {
      setMessage('Copied', 'info');
    }
  } catch (err) {
    setMessage('Copy failed', 'error');
  }

  document.body.removeChild(textArea);
};

const els = document.querySelectorAll('.copiable');

els && els.forEach(item => {
  const handleClick = () => copiable(item);
  item.addEventListener('click', handleClick);
});
