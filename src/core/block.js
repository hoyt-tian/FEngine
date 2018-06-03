export const BlockType = {
  attack: Symbol('attack'),
  defense: Symbol('defense'),
  target: Symbol('target')
}

export const HurtBlink = 1

class Block {

  constructor(data) {
    Object.assign(this, {
      type : BlockType.attack, 
      owner : null, 
      width : 0, 
      height : 0, 
      x : 0, 
      y : 0, 
      alive: true, 
      blink : 0, 
      hit: null,
      offset: {
        xf: -2,
        yf: 0, 
      },
    }, {...data})
    if (this.hit) {
      this.execute = new Function('data',this.hit)
    }
  }

  static hasIntersection(ba, bb) {
    let r = {
      left: Math.max(ba.x, bb.x),
      right: Math.min(ba.x + ba.width, bb.x + bb.width),
      top: Math.max(ba.y - ba.height, bb.y - bb.height),
      bottom: Math.min(ba.y, bb.y)
    }

    return (r.right > r.left) && (r.top < r.bottom)
  }

  static findTarget(ablock, tblocks) {
    for(let i = 0; i < tblocks.length; i++) {
      if (ablock.owner !== tblocks[i].owner) {
        if (Block.hasIntersection(ablock, tblocks[i])) {
          return tblocks[i]
        }
      }
    }
    return null
  }

  static addBlocks(block, blocks) {
      if (block === null || block === undefined) return
      if (block instanceof Array) {
          block.forEach(b => Block.addBlocks(b, blocks))
          return
      }else if(block instanceof Block) {
          blocks[block.type] = blocks[block.type] || []
          blocks[block.type].push(block)
      }
  }

  static blockColor(type) {
      switch(type) {
          case BlockType.attack: return 'red'
          case BlockType.target: return 'yellow'
          case BlockType.defense: return 'blue'
      }
  }

  toJSON() {
    const {owner, alive, ...rest} = this
    return rest
  }

}

export default Block