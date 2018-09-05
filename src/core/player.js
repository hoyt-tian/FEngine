class Player {
  constructor(character, controller) {
    this.character = character;
    this.controller = controller;
    this.character.owner = this;
    this.setNextStatus(this.character.actions.jump, 'fall');
    this.setNextStatus(this.character.actions.slk, 'squat');
    this.setNextStatus(this.character.actions.shk, 'squat');
    this.setNextStatus(this.character.actions.drop, 'getup');
    this.hp = 100;
  }

  setNextStatus(action, nextStatus) {
    if (action && nextStatus) {
      action.nextStatus = nextStatus;
    }
  }

  hurt(val) {
    this.hp -= val;
    // this.character.setStatus('hm')
    return this.hp;
  }

  setFlip(flip) {
    if (this.character.flip !== flip) {
      this.character.setFlip(flip);
      /*
            if (!flip) {
                this.character.x = this.character.x + this.character.currentFrame.image.width
            } else {
                this.character.x = this.character.x - this.character.currentFrame.image.width
            } */
      this.controller.setFlip(flip);
    }
  }
}

export default Player;
