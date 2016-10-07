import * as util from './utilities'
import Character from './character'
import Pill from './pill'

util.ready(function(){

const TILESIZE = 100

const canvas = document.getElementById('canvas')
// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
  view: canvas
});

// Declare a global variable for our sprite so that the animate function can access it.
var zelda = null;

renderer.backgroundColor = 0xFFFFFF;

canvas.focus()

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container()

let game

window.spatialHash = new Pew.SpatialHash(TILESIZE)
// let hearts = []
// let a

// load the texture we need
PIXI.loader.add('zelda', './assets/img/zelda.gif')
  .add('heart', './assets/img/heart.png')
  .load(function (loader, resources) {
    // a = new PIXI.Container()
    // for (var i=0; i<1000; i++) {
    //   let sprite = new PIXI.Sprite(resources.zelda.texture)

    //   sprite.position.set(Math.random() * renderer.view.width, Math.random() * renderer.view.height);
    //   hearts.push(sprite)
    //   a.addChild(sprite)
    // }


    game = new Pew.Game(renderer, {
      stage: new PIXI.Container(),
      showGrid: true
    })

    game.registerEventHandler('click', function(evt) {
      if (this !== document.activeElement) {
        canvas.focus()
      }
    })

    game.createGob({
      position: new Pew.V2(100, 100),
      width: 50,
      height: 150,
      maxVelocity: new Pew.V2(1000, 1000),
      // acceleration: new Pew.V2(10, 10),
      data: {
        sprite: new PIXI.Sprite(resources.zelda.texture)
      },
      debug: true
    }, Character)

      game.createGob({
        position: new Pew.V2(100, 200),
        width: 50,
        height: 150,
        maxVelocity: new Pew.V2(0, 0),
        acceleration: new Pew.V2(0, 0),
        debug: true,
        data: {
          sprite: new PIXI.Sprite(resources.heart.texture)
        }
      }, Pill)

    // game.createGob({
    //   position: new Pew.V2(100, 100),
    //   width: 50,
    //   height: 150,
    //   maxVelocity: new Pew.V2(5, 8),
    //   data: {
    //     sprite: new PIXI.Sprite(resources.zelda.texture)
    //   }
    // }, Character)

    // for (var i=0; i<1500; i++) {
    //   game.createGob({
    //   position: new Pew.V2(Math.random() * game.getWidth(), Math.random() * game.getHeight()),
    //     data: {
    //       sprite: new PIXI.Sprite(resources.heart.texture)
    //     }
    //   }, Pill)
    // }

    animate();

});

var items = []


function animate() {
  game.updateCanvas()
  // renderer.render(a);

  // hearts.map(function(heart) {
  //   heart.position.set(heart.position.x + 1,heart.position.y + 1);

  // })

  requestAnimationFrame(animate);
}



// window.a = new Pew.V2(0, 0)
// a.print()
// Pew.V2.sum(a, Pew.V2.left).print()


})
