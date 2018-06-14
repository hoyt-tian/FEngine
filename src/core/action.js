import { clone } from '../util';
import Frame from './frame';

class Action {
  constructor(config) {
    Object.assign(this, {
      base: null,
      name: null,
      start: 0,
      total: 0,
      suffix: 'png',
      current: 0,
      // frameRemainCounter: 0,
      loop: false,
      frames: [],
    }, clone(config));

    this.__load__ = false;
  }

  loadResources() {
    const promises = [];
    if (this.frames.length) {
      this.frames.forEach((f) => {
        promises.push(new Frame(f).loadResources());
      });
    } else {
      for (let i = this.start; i < this.total; i += 1) {
        promises.push(new Frame({
          imgUrl: `${this.base}/${i}.${this.suffix}`,
          redrawCount: this.frameDuration(i),
          audioUrl: (this.audio && this.audio[i]) || null,
        }).loadResources());
      }
    }
    return Promise.all(promises).then((frames) => {
      this.__load__ = true;
      this.total = this.frames.length;
      this.frames = frames;
      return new Promise(resolve => resolve(this));
    });
  }

  get currentFrame() {
    return this.frames[this.current];
  }

  reset() {
    this.current = 0;
  }

  frameDuration(frameIndex) {
    if (frameIndex < 0) return 0;
    if (this.duration instanceof Array) {
      return this.duration[frameIndex];
    } else if (typeof (this.duration) === 'number') {
      return Math.ceil((this.duration * 60) / (this.total * 1000));
    } else if (typeof (this.duration) === typeof ({})) {
      return this.duration[frameIndex] || 1;
    }
    return 1;
  }

  next(data, defaultLoop) {
    /**
         * 帧重绘
         */
    if (this.currentFrame.counter < this.currentFrame.redrawCount) {
      this.currentFrame.counter += 1;
      return this.current;
    }
    this.execute({
      ...data, action: this, frameIndex: this.current, frame: this.currentFrame,
    });
    const loop = defaultLoop || this.loop;
    if (loop === true) {
      this.current = (this.current + 1) % this.total;
    } else if (loop.start !== undefined && loop.end !== undefined) {
      if (this.current < this.loop.end || this.current > this.loop.end) {
        this.current += 1;
        if (this.current === this.total) {
          this.current = -1;
          return -1;
        }
      } else if (this.current === this.loop.end) {
        this.current = this.loop.start;
      }
    } else if (this.current < this.total - 1) {
      this.current += 1;
    } else {
      this.current = -1;
      return -1;
    }
    this.currentFrame.counter = 0;
    // this.frameRemainCounter = this.frameDuration(this.current)
    return this.current;
  }

  currentBlock(data) {
    if (this.currentFrame.counter === 0) {
      try {
        return this.currentFrame.currentBlock({ ...data, action: this });
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }

  execute(data) {
    try {
      this.currentFrame.execute({ ...data, frameIndex: this.current, frame: this.currentFrame });
    } catch (e) {
      console.error(e);
    }
  }

  toJSON() {
    const {
      __load__, __modified__, __keys__, current, ...rest
    } = this;
    return rest;
  }
}

export default Action;
