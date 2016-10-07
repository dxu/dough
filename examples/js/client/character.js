import Pill from './pill'
// extends basic gob
export default class Character extends Pew.Gob {
  constructor(...args) {
    super(...args)
    let that = this

    console.log(Pew.CONST.KEYS.F)

    // events hash from event name to function. You can assume that "this" will always be this gob.
    this.events = {
      onKeyDown: {
        [Pew.CONST.KEYS.W]: function(evt) {
          that.velocity.y = that.maxVelocity.y * -1
        },
        [Pew.CONST.KEYS.A]: function(evt) {
          that.velocity.x = that.maxVelocity.x * -1
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
          } else {
            that.velocity.x = 0
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

    // this.events = {
    //   onKeyDown: function(evt) {
    //     switch (evt.keyCode)  {
    //       case Pew.CONST.KEYS.W:
    //         that.velocity = Pew.CONST.VELOCITY.N
    //         break
    //       case Pew.CONST.KEYS.A:
    //         that.velocity = Pew.CONST.VELOCITY.W
    //         break
    //       case Pew.CONST.KEYS.S:
    //         that.velocity = Pew.CONST.VELOCITY.S
    //         break
    //       case Pew.CONST.KEYS.D:
    //         that.velocity = Pew.CONST.VELOCITY.E
    //         break
    //       default:
    //         break
    //     }
    //   },
    //   onKeyUp: function(evt) {
    //     switch (evt.keyCode)  {
    //       case Pew.CONST.KEYS.W:
    //       case Pew.CONST.KEYS.A:
    //       case Pew.CONST.KEYS.S:
    //       case Pew.CONST.KEYS.D:
    //         that.velocity = {
    //           x: 0,
    //           y: 0
    //         }
    //         break;
    //       default:
    //         break
    //     }
    //   }
    // }

  }

  onCollide(gob) {
    if (gob instanceof Pill) {
      console.log('hello')
      // gob.destroy()
    }
  }

  update() {
    // if (this.game.isKeyPressed(Pew.CONST.KEYS.A)) {
    //   this.velocity.x = -1
    // } else if (this.game.isKeyPressed(Pew.CONST.KEYS.D)) {
    //   this.velocity.x = 1
    // } else {
    //   this.velocity.x = 0
    // }

    // if (this.game.isKeyPressed(Pew.CONST.KEYS.W)) {
    //   this.velocity.y = 1
    // } else if (this.game.isKeyPressed(Pew.CONST.KEYS.S)) {
    //   this.velocity.y = -1
    // } else {
    //   this.velocity.y = 0
    // }


    if (this.velocity.y || this.velocity.x) {
      // this.position = Pew.V2.Add(this.position, this.velocity)

      // this.data.sprite.position.y = this.position.y;
      // this.data.sprite.position.x = this.position.x;
    }
  }

}
