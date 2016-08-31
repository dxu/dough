import PIXI from 'pixi.js'
import * as util from './utilities'
import SpatialHash from './spatialhash'

util.ready(function(){

const canvas = document.getElementById('canvas')
// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.WebGLRenderer(800, 600, {
  view: canvas
});

// Declare a global variable for our sprite so that the animate function can access it.
var zelda = null;

renderer.backgroundColor = 0xFFFFFF;

canvas.focus()

canvas.addEventListener('click', function(evt) {
  if (this !== document.activeElement) {
    canvas.focus()
  }
})

canvas.addEventListener('keydown', function(evt) {
  console.log('yo')
  console.log(evt.keyCode)

  switch (evt.keyCode)  {
    case util.keys.W:
      speed.y = -5
      break
    case util.keys.A:
      speed.x = -5
      break
    case util.keys.S:
      speed.y = 5
      break
    case util.keys.D:
      speed.x = 5
      break
    default:
      break
  }


  console.log(speed)

  if (evt.keyCode === util.keys.A) {

  }
})

var speed = {
  x: 0,
  y: 0
}

canvas.addEventListener('keyup', function(evt) {
  console.log('yo')
  console.log(evt.keyCode)

  switch (evt.keyCode)  {
    case util.keys.W:
    case util.keys.A:
    case util.keys.S:
    case util.keys.D:
      speed = {
        x: 0,
        y: 0
      }
      break;
    default:
      break
  }
  console.log(zelda.position.y,zelda.position.x)
})


// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();

let comparator = function() {

}

let bucketHasher = function(item) {
  return

}

let uuidHasher = function() {

}

let hash = new SpatialHash()



// load the texture we need
PIXI.loader.add('zelda', './assets/img/zelda.gif')
  .add('heart', './assets/img/heart.png')
  .load(function (loader, resources) {
    // This creates a texture from a 'zelda.png' image.
    zelda = new PIXI.Sprite(resources.zelda.texture);

    // Setup the position and scale of the zelda
    zelda.position.x = 400;
    zelda.position.y = 300;

    zelda.anchor.x = 0.5;
    zelda.anchor.y = 0.5;

    zelda.scale.x = 2;
    zelda.scale.y = 2;

    for (var i=0; i<10; i++) {
      let heart = new PIXI.Sprite(resources.heart.texture);
      heart.position.x = Math.random() * 800;
      heart.position.y = Math.random() * 600;
      heart.anchor.x = 0.5;
      heart.anchor.y = 0.5;
      stage.addChild(heart);
    }

    // Add the zelda to the scene we are building.
    stage.addChild(zelda);

    // kick off the animation loop (defined below)
    animate();
});

function animate() {
  // start the timer for the next animation loop
  requestAnimationFrame(animate);

  // each frame we spin the zelda around a bit
  // zelda.rotation += 0.01;
  console.log(speed)
  zelda.position.y += 1 * speed.y;
  zelda.position.x += 1 * speed.x;
  // zelda.position.y += 5

  // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage);
}

})
