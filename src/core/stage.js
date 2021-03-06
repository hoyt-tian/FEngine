import Action from './action';
import { EventListener } from '../util';

export default class Stage {
  constructor(config) {
    Object.assign(this, {
      name: '未命名',
      url: null,
      audioUrl: null,
      frames: null,
    }, config, { loop: true });
    this.action = new Action(Object.assign({}, this));
  }

  loadResources() {
    if (this.audioUrl) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      EventListener.listen(audio, 'error', (err) => {
        this.audio = null;
        throw err;
      });
      audio.src = this.audioUrl;
      audio.autoplay = false;
      this.audio = audio;
    }
    return this.action.loadResources().then(() => new Promise((resolve) => {
      resolve(this);
    }));
  }

  get currentFrame() {
    return this.action.currentFrame;
  }

  next(loop = true) {
    return this.action.next(loop);
  }

  get width() {
    return this.currentFrame.image.width;
  }

  get height() {
    return this.currentFrame.image.height;
  }
}
