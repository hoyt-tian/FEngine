import { EventListener } from '../util'
import Block, {BlockType} from './block'

export default class Frame {
    constructor(config) {
        Object.assign(this, {
            imgUrl: null,       // 图片资源
            audioUrl: null,     // 声音资源（可选）
            redrawCount: 1,     // 帧重绘次数
            counter:0,  // 绘制计数器
            attBlocks: [],
            defBlocks: [],
        }, config)

        if (typeof(this.execution) === 'string' && this.execution) {
            this.__execute__ = new Function('data', this.execution)
        }
    }

    execute(data) {
        if (this.__execute__) {
            this.__execute__(data)
        }
        if (this.audio) {
            this.audio.play()
        }
    }

    currentBlock = (data) => {
       const blocks = []
       this.attBlocks && this.attBlocks.forEach( (b, i) => {
           let block = null
           if (typeof(b) === 'string') {
                this.attBlocks[i] = new Function('block', 'data', b)
                block = new Block({source: data.instance})
                this.attBlocks[i](block, {...data, frame: this})
           } else if (typeof(b) === 'function') {
                block = new Block({})
                block.source = data.instance
                b(block, {...data, frame: this})
           } else {
                b.owner = data.owner
                b.type = BlockType.attack
                b.source = data.instance
                block = new Block(b)
                block.y += data.instance.y
                if( data.instance.flip) {
                    block.x = data.instance.x - block.width - b.x
                } else {
                    block.x += data.instance.x
                }

           }
           
           blocks.push(block)

           // todo 考虑flip的情况
       })

       this.defBlocks && this.defBlocks.forEach(b => {
           b.type = BlockType.defense
           b.owner = owner
           const block = new Block(b)
           if( character.flip) {

            } else {
                block.x += character.x
                block.y += character.y
            }
            blocks.push(block)
       })
       return blocks
    }

    loadResources(){
        const resources = [
            new Promise((resolve, reject) => {
                const image = new Image()
                EventListener.listen(image, 'load', () => resolve(image) )
                EventListener.listen(image, 'error', () => reject(image) )
                image.src = this.imgUrl
            })
        ]
        if (this.audioUrl) {
            /*
            resources.push(
                new Promise( (resolve, reject) => {
                    const audio = new Audio()
                    audio.preload = 'auto'
                    EventListener.listen(audio, 'load', () => {
                        resolve(audio)
                        console.log('download audio success')
                    })
                    EventListener.listen(audio, 'error', () => {
                        console.log('download audio fail')
                        reject(audio)
                    })
                    audio.src = this.audioUrl
                } 
            ))
            */
           const audio = new Audio()
            audio.preload = 'auto'
            EventListener.listen(audio, 'load', () => {
                resolve(audio)
                console.log('download audio success')
            })
            EventListener.listen(audio, 'error', () => {
                console.log('download audio fail')
                reject(audio)
            })
            audio.src = this.audioUrl
            this.audio = audio
        }
        return Promise.all(resources).then((res) => {
            this.image = res[0]
            // this.audio = res[1] || null
            return new Promise((resolve, reject) => resolve(this))
        })
    }

    toJSON() {
        const {image = null, audio=null, __execute__, __modified__, ...rest} = this
        return rest
    }
}