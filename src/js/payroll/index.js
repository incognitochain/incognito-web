import Swiper from 'swiper';

const handleScheduleDemo = container => {
  const scheduleButtons = container.querySelectorAll('#schedule-demo-btn');
  scheduleButtons.forEach(scheduleButton => {
    scheduleButton.addEventListener('click', function() {
      if (Calendly !== null) {
        Calendly.initPopupWidget({
          url: 'https://calendly.com/incognitodotorg/incognito-payroll'
        });
      }
    });
  });
};

const handleTestimonialSwiper = container => {
  const testimonialContainer = container.querySelector(
    '.testimonial-container'
  );
  if (!testimonialContainer) return;
  const swiperEl = testimonialContainer.querySelector('.swiper-container');
  if (!swiperEl) return;

  const nextBtnEl = swiperEl.querySelector('.swiper-btn-next');
  const prevBtnEl = swiperEl.querySelector('.swiper-btn-prev');

  new Swiper(swiperEl, {
    centeredSlides: true,
    slidesPerView: 1,
    breakpoints: {
      576: {
        slidesPerView: 2
      }
    },
    loop: true,
    watchOverflow: true,
    spaceBetween: 50,
    navigation: {
      nextEl: nextBtnEl,
      prevEl: prevBtnEl
    }
  });
};

const main = () => {
  const container = document.querySelector('#payroll-container');
  if (!container) return;

  handleScheduleDemo(container);
  handleTestimonialSwiper(container);
};

main();
