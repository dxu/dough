// extends basic gob
class Pill extends Pew.Gob {
  constructor() {
    super();
    this.sprite = {
      width: 100,
      height: 100,
    }
    this.collider = new Pew.Colliders.Box(this, 20, 20)

    this.rigidbody = {
      mass: 1,
      friction: 0,
      velocity: new Pew.V2(30, 0),
      angularVelocity: 180,
    }

    this.depth = () => {
      return this.transform.position.y
    }
  }
  onCollide(gob) {
    console.log('hit a gob!')
    this.playAudio('test', 0.1)
  }
  update() {
  }
}

Pill.spritePath = './assets/img/heart.png';
Pill.audioSources = {
  test: './assets/audio/test.wav',
  test2: './assets/audio/test2.wav',
};
