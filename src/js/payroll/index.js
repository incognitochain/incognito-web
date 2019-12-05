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

const main = () => {
  const container = document.querySelector('#payroll-container');
  if (!container) return;

  handleScheduleDemo(container);
};

main();
