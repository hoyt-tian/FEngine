import Action from './action'
import Block, {BlockType} from './block'

const sprites = {}

class Sprite {
  constructor(config) {
      Object.assign(this, {
          base: null,
          name: null,
          flip: false,
          x: 0,
          y: 0,
          speed: 1,
          action: {},
      }, config)

      this.action = new Action(Object.assign({}, this.action))
  }

  loadResources() {
    return this.action.loadResources()
  }

  get currentFrame() {
    return this.action.currentFrame
  }

  next(loop = true) {
    this.x += this.speed * (this.flip === true ? -1 : 1)
    return this.action.next(loop)
  }

  currentBlock(data) {
    return this.action.currentBlock({...data, instance: this, owner: this.owner})
  }

}

export default Sprite