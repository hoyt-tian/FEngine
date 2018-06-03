class Player {
    constructor(character, controller) {
        this.character = character
        this.controller = controller
        this.character.owner = this
        
        this.hp = 100
    }

    hurt(val) {
        this.hp -= val
        return this.hp
    }
}

export default Player