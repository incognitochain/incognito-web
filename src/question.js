const collapse = e => {
  const className = 'show-collapse';
  if (e.classList.contains(className)) {
    e.classList.remove(className);
  } else {
    e.classList.add(className);
  }
};

window.collapse = collapse;