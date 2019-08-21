import isPathname from '../common/utils/isPathname';
import randomPopup from './random_popup';


function main() {
  if (!isPathname('/')) {
    return;
  }

  randomPopup();
}

// main();