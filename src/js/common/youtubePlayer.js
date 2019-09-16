import Popup from './popup';

class YoutubePlayer {
  constructor(url) {
    this.url = url;
    this.popupModal = new Popup();
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
  
  play() {
    if (!this.popupModal) return;
    const frame = this.createFrame();
    this.popupModal.showWithBodyContent(frame);
  }
}

export default YoutubePlayer;