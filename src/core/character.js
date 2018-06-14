import Action from './action';
import Sprite from './sprite';
import Block, { BlockType } from './block';

export const Status = {
  stand: Symbol('站立'),
  walk: Symbol('行走'),
  back: Symbol('后退'),
  run: Symbol('奔跑'),
  defense: Symbol('防御'),
  tumble: Symbol('跌倒'),
  lk: Symbol('轻脚'),
  lp: Symbol('轻拳'),
  hk: Symbol('重脚'),
  hp: Symbol('重拳'),
  jump: Symbol('跳跃'),
  squat: Symbol('蹲下'),
};

class Character {
  constructor(cfg) {
    const config = JSON.parse(JSON.stringify(cfg));
    Object.assign(this, {
      base: null,
      name: '未命名',
      actions: {},
      status: 'stand',
      index: 0,
      jump: 30,
      x: 0,
      y: 0,
      flip: false,
      owner: this,
      blink: 0,
      _config: config,
    }, config);

    Object.keys(this.actions).forEach((k) => {
      const v = this.actions[k];
      this.actions[k] = new Action(Object.assign({}, v, {
        base: v.base ? v.base : `${config.base}${k}`,
        name: v.name || k,
      }));
    });

    /*
        Object.keys(this.motion).forEach(k => {
            this.motion[k] =
        })
        */

    Object.keys(this.specialActions).forEach((k) => {
      this.actions[k] = new Action(Object.assign({}, this.specialActions[k], {
        base: `${config.base}${k}`,
        name: this.specialActions[k].name || k,
      }));

      this.actions[k].__keys__ = new RegExp(this.specialActions[k].keys);
      // this.actions[k].execute = new Function('data', this.specialActions[k].execute)
    });

    Object.keys(this.sprites).forEach((sk) => {
      this.sprites[sk] = new Sprite(Object.assign(this.sprites[sk], {
        base: `${this.base}/${sk}/`,
        name: `${sk}`,
      }));
    });
  }

  loadResources() {
    const ps = [];
    Object.values(this.actions).forEach((action) => {
      const p = action.loadResources();
      ps.push(p);
    });

    Object.values(this.sprites).forEach((sprite) => {
      ps.push(sprite.loadResources());
    });
    return Promise.all(ps);
  }

  get currentFrame() {
    if (this.currentAction) {
      const frame = this.currentAction.currentFrame;
      if (!frame) {
        console.error('should not come to here in fact');
        this.setStatus('stand');
        return this.currentAction.currentFrame;
      }
      return frame;
    }
    throw new Error(`${this.status} not defined`);
  }

  get currentAction() {
    return this.actions[this.status];
  }

  next(data, loop = false) {
    const prev = this.currentAction;
    const ret = this.currentAction.next({
      ...data, character: this, player: this.owner, controller: this.owner.controller,
    }, loop);
    if (ret === -1) {
      this.setStatus(prev.nextStatus || 'stand');
    }
  }

  box() {
    const ret = {
      x: this.x,
      y: this.y,
      width: this.currentFrame.image.width,
      height: this.currentFrame.image.height,
    };
    if (this.flip) ret.x -= ret.width;
    return ret;
  }

  setFlip(flip) {
    this.flip = flip;
    if (flip) {
      this.x = this.x + this.currentFrame.image.width;
    } else {
      this.x = this.x - this.currentFrame.image.width;
    }
    this.setStatus('stand');
  }


  static fetchAll() {
    return fetch('./assets/character/index.json')
      .then(response => response.json())
      .then((data) => {
        const ps = [];
        data.characters.forEach((ch) => {
          ps.push(new Promise((resolve, reject) => {
            fetch(`./assets/character/${ch}/index.json`)
              .then(resp => resp.json())
              .then((cfg) => {
                const c = new Character(Object.assign(cfg, {
                  base: `./assets/character/${ch}/`,
                }));
                return c.loadResources().then(() => resolve(c));
              }, e => reject(e))
              .catch(e => reject(e));
          }));
        });
        return Promise.all(ps);
      });
  }

  setStatus(status, force = false) {
    if (force === false) {
      if (this.currentAction.cancelable === false && this.currentAction.current !== -1) {
        return;
      }

      if (this.status !== status) {
        const current = this.currentAction;
        this.status = status;
        current.reset();
      }
    } else {
      const current = this.currentAction;
      this.status = status;
      current.reset();
    }
  }

  getSprite(name) {
    const sprite = this.sprites[name];
    if (sprite) {
      sprite.flip = this.flip;
      sprite.x = this.x;
      sprite.y = this.y;
      sprite.owner = this;
    }
    return sprite;
  }

  currentBlock(data) {
    let blocks = [];
    const box = this.box();
    const target = new Block({
      type: BlockType.target,
      owner: this,
      width: box.width,
      height: box.height,
      x: box.x,
      y: box.y,
    });
    blocks.push(target);
    try {
      const ablock = this.currentAction.currentBlock({
        ...data,
        instance: this,
        owner: this.owner,
      });
      if (ablock instanceof Block) {
        blocks.push(ablock);
      } else if (ablock instanceof Array) {
        blocks = blocks.concat(ablock);
      }
    } catch (e) {
      console.error('character current Block error');
    }
    blocks.forEach((b) => {
      b.flip = this.flip;
    });
    return blocks;
  }

  doAction(controller, battle) {
    if (this.currentAction.currentFrame.counter === 0 && this.blink) {
      this.blink -= 1;
    }
    switch (this.status) {
      case 'walk':
        // this.x += this.speed * (this.flip ? -1 : 1)
        this.move();
        break;
      case 'back':
        this.move(-this.speed);
        // this.x -= this.flip ? -this.speed : this.speed
        break;
      case 'run':
        this.move(this.speed * 2);
        // this.x += (this.flip ? -this.speed : this.speed) * 2
        break;
      case 'jump':
        {
          const offy = -(Math.sin(Math.PI * (
            (this.currentAction.current +
                (this.currentFrame.counter / 10)) / this.currentAction.total
          )) * this.jump) / 5;
          if (controller) {
            if (controller.keys.d) {
              this.move(this.speed, offy);
            } else if (controller.keys.a) {
              this.move(-this.speed, offy);
            } else {
              this.move(0, offy);
            }
          } else {
            this.move(0, offy);
          }
        }
        break;
      case 'slipback':
        if (this.currentAction.current >= 4 && this.currentAction.current <= 11) {
          this.move(this.speed * -5);
        }
        break;
      case 'lp':
        if (this.currentAction.current) { break; }
        break;
      case 'hm':
        /*
                if (this.currentAction.current === 1) {
                    // this.x += (this.flip ? this.speed : -this.speed) * 2
                    this.move(this.speed * -2)
                } */
        break;
      case 'drop':
        if (this.currentAction.current === 0) {
          this.move(-this.speed * 4, -this.jump / 10);
        } else if (this.currentAction.loop && this.currentAction.loop.start
                    && this.currentAction.loop.end
                    && this.currentAction.current >= this.currentAction.loop.start
                    && this.currentAction.current <= this.currentAction.loop.end
        ) {
          if (this.y < battle.height) {
            this.move(-this.speed * 4, this.jump / 5);
          } else {
            this.y = battle.height;
            this.currentAction.current = this.currentAction.loop.end + 1;
          }
        } else {
          this.move(-this.speed);
        }
        break;
      case 'fall':
        if (this.currentAction.loop && this.currentAction.loop.start
                    && this.currentAction.loop.end
                    && this.currentAction.current >= this.currentAction.loop.start
                    && this.currentAction.current <= this.currentAction.loop.end
        ) {
          if (this.y < battle.height) {
            const offy = this.jump / 10;
            if (controller) {
              if (controller.keys.d) {
                this.move(this.speed, offy);
              } else if (controller.keys.a) {
                this.move(-this.speed, offy);
              } else {
                this.move(0, offy);
              }
            } else {
              this.move(0, offy);
            }
          } else {
            this.y = battle.height;
            this.currentAction.current = this.currentAction.loop.end + 1;
          }
        }
        break;
      case 'getup':
        this.y = battle.height;
        break;
      case 'jlp':
        if (this.currentAction.loop && this.currentAction.loop.start
                    && this.currentAction.loop.end
                    && this.currentAction.current >= this.currentAction.loop.start
                    && this.currentAction.current <= this.currentAction.loop.end
        ) {
          const speed = controller.keys.d ? this.speed : (controller.keys.a ? -this.speed : 0);
          if (this.y < battle.height) {
            this.move(speed, this.jump / 5);
          } else {
            this.y = battle.height;
            this.setStatus('stand', true);
          }
        } else {
          this.move(0, this.jump / 20);
        }
        break;
      default:
        break;
    }
  }

  move(ox = this.speed, oy = 0) {
    this.x += ox * (this.flip ? -1 : 1);
    this.y += oy;
    if (this.x < 0) this.x = 0;
  }

  toJSON() {
    const {
      status, owner, _config, index, x, y, flip, base, ...rest
    } = this;
    const baseActions = ['stand', 'walk', 'back', 'run', 'squat', 'jump', 'slipback', 'lp', 'lk', 'hp', 'hk', 'hm', 'drop', 'getup', 'jlp'];
    const baseAction = {};
    baseActions.forEach((k) => {
      baseAction[k] = this.actions[k];
    });
    rest.actions = baseAction;
    return rest;
  }
}

export default Character;
