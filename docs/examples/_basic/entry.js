
document.addEventListener('DOMContentLoaded', function(){

const TILESIZE = 100

const canvas = document.getElementById('canvas')

// Declare a global variable for our sprite so that the animate function can access it.
var zelda = null;
// renderer.backgroundColor = 0xFFFFFF;

canvas.focus()

// You need to create a root container that will hold the scene you want to draw.

let game

// let hearts = []
// let a

// load the texture we need
// PIXI.loader.add('zelda', './assets/img/zelda.gif')
//   .add('heart', './assets/img/heart.png')
//   .load(function (loader, resources) {

    game = new Pew.Pool({
      showGrid: true,
      width: window.innerWidth,
      height: window.innerHeight,
      canvas: canvas,
      debug: true,
    })

    game.loadScene(new DemoScene(game))

    // game.createGob({
    //   transform: {
    //     position: new Pew.V2(440, 399),
    //     angle: 20,
    //   },
    //   debug: true,
    // }, Zelda)
    // game.createGob({
    //   transform: {
    //     position: new Pew.V2(440, 420),
    //     angle: 20,
    //   },
    //   rigidbody: {
    //     mass: 10,
    //     velocity: new Pew.V2(0, 0),
    //   },
    //   debug: true,
    // }, Pill)
    // game.createGob({
    //   transform: {
    //     position: new Pew.V2(700, 400),
    //     angle: 20,
    //   },
    //   rigidbody: {
    //     mass: 10,
    //     velocity: new Pew.V2(0, 0),
    //   },
    //   debug: true,
    // }, Pill)
    // game.createGob({
    //   transform: {
    //     position: new Pew.V2(620, 400),
    //     angle: 20,
    //   },
    //   rigidbody: {
    //     mass: 10,
    //   },
    //   debug: true,
    // }, Pill)


    animate();
// });

var items = []


function animate() {
  game.updateCanvas()
  requestAnimationFrame(animate);
}
});
