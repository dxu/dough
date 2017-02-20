// extends basic gob
class DemoScene extends Pew.Scene {
  init() {
    console.log('initialize demoscene')
  }
  update() {

  }
  onSceneLoad() {
    console.log('scene laoded', this.resources)


    this.createGob({
      transform: {
        position: new Pew.V2(440, 399),
        angle: 20,
      },
      debug: true,
    }, Zelda)
    this.createGob({
      transform: {
        position: new Pew.V2(440, 420),
        angle: 20,
      },
      rigidbody: {
        mass: 10,
        velocity: new Pew.V2(0, 0),
      },
      debug: true,
    }, Pill)
    this.createGob({
      transform: {
        position: new Pew.V2(700, 400),
        angle: 20,
      },
      rigidbody: {
        mass: 10,
        velocity: new Pew.V2(0, 0),
      },
      debug: true,
    }, Pill)
    this.createGob({
      transform: {
        position: new Pew.V2(620, 400),
        angle: 20,
      },
      rigidbody: {
        mass: 10,
      },
      debug: true,
    }, Pill)



  }
}
DemoScene.preload = [Pill, Zelda]
