const body = document.body;

const createNewModal = (title, content) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class='modal-container'>
      <div class='modal-header'>
        <span>${title}</span>
        <button class='close'>X</button>
      </div>
      <div class='modal-content'></div>
    </div>
    <div class='modal-overlay'></div>
  `;

  const modalContentEl = modal.querySelector('.modal-content');
  modalContentEl.appendChild(content);

  return modal;
}


export const closeModal = modal => {
  modal && body.removeChild(modal);
}

export const openModal = (title, content) => {
  const modal = createNewModal(title, content);
  const closeEl = modal.querySelector('.close');

  closeEl.addEventListener('click', () => closeModal(modal));

  body.appendChild(modal);

  return modal;
}
