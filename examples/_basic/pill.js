// extends basic gob
class Pill extends Pew.Gob {
  constructor() {
    super();
    this.sprite = {
      width: 20,
      height: 20,
    }
    this.collider = new Pew.Colliders.Box(this, 20, 20)

    this.rigidbody = {
      mass: 1,
      friction: 0,
      velocity: new Pew.V2(30, 0),
      angularVelocity: 10,
    }

    this.depth = () => {
      return this.transform.position.y
    }
  }
  onCollide(gob) {
    console.log('hit a gob!')
    // if (gob instanceof Pill) {
    //   this.maxVelocity =
    //     new Pew.Vector2(
    //       (Math.round(Math.random()) * 2 - 1) * Math.random() * 3,
    //       (Math.round(Math.random()) * 2 - 1) * Math.random() * 3
    //     )
    //   this.velocity = this.maxVelocity
    // }

  }
  update() {
    // if position is outside bounds, negate
    if (this.position.x - this.width / 2 < 0 ||
        this.position.x + this.width / 2 > this.game.getWidth()) {
        this.velocity.x = -this.velocity.x
    }
    if (this.position.y - this.height / 2 < 0 ||
        this.position.y + this.height / 2 > this.game.getHeight()) {
        this.velocity.y = -this.velocity.y
    }
  }
}

Pill.spritePath = './assets/img/heart.png';
