class Player {
    constructor(character, controller) {
        this.character = character
        this.controller = controller
        this.character.owner = this
        if (this.character.actions['drop']) {
            this.character.actions['drop'].nextStatus = 'getup'
        } 
        this.hp = 100
    }

    hurt(val) {
        this.hp -= val
        // this.character.setStatus('hm')
        return this.hp
    }

    setFlip(flip) {
        if (this.character.flip !== flip) {
            this.character.setFlip(flip)
            /*
            if (!flip) {
                this.character.x = this.character.x + this.character.currentFrame.image.width
            } else {
                this.character.x = this.character.x - this.character.currentFrame.image.width
            } */
            this.controller.setFlip(flip)
        }
    }
}

export default Player