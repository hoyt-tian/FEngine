import React, { Component } from 'react'
import { EventListener } from '../../util'
import Controller, { keyCodeConversion } from '../../core/controller'
import Block, {BlockType} from '../../core/block'
import Player from '../../core/player'
import './index.less'
import Sprite from '../../core/sprite'
import HP from '../hp/index.jsx'

class Battle extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            lastFrameTime: null,
            keys: '',
            showBlock: false,
            p1hp: 0,
            p1hpMax: 0,
            p2hp: 0,
            p2hpMax: 0,
            stage: props.stage
        }

        this.width = this.props.width || 800
        this.height = this.props.height || 600
        this.viewbox = {
            width: this.width,
            height: this.height,
            availiableHeight: this.height - this.state.stage.horizontalOffset,
            left: (this.state.stage.width - this.width) >> 1,
        }
        this.items = []

        this.p1 = new Player(this.props.character || this.props.p1, new Controller(this.props.character || this.props.p1))
        this.state.p1hp = this.state.p1hpMax = this.p1.hp

        if(this.props.p2) {
            this.p2 = new Player(this.props.p2, new Controller(this.props.p2) )
            this.state.p2hp = this.state.p2hpMax = this.p2.hp
            this.place(this.p2.character)
            this.p2.character.x = this.viewbox.left + this.width * 0.618
            this.p2.setFlip(true)
        }
        

        // this.p1.character.flip = true
        this.place(this.p1.character)
        this.p1.character.x = this.viewbox.left + this.width * 0.382
        this.bg = null
    }

    setBg = (bg) => {
        this.bg = bg
    }

    clearBg = () => this.setBg(null)

    addToStage = (item) => {
        if(this.items.indexOf(item) < 0) this.items.push(item)
    }

    place(character) {
        character.y = this.viewbox.availiableHeight
        this.addToStage(character)
    }

    attachCanvas = (el) => {
        if (el) {
            this.canvas = el
            this.ctx = el.getContext('2d')
        }
    }

    pretty(keys) {
        return keys.replace(/z/g,"")
        .replace(/d/g, '→ ').replace(/a/g, '← ')
        .replace(/w/g, '↑').replace(/s/g, '↓ ')
        .replace(/j/g, 'A')
    }



    blockDetect() {
        let blocks = {}
        Object.values(BlockType).forEach(v => blocks[v] = [])

        this.items.forEach(item => {
            if (item.currentBlock) {
                Block.addBlocks(item.currentBlock({battle: this}), blocks)
            }
        })

        blocks[BlockType.attack].forEach( att => {
            let r = Block.findTarget(att, blocks[BlockType.target])
            if (r) {
                // 查看是否有防御块，若有，将两者置为不可用
                // console.log('meet target')
                if (att.alive && att.source !== r.owner  && r.owner.blink === 0) {
                    // 执行攻击效果
                    att.alive = r.alive = false
                    r.owner.setStatus(att.damage || 'hm')
                   
                    let hp = r.owner.owner === this.p1 ? 'p1hp': 'p2hp'
                    let val = {}
                    val[hp] =  r.owner.owner.hurt(att.damageValue || 2)
                    if (att.offset.xf || att.offset.yf) {
                        r.owner.move(r.owner.speed * att.offset.xf)
                    }
                    if(att.execute) {
                        att.execute({
                            att,
                            tgt: r,
                        })
                    }
                    this.setState(val)
                    r.owner.blink = att.blink
                    if (att.owner instanceof Sprite) {
                        att.owner.x = 10000
                    }
                    // console.log(`${att.source.name} att ${r.owner.name}`)
                }
            }
        })

        if(this.state.showBlock) {
            Object.values(BlockType).forEach(t => {
                blocks[t].forEach(b => {
                    if (b.alive) {
                        this.ctx.save()
                        this.ctx.scale(b.flip ? -1 : 1, 1)
                        this.ctx.strokeStyle = Block.blockColor(b.type)
                        this.ctx.strokeRect(b.flip ? -b.x-b.width + this.viewbox.left : b.x - this.viewbox.left, b.y - b.height, b.width, b.height)
                        this.ctx.restore()
                    }
                })
            })
        }

        // clear useless block
    }

    fixPos(character) {
        if (character.x < 0) character.x = 0
        else if (character.x > this.state.stage.width) character.x = this.state.stage.width
    }

    redraw = (timestamp) => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)


        if (this.state.stage) {
            this.ctx.save()
            this.ctx.drawImage(
                this.state.stage.currentFrame.image,
                this.viewbox.left,
                0,
                this.width,
                this.height,
                0,
                0,
                this.width,
                this.height
            )
            this.ctx.restore()
            this.state.stage.next()
        }

        if(this.bg) {
            this.ctx.save()
            this.ctx.fillStyle = this.bg
            this.ctx.fillRect(0, 0, this.width, this.height)
            this.ctx.restore()
        }
        this.updateFlip(this.p1, this.p2)
        this.p1.controller.work(this)
        this.p2 && this.p2.controller.work(this)
        this.setState({
            keys: this.pretty(this.p1.controller.getStr()),
            holds: this.p1.controller.keys
        })
        this.blockDetect()
        this.items.forEach( item => {
            this.ctx.save()
            this.ctx.scale( item.flip === true ? -1 : 1, 1)
            this.ctx.drawImage(
                item.currentFrame.image,
                item.flip ? -item.x + this.viewbox.left : item.x - this.viewbox.left, 
                (item.y - item.currentFrame.image.height ) || 0
            )
            this.ctx.restore()
            item.next({battle: this})
        })       
        
        
        this.p1 && this.fixPos( this.p1.character)
        this.p2 && this.fixPos( this.p2.character)

        this.items = this.items.filter(item =>  (item.x >= 0) && (item.x <= this.state.stage.width) )
        if (this.p1 && this.p2) {
            const b1 = this.p1.character.box()
            const b2 = this.p2.character.box()
            const left = b1.x < b2.x ? b1.x : b2.x
            const right = b1.x+b1.width  < b2.x+b2.width ? b2.x+b2.width : b1.x+b1.width
            const mid = (left + right) / 2
            this.viewbox.left = mid - this.width/2
            if (this.viewbox.left < 0) {
                this.viewbox.left = 0
            } else if (this.viewbox.left + this.width > this.state.stage.width) {
                this.viewbox.left = this.state.stage.width - this.width
            }
        }
        this.timer = requestAnimationFrame(this.redraw) 
    }

    updateFlip = (p1, p2) => {
       
        if (p1 && p2 ) {
            const c1 = p1.character
            const c2 = p2.character

            const b1 = p1.character.box()
            const b2 = p2.character.box()

            if (p1.character.flip === false) {
                if (b1.x > b2.x) {
                    p1.setFlip(true)
                    p2.setFlip(false)
                }
            } else {
                if (b2.x > b1.x + b1.width) {
                    p1.setFlip(false)
                    p2.setFlip(true)
                }
            }
            
            // p1.controller.setFlip(flip, p2.controller)
        }        
    }


    keyDown = (event) => {
        let vkey = keyCodeConversion(event.keyCode)
        vkey = this.p1.controller.fixVkey(vkey)
        if (vkey) {
            this.p1.controller.hold(vkey)
            this.p1.controller.enqueue(vkey)
        }
    }

    keyUp = (event) => {
        this.p1.controller.enqueue(keyCodeConversion(0x00))
        let vkey = keyCodeConversion(event.keyCode)
        vkey = this.p1.controller.fixVkey(vkey)
        this.p1.controller.release(vkey)
    }

    componentDidMount() {
        this.timer = requestAnimationFrame(this.redraw)
        EventListener.listen(document, 'keydown', this.keyDown)
        EventListener.listen(document, 'keyup', this.keyUp)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.timer)
        this.timer = null
    }

    render() {
        return (
        <section className="battle">
            <section>
                <section className="topbar">
                    {this.p1 && this.props.showP1HP && <HP max={this.state.p1hpMax} val={this.state.p1hp} width={300} height={30} />}
                    {this.p2 && this.props.showP1HP && <HP max={this.state.p2hpMax} val={this.state.p2hp} flip={true} width={300} height={30} />}
                </section>
                <canvas width={this.width} height={this.height} ref={this.attachCanvas}/>
            </section>
            <section>
                <div>{this.state.keys}</div>
            </section>
        </section>)
    }
}

export default Battle