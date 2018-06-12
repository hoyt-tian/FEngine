import Action from './action'

export default class Stage {
  constructor(config) {
    Object.assign(this, {
      name: '未命名',
      url: null,
      audioUrl: null,
      frames: null,
    }, config, { loop: true})
    this.action = new Action(Object.assign({}, this))
  }

  loadResources() {
    return this.action.loadResources()
  }

  get currentFrame() {
    return this.action.currentFrame
  }

  next(loop = true) {
    return this.action.next(loop)
  }

  get width() {
    return this.currentFrame.image.width
  }

  get height() {
    return this.currentFrame.image.height
  }


}