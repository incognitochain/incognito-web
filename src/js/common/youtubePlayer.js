class YoutubePlayer {
  constructor(url) {
    this.url = url;
    this.popup = null;
  }

  createFrame() {
    const container = document.createElement('iframe');

    Object.entries(
      {
        width: '100%',
        height: '100%',
        src: `${this.url}?autoplay=1`,
        frameborder: 0,
        allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true,
      }
    ).forEach(([key, value]) => {
      container.setAttribute(String(key), String(value));
    });

    return container;
  }

  createPopup() {
    const popup = document.createElement('div');
    const closePopupBtn = document.createElement('button');

    popup.classList.add('video-player');
    closePopupBtn.classList.add('close-button');

    closePopupBtn.addEventListener('click', this.closePopup.bind(this));

    popup.appendChild(closePopupBtn);

    return popup;
  }

  closePopup() {
    document.body.removeChild(this.popup);
  }
  
  play() {
    const body = document.body;
    const popup = this.createPopup();
    const frame = this.createFrame();

    this.popup = popup;

    popup.appendChild(frame);
    body.appendChild(popup);
  }
}

export default YoutubePlayer;