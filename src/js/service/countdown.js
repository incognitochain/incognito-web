function calc(s, duration) {
	return [Math.floor(s/duration), s%duration];
}

const padZero = number => String(number).padStart(2, '0');

const getTime = timeInSecond => {
  const [days, s1] = calc(timeInSecond, 3600 * 24);
  const [hours, s2] = calc(s1, 3600);
  const [mins, seconds] = calc(s2, 60);

  return [padZero(days), padZero(hours), padZero(mins), padZero(seconds)];
}

const countdown = (deadline, onCount) => {
  const timer = setInterval(() => {
    const now = Date.now();
    const deadlineInSecond = new Date(deadline).getTime();
    const duration = Math.floor((deadlineInSecond - now)/1000);

    if (duration >= 0) {
      onCount(getTime(duration));
    } else {
      clearInterval(timer);
      onCount(false);
    }
  }, 500);
}

const isValidDate = date => {
  return !!new Date(date).getTime();
}

export default (el, deadline, onEnd) => {

  if (!el || !isValidDate(deadline)) return;

  const daysEl = el.querySelector('.days .data');
  const hoursEl = el.querySelector('.hours .data');
  const minsEl = el.querySelector('.mins .data');
  const secondsEl = el.querySelector('.seconds .data');

  if (deadline && daysEl && hoursEl && minsEl && secondsEl) {
    countdown(deadline, (data) => {
      if (!data) {
        onEnd();
      } else {
        const [ days, hours, mins, seconds ] = data;
        daysEl.innerText = days;
        hoursEl.innerText = hours;
        minsEl.innerText = mins;
        secondsEl.innerText = seconds;
      }
    });
  }
}
