
export const VKeys = {
  0x57: 'w',
  0x53: 's',
  0x41: 'a',
  0x44: 'd',
  0x00: 'z',
  0x4A: 'A',
  0x4B: 'B',
  0x4C: 'C',
  0xBA: 'D',
};

export const keyCodeConversion = keyCode => VKeys[keyCode];

const AliveCounter = 15;

class Controller {
  constructor(character) {
    Object.assign(this, {
      motion: {
        walk: /^d+$/,
        run: /^d+zd+$/,
        back: /^a+$/,
        squat: /^s+$/,
        jump: /^[adz]*w+$/,
        slipback: /^aza$/,
        lp: /^A$/,
        lk: /^B$/,
        hp: /^C$/,
        hk: /^D$/,
      },
      keys: {},
    });
    Controller.applyMotion(this.motion, character);
    this.queue = new Array(20);
    this.clear();
    this.character = character;
    // this.timer = setTimeout(this.clearBuffer, InputClearInterval)
  }

  static applyMotion(data, character) {
    const motion = data;
    Object.keys(character.specialActions).forEach((k) => {
      motion[k] = character.actions[k].__keys__;
    });
  }

  hold(vkey) {
    this.keys[vkey] = true;
    // console.log(`hold ${JSON.stringify(this.keys)}`)
  }

  release(vkey) {
    this.keys[vkey] = false;
    // console.log(`release ${JSON.stringify(this.keys)}`)
  }

  fixVkey(vkey) {
    if (this.character.flip === true) {
      if (vkey === 'd') return 'a';
      if (vkey === 'a') return 'd';
    }
    return vkey;
  }

  enqueue(vkey) {
    this.queue[this.end] = {
      key: vkey,
      counter: AliveCounter,
    };
    this.end = (this.end + 1) % this.queue.length;
  }

  clear() {
    this.queue.fill(null);
    this.start = 0;
    this.end = 0;
  }

  work(battle) {
    Object.keys(this.keys).forEach((k) => {
      if (this.keys[k] && this.getStr() === '') {
        this.enqueue(k);
      }
    });
    const originStatus = this.character.status;
    if (this.start !== this.end) {
      for (let i = this.start; i !== this.end;) {
        if (this.queue[i] === null || (this.queue[i].counter === 0)) {
          this.queue[i] = null;
          this.start = (i + 1) % this.queue.length;
          i = this.start;
        } else if (this.queue[i].counter) {
          this.queue[i].counter -= 1;
          i = (i + 1) % this.queue.length;
        }
      }
      let motion = null;
      switch (this.character.status) {
        case 'run':
        case 'walk':
          motion = this.getMotion();
          if (motion === 'run' && this.character.status === 'walk') {
            this.character.setStatus(motion);
          } else if (this.keys.w === true) {
            this.character.setStatus('jump');
          } else if (this.keys.d === true) {
            this.character.setStatus(this.character.status);
          } else {
            this.character.setStatus('stand');
          }
          break;
        case 'squat':
          if (this.keys.s === true) {
            this.character.setStatus(this.character.status);
          } else {
            this.character.setStatus('stand');
          }
          break;
        case 'back':
          if (this.keys.w === true) {
            this.character.setStatus('jump');
          } else if (this.keys.a === true) {
            this.character.setStatus(this.character.status);
          } else {
            this.character.setStatus('stand');
          }
          break;
        case 'jump':
        case 'fall':
          motion = this.getMotion();
          switch (motion) {
            case 'lp':
              this.character.setStatus('jlp', true);
              // console.log('light punch when jump');
              break;
            case 'lk':
              // console.log('light kick when jump');
              break;
            case 'hp':
              // console.log('heavy punch when jump');
              break;
            case 'hk':
              // console.log('heavy kick when jump');
              break;
            default:
              break;
          }
          break;
        default:
          motion = this.getMotion();
          if (motion && motion !== this.character.status) {
            if (
              (motion === 'run' && this.keys.d === true) ||
                  (motion === 'walk' && this.keys.d === true) ||
                  (motion === 'back' && this.keys.a === true) ||
                  (motion === 'squat' && this.keys.s === true)
            ) {
              // keep motion
            } else {
              this.clear();
            }
            this.character.setStatus(motion);
          }
      }
    } else {
      // console.log('stand up')
      this.character.setStatus('stand');
    }

    this.character.doAction(this, battle, originStatus);
    // this.timer = setTimeout(this.clearBuffer, InputClearInterval)
  }

  setFlip() {
    const target = 'd';
    const replace = 'a';

    for (let i = this.start; i !== this.end; i = (i + 1) % this.queue.length) {
      if (this.queue[i]) {
        if (this.queue[i].key === target && this.queue[i].counter) {
          this.queue[i].key = replace;
        }
      }
    }

    if (this.keys[target]) {
      this.keys[target] = false;
      this.keys[replace] = true;
    }
  }

  getStr() {
    const ret = [];
    for (let i = this.start; i !== this.end; i = (i + 1) % this.queue.length) {
      if (this.queue[i] && this.queue[i].counter) {
        ret.push(this.queue[i].key);
      }
    }
    return ret.join('');
  }

  getMotion() {
    const str = this.getStr();
    const keys = Object.keys(this.motion);
    for (let i = 0; i < keys.length; i += 1) {
      if (this.motion[keys[i]].test(str)) {
        // console.log(`compare ${str} and lead to ${keys[i]}`)
        return keys[i];
      }
    }
    return null;
  }
}

export default Controller;
