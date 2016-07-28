import PIXI from 'pixi.js'
import * as util from './utilities'

util.ready(function(){

// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.WebGLRenderer(800, 600);

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();


// Declare a global variable for our sprite so that the animate function can access it.
var zelda = null;

// load the texture we need
PIXI.loader.add('zelda', './assets/img/zelda.png').load(function (loader, resources) {
    // This creates a texture from a 'zelda.png' image.
    zelda = new PIXI.Sprite(resources.zelda.texture);

    // Setup the position and scale of the zelda
    zelda.position.x = 400;
    zelda.position.y = 300;

    zelda.scale.x = 2;
    zelda.scale.y = 2;

    // Add the zelda to the scene we are building.
    stage.addChild(zelda);

    // kick off the animation loop (defined below)
    animate();
});

function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // each frame we spin the zelda around a bit
    zelda.rotation += 0.01;

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}

})
