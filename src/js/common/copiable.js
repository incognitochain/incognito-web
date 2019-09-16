import { setMessage } from '../service/message_box';
import { trackEvent } from './utils/ga';
/**
 * required class: '.copiable'
 * attr data: data-copy-value
 */

const copiable = e => {
  const text = e.getAttribute('data-copy-value');
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);

  // handle iOS as a special case
  if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {

    // save current contentEditable/readOnly status
    var editable = textArea.contentEditable;
    var readOnly = textArea.readOnly;

    // convert to editable with readonly to stop iOS keyboard opening
    textArea.contentEditable = true;
    textArea.readOnly = true;

    // create a selectable range
    var range = document.createRange();
    range.selectNodeContents(textArea);

    // select the range
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textArea.setSelectionRange(0, 999999);

    // restore contentEditable/readOnly to original state
    textArea.contentEditable = editable;
    textArea.readOnly = readOnly;
  } else {
    textArea.select();
  }

  try {
    var successful = document.execCommand('copy');
    if (successful) {
      setMessage('Copied', 'info');
      trackEvent({
        eventCategory: 'Copy data',
        eventAction: 'Copy data',
        eventLabel: `Copy ${text}`
      });
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
