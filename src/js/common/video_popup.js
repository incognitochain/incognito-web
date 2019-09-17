class VideoPopup {
    constructor() {
        this.popup = document.querySelector('.video-popup');

        if (!this.popup) 
        return; 

        const closePopupBtn = this.popup.querySelector('.close-button');

        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', this.hide.bind(this));
        }

        this.modalContent = this.popup.querySelector('.content');

        if (!this.modalContent) return;
    }

    addBodyContent(content) {
        if (!this.modalContent) return;
        this.modalContent.appendChild(content);
    }

    clearBodyContent() {
        if (!this.modalContent) return;
        this.modalContent.innerHTML = '';
    }

    show() {
        if (!this.popup) return;
        this.popup.classList.remove('hide');
    }

    showWithBodyContent(content) {
        this.addBodyContent(content);
        this.show();
    }

    hide() {
        if (!this.popup) return;
        this.popup.classList.add('hide');
        this.clearBodyContent();
    }
}

export default VideoPopup;