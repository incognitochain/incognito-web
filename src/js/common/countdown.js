/**
 * required class: '.countdown-timer'
 * attr: data-deadline (ISO time (timezone = 0))
 */

function calc(s, duration) {
	return [Math.floor(s/duration), s%duration];
}

const getTime = timeInSecond => {
  const [days, s1] = calc(timeInSecond, 3600 * 24);
  const [hours, s2] = calc(s1, 3600);
  const [mins, seconds] = calc(s2, 60);

  return [days, hours, mins, seconds];
}

const main = () => {
  const els = document.querySelectorAll('.countdown-timer');

  els.forEach(el => {
    const deadline = el.getAttribute('data-deadline');
    const [days, hours, mins, seconds] = getTime(new Date(deadline).getTime());

    
  })
}