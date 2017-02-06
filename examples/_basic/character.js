// extends basic gob
class Character extends Pew.Gob {
  constructor(...args) {
    super(...args)
    let that = this

    // events hash from event name to function. You can assume that "this" will always be this gob.
    this.events = {
      onKeyDown: {
        [Pew.CONST.KEYS.W]: function(evt) {
          that.velocity.y = that.maxVelocity.y * -1
        },
        [Pew.CONST.KEYS.A]: function(evt) {
          that.velocity.x = that.maxVelocity.x * -1
          // that.velocity.y = that.maxVelocity.y * -1
        },
        [Pew.CONST.KEYS.S]: function(evt) {
          that.velocity.y = that.maxVelocity.y * 1
        },
        [Pew.CONST.KEYS.D]: function(evt) {
          that.velocity.x = that.maxVelocity.x * 1
        }
      },
      onKeyHold: {
        [Pew.CONST.KEYS.F]: function() {
          console.log('holding f down')
        }
      },
      onKeyUp: {
        [Pew.CONST.KEYS.W]: function(evt) {
          if (that.game.isKeyPressed(Pew.CONST.KEYS.S)) {
            that.velocity.y = that.maxVelocity.y * 1
          } else {
            that.velocity.y = 0
          }
        },
        [Pew.CONST.KEYS.A]: function(evt) {
          if (that.game.isKeyPressed(Pew.CONST.KEYS.D)) {
            that.velocity.x = that.maxVelocity.x * 1
            // that.velocity.y = that.maxVelocity.y * 1
          } else {
            that.velocity.x = 0
            // that.velocity.y = 0
          }
        },
        [Pew.CONST.KEYS.S]: function(evt) {
          if (that.game.isKeyPressed(Pew.CONST.KEYS.W)) {
            that.velocity.y = that.maxVelocity.y * -1
          } else {
            that.velocity.y = 0
          }
        },
        [Pew.CONST.KEYS.D]: function(evt) {
          if (that.game.isKeyPressed(Pew.CONST.KEYS.A)) {
            that.velocity.x = that.maxVelocity.x * -1
          } else {
            that.velocity.x = 0
          }
        }
      }
    }
  }

  onCollide(gob) {
    if (gob instanceof Pill) {
      // gob.destroy()
    }
  }

  update() {
    if (this.velocity.y || this.velocity.x) {
    }
  }
}
