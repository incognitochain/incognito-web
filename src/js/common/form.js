export const handleSelectElementChanged = (element, onChange) => {
  element.addEventListener('blur', onChange);
  element.addEventListener('change', onChange);
};

export const handleInputChange = input => {
  const hasValueClass = 'has-value';
  input.addEventListener('input', function() {
    const wrapper = this.parentNode;
    const value = this.value.trim();

    const previousSibling = this.previousSibling;
    if (previousSibling.tagName === 'LABEL' && wrapper) {
      if (value && value.length > 0) wrapper.classList.add(hasValueClass);
      else wrapper.classList.remove(hasValueClass);
    }
  });
};
