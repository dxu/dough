/* @flow */
import CollisionEngine from './collision/engine';
import Gob from './gob';
import util from './util';
import Keyboard from './keyboard';
import * as Pixi from 'pixi.js';

import Matter from 'matter-js';

// TODO: Multiple game states might be necessary. For example, in Phaser, you
//       can define Victory, Play, Intro, states, etc.
// TODO: handle sprite and asset preloading
export default class Pool {
  stage: Pixi.Container;
  gobs: Array<Gob>;
  _keyboard: Keyboard;
  ceng: CollisionEngine;
  engine: Matter.Engine;
  fps: number;
  lastTime: number;
  fpsText: Pixi.Text;
  // TODO: allow other renderers
  renderer: Pixi.WebGLRenderer;
  _id: number;
  tileSize: number;
  grid: Pixi.Graphics;

  // contains a spatial hash, gobs, renderer
  constructor(renderer: Object, opts: Object): void {
    // required so it can be removed as a ref
    this._id = util.uuid();
    this.renderer = renderer;

    this.lastTime = Date.now();
    this.fps = 0;
    // TODO: move off Pixi
    this.fpsText = new Pixi.Text(Math.floor(this.fps),
      {fontFamily: 'Arial', fontSize: 12, fill: 0xff1010, align: 'center'});
    this.fpsText.position.set(0, 0);

    // construct a spatial hash
    // TODO: tilesize hardcoded
    this.tileSize = 30;

    this.ceng = new CollisionEngine(this.tileSize);

    // array of gob objects
    this.gobs = [];

    this.stage = opts.stage;

    this.engine = Matter.Engine.create();

    // draws a grid of given tilesize
    this.grid = new Pixi.Graphics();
    this.grid.moveTo(0, 0);
    this.grid.lineStyle(1, 0x336699, 0.3);

    for (let i = 0; i <= renderer.view.width; i += this.tileSize) {
      this.grid.moveTo(i, 0);
      this.grid.lineTo(i, renderer.view.height);
    }
    for (let i = 0; i < renderer.view.height; i += this.tileSize) {
      this.grid.moveTo(0, i);
      this.grid.lineTo(renderer.view.width, i);
    }

    if (!opts.showGrid) {
      this.grid.visible = false;
    }

    this.stage.addChild(this.grid);
    this.stage.addChild(this.fpsText);

    this._keyboard = new Keyboard({
      canvas: this.renderer.view,
    });
    window.keyboard = this._keyboard;

    // this.hideGrid()
  }

  getWidth(): number {
    return this.renderer.view.width;
  }

  getHeight(): number {
    return this.renderer.view.height;
  }

  // delegates to this._keyboard
  registerEventHandler(...args: Array<mixed>): void {
    // this._keyboard.registerEventHandler(...args)
  }

  // delegates to this._keyboard
  isKeyPressed(keyCode: number): bool {
    return this._keyboard.isKeyPressed(keyCode);
  }


  showGrid(): void {
    this.grid.visible = true;
  }
  hideGrid(): void {
    this.grid.visible = false;
  }

  // TODO: test this method
  // creates a gob of type GobClass
  // TODO: in the future allow gob-specific events? might be interesting for
  //       clicks. maybe see what phaser offers
  // TODO: OPTIMIZATION: allow batch create with a custom position, etc.
  //       function!
  createGob(opts: Object, GobClass: Class<Gob> = Gob): void {
    const gob: Gob = new GobClass(this, opts);
    this.stage.addChild(gob.data.sprite);
    if (gob.debug) {
      this.stage.addChild(gob._debugData.outline);
    }
    this.gobs.push(gob);
    gob.addRef(this);

    // add all the keyboard events
    // this._keyboard.addGobEventHandlers(gob._id, gob.events);

    // TODO: This was commented out at some point, but i don't remember why.
    // make sure you check whyWHY??
    this.ceng.update(this.gobs, [gob]);

    // TODO: Refactor this + below
    for (let i = 0; i < this.gobs.length; i++) {
      this.gobs[i]._postCollisionUpdate();
    }
  }

  // TODO: test this method
  // for destroy() and cleanup
  removeGob(gob: Gob): void {
    // TODO: remove keyboard even handlers
    // this._keyboard.removeGobEventHandlers(gob._id, gob.events);
  }

  // TODO: EXPERIMENTAL: How do we handle allowing the definition of updates
  //                     from gobs themselves, as well as an overarching update?
  //                     Perhaps, have an internal method updateCanvas that
  //                     delegates and calls all the updates
  //
  // TODO: in the future, if game states are implemented, the Game object
  //       should shift between the states to determine which update methods
  //       are called
  updateCanvas(): void {
    const currentTime: number = Date.now();

    this.fps = 1000 / (currentTime - this.lastTime);

    this.lastTime = currentTime;

    this.fpsText.text = Math.floor(this.fps);


    this.update();

    const updated: Array<Gob> = [];

    // TODO: See issue #14. Currently this model of
    //          1. calculate new positions
    //          2. figure out which ones CHANGED
    //          3. pass all the ones that changed into the collision engine
    //          4. resolve collisions
    //       works well with a reactive model, but with a predictive model,
    //       this becomes unwieldy. Currently, we have the _previousPosition
    //       which we might be able to use with a preditive model.

    // TODO: should updates be passed any state?
    for (let i = 0; i < this.gobs.length; i++) {
      // all we need to do is check the AABB, i.e, the position,
      // and the width/height
      const prevX: number = this.gobs[i].position.x;
      const prevY: number = this.gobs[i].position.y;
      const prevWidth: number = this.gobs[i].width;
      const prevHeight: number = this.gobs[i].height;

      this.gobs[i]._update();
      this.gobs[i].update();

      if (this.gobs[i].position.x !== prevX ||
          this.gobs[i].position.y !== prevY ||
          this.gobs[i].width !== prevWidth ||
          this.gobs[i].height !== prevHeight) {
        updated.push(this.gobs[i]);
      }
    }

    // because the spatial hash is now being regenerated on each update, we just
    // pass all the gobs to the ceng

    // TODO: add ONLY THE ONES THAT CHANGED back to the spatial hash
    this.ceng.update(this.gobs, updated);

    // TODO: Refactor this + above
    for (let i = 0; i < this.gobs.length; i++) {
      this.gobs[i]._postCollisionUpdate();
    }

    //
    // TODO: physics responses
    // TODO: need to update spatial hash post physics response
    this.renderer.render(this.stage);
  }

  // TODO: in the future, if game states are implemented, this should be found
  // in the game states. The Game object should shift between the states to
  // determine which update methods are called
  //
  // run through pool of objects and update positions based on the velocities
  // Should be defined/overwritten when extended
  update(): void {}
}
