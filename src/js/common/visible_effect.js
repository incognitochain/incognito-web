/**
 * required class: 'visible-effect'
 */

// intersectionobserver polyfill
require('intersection-observer');

const visible = () => {
  var intersectionObserver = new IntersectionObserver(function(entries) {
    // If intersectionRatio is 0, the target is out of view
    // and we do not need to do anything.
    const entry = entries[0];
    const target = entry.target;
    const classAni = 'bounceInUp-ani';

    if (entry.intersectionRatio <= 0) {
      return;
    };
  
    if (!target.classList.contains(classAni)) {
      target.classList.add(classAni);
    }
  });

  // start observing
  document.querySelectorAll('.visible-effect').forEach(item => intersectionObserver.observe(item));
}

visible();