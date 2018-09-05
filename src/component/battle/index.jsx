import React, { Component } from 'react';
import Joystick from 'react-svg-joystick';
import PropTypes from 'prop-types';
import { EventListener } from '../../util';
import Controller from '../../core/controller';
import Block, { BlockType } from '../../core/block';
import Player from '../../core/player';
import './index.less';
import Sprite from '../../core/sprite';
import HP from '../hp/index.jsx';
import SVGButton from '../svgbutton';
import Stage from '../../core/stage';
import Character from '../../core/character';

export const P1Keys = {
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

export const P2Keys = {
  0x26: 'w',
  0x28: 's',
  0x25: 'a',
  0x27: 'd',
  0x00: 'z',
  0x37: 'A',
  0x38: 'B',
  0x39: 'C',
  0x30: 'D',
};


class Battle extends Component {
  static pretty(keys) {
    return keys.replace(/z/g, '')
      .replace(/d/g, '→ ').replace(/a/g, '← ')
      .replace(/w/g, '↑')
      .replace(/s/g, '↓ ')
      .replace(/j/g, 'A');
  }

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    stage: PropTypes.instanceOf(Stage).isRequired,
    p1: PropTypes.instanceOf(Character).isRequired,
    p2: PropTypes.instanceOf(Character),
    style: PropTypes.object,
    useJoystick: PropTypes.bool,
    showP1HP: PropTypes.bool,
    showP2HP: PropTypes.bool,
    rotate: PropTypes.bool,
    showBlock: PropTypes.bool,
  }

  static defaultProps = {
    width: 1280,
    height: 720,
    p2: null,
    style: {},
    useJoystick: false,
    showP1HP: true,
    showP2HP: true,
    rotate: false,
    showBlock: false,
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      showBlock: !!props.showBlock,
      p1hp: 0,
      p1hpMax: 0,
      p2hp: 0,
      p2hpMax: 0,
      stage: props.stage,
    };
    this.width = this.props.width || 1280;
    this.height = this.props.height || 720;
    this.viewbox = {
      width: this.width,
      height: this.height,
      availiableHeight: this.height - this.state.stage.horizontalOffset,
      left: (this.state.stage.width - this.width) / 2,
    };
    this.items = [];

    this.p1 = new Player(this.props.p1, new Controller(this.props.p1));
    this.state.p1hp = this.p1.hp;
    this.state.p1hpMax = this.p1.hp;

    if (this.props.p2) {
      this.p2 = new Player(this.props.p2, new Controller(this.props.p2));
      this.state.p2hp = this.p2.hp;
      this.state.p2hpMax = this.p2.hp;
      this.place(this.p2.character);
      this.p2.character.x = this.viewbox.left + (this.width * 0.618);
      this.p2.setFlip(true);
    }


    // this.p1.character.flip = true
    this.place(this.p1.character);
    this.p1.character.x = this.viewbox.left + (this.width * 0.382);
    this.bg = null;
  }

  componentDidMount() {
    this.timer = requestAnimationFrame(this.redraw);
    EventListener.listen(document, 'keydown', this.keyDown);
    EventListener.listen(document, 'keyup', this.keyUp);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.timer);
    this.timer = null;
  }

    setBg = (bg) => {
      this.bg = bg;
    }

    setTransform = () => {
    }

    getPlayerInput = (keyEvent) => {
      if (keyEvent.keyCode in P1Keys) {
        return { player: this.p1, key: P1Keys[keyEvent.keyCode] };
      } else if (keyEvent.keyCode in P2Keys) {
        return { player: this.p2, key: P2Keys[keyEvent.keyCode] };
      }
      return {};
    }

    clearBg = () => {
      this.setBg(null);
    }

    redraw = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.state.stage) {
        this.ctx.save();
        // this.setTransform()
        this.ctx.drawImage(
          this.state.stage.currentFrame.image,
          this.viewbox.left,
          0,
          this.width,
          this.height,
          0,
          0,
          this.width,
          this.height,
        );
        this.ctx.restore();
        this.state.stage.next();
      }

      if (this.bg) {
        this.ctx.save();
        this.setTransform();
        this.ctx.fillStyle = this.bg;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      }
      this.updateFlip(this.p1, this.p2);
      this.p1.controller.work(this);
      if (this.p2) {
        this.p2.controller.work(this);
      }
      /*
      this.setState({
        keys: this.pretty(this.p1.controller.getStr()),
        holds: this.p1.controller.keys,
      });
      */
      this.blockDetect();
      this.items.forEach((item) => {
        this.ctx.save();
        this.ctx.scale(item.flip === true ? -1 : 1, 1);
        this.ctx.drawImage(
          item.currentFrame.image,
          item.flip ? -item.x + this.viewbox.left : item.x - this.viewbox.left,
          (item.y - item.currentFrame.image.height) || 0,
        );
        this.ctx.restore();
        item.next({ battle: this });
      });


      if (this.p1) {
        this.fixPos(this.p1.character);
      }
      if (this.p2) {
        this.fixPos(this.p2.character);
      }

      this.items = this.items.filter(item => (item.x >= 0) && (item.x <= this.state.stage.width));
      if (this.p1 && this.p2) {
        const b1 = this.p1.character.box();
        const b2 = this.p2.character.box();
        const left = b1.x < b2.x ? b1.x : b2.x;
        const right = b1.x + b1.width < b2.x + b2.width ? b2.x + b2.width : b1.x + b1.width;
        const mid = (left + right) / 2;
        this.viewbox.left = mid + (-this.width / 2);
        if (this.viewbox.left < 0) {
          this.viewbox.left = 0;
        } else if (this.viewbox.left + this.width > this.state.stage.width) {
          this.viewbox.left = this.state.stage.width - this.width;
        }
      }
      this.timer = requestAnimationFrame(this.redraw);
    }

    updateFlip = (p1, p2) => {
      if (p1 && p2) {
        const b1 = p1.character.box();
        const b2 = p2.character.box();

        if (p1.character.flip === false) {
          if (b1.x > b2.x) {
            p1.setFlip(true);
            p2.setFlip(false);
          }
        } else if (b2.x > b1.x + b1.width) {
          p1.setFlip(false);
          p2.setFlip(true);
        }

        // p1.controller.setFlip(flip, p2.controller)
      }
    }

    addToStage = (item) => {
      if (this.items.indexOf(item) < 0) this.items.push(item);
    }

    place(character) {
      character.y = this.viewbox.availiableHeight;
      this.addToStage(character);
    }

    attachCanvas = (el) => {
      if (el) {
        this.canvas = el;
        this.ctx = el.getContext('2d');
      }
    }


    keyDown = (event) => {
      const { key, player } = this.getPlayerInput(event);
      if (key && player) {
        const vkey = player.controller.fixVkey(key);
        if (vkey) {
          player.controller.hold(vkey);
          player.controller.enqueue(vkey);
        }
      }
    }

    keyUp = (event) => {
      const { key, player } = this.getPlayerInput(event);
      if (key && player) {
        player.controller.enqueue('z');
        const vkey = player.controller.fixVkey(key);
        player.controller.release(vkey);
      }
    }

    joyStickDown = (vk) => {
      const nk = this.p1.controller.fixVkey(vk);
      if (nk) {
        this.p1.controller.hold(nk);
        this.p1.controller.enqueue(nk);
      }
    }

    joyStickUp = (vk) => {
      this.p1.controller.enqueue('z');
      const nk = this.p1.controller.fixVkey(vk);
      this.p1.controller.release(nk);
    }

    fixPos(character) {
      if (character.x < 0) character.x = 0;
      else if (character.x > this.state.stage.width) character.x = this.state.stage.width;
    }

    blockDetect() {
      const blocks = {};
      Object.values(BlockType).forEach((v) => {
        blocks[v] = [];
      });

      this.items.forEach((item) => {
        if (item.currentBlock) {
          Block.addBlocks(item.currentBlock({ battle: this }), blocks);
        }
      });

      blocks[BlockType.attack].forEach((att) => {
        const r = Block.findTarget(att, blocks[BlockType.target]);
        if (r) {
          // 查看是否有防御块，若有，将两者置为不可用
          // console.log('meet target')
          if (att.alive && att.source !== r.owner && r.owner.blink === 0) {
            // 执行攻击效果
            att.alive = false;
            r.alive = false;
            r.owner.setStatus(att.damage || 'hm');

            const hp = r.owner.owner === this.p1 ? 'p1hp' : 'p2hp';
            const val = {};
            val[hp] = r.owner.owner.hurt(att.damageValue || 2);
            if (att.offset.xf || att.offset.yf) {
              r.owner.move(r.owner.speed * att.offset.xf);
            }
            if (att.execute) {
              att.execute({
                att,
                tgt: r,
              });
            }
            this.setState(val);
            r.owner.blink = att.blink;
            if (att.owner instanceof Sprite) {
              att.owner.x = 10000;
            }
            // console.log(`${att.source.name} att ${r.owner.name}`)
          }
        }
      });

      if (this.state.showBlock) {
        Object.values(BlockType).forEach((t) => {
          blocks[t].forEach((b) => {
            if (b.alive) {
              this.ctx.save();
              this.ctx.scale(b.flip ? -1 : 1, 1);
              this.ctx.strokeStyle = Block.blockColor(b.type);
              this.ctx.strokeRect(
                b.flip ? (-b.x - b.width) + this.viewbox.left : b.x - this.viewbox.left,
                b.y - b.height,
                b.width,
                b.height,
              );
              this.ctx.restore();
            }
          });
        });
      }

      // clear useless block
    }

    toggleMusic = (val) => {
      if (val) {
        if (this.props.stage.audio) {
          this.props.stage.audio.play();
        }
      } else if (this.props.stage.audio) {
        this.props.stage.audio.pause();
      }
    }

    render() {
      return (
        <section className={this.props.rotate ? 'battle rotate' : 'battle'} style={this.props.style}>
          <section className="battle-body">
            <section>
              <section className="topbar">
                {this.p1
                && this.props.showP1HP
                && <HP
                  max={this.state.p1hpMax}
                  val={this.state.p1hp}
                  width={300}
                  height={30}
                />}
                {this.p2 && this.props.showP2HP && <HP
                  max={this.state.p2hpMax}
                  val={this.state.p2hp}
                  flip
                  width={300}
                  height={30}
                />}
              </section>
              <canvas width={this.width} height={this.height} ref={this.attachCanvas} />
            </section>
            <section className="icons">
              <SVGButton src="./assets/music.svg" onChange={this.toggleMusic} toggled={false} />
              <SVGButton src="./assets/joystick.svg" onChange={() => {}} toggled={false} />
            </section>
          </section>
          {this.props.useJoystick && <section className="ja"><Joystick onKeyPress={this.joyStickDown} onKeyRelease={this.joyStickUp} /></section>}
        </section>);
    }
}

export default Battle;
