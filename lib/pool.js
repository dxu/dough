/* @flow */
import * as Pixi from 'pixi.js';
import Gob from './gob';
import Matter from 'matter-js';

import {Time} from './constants/private';
import {Utils} from './util';

export default class Pool {
  _id: number;
  stage: Pixi.Container;
  gobs: Array<Gob>;
  engine: Matter.Engine;
  renderer: Pixi.WebGLRenderer;
  tileSize: number;
  grid: Pixi.Graphics;

  fps: number;
  lastTime: number;
  fpsText: Pixi.Text;

  constructor(renderer: Object, opts: Object): void {
    this._id = Utils.uuid();
    this.renderer = renderer;
    // TODO: tilesize hardcoded
    this.tileSize = 30;

    // array of gob objects
    this.gobs = [];

    this.stage = opts.stage;

    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;
    this._drawFPS();
    this._drawGrid(opts.showGrid);
  }

  _drawFPS(): void {
    this.fps = 0;
    // TODO: move off Pixi
    this.fpsText = new Pixi.Text(Math.floor(this.fps),
      {fontFamily: 'Arial', fontSize: 12, fill: 0xff1010, align: 'center'});
    this.fpsText.position.set(0, 0);
    this.stage.addChild(this.fpsText);
  }

  _drawGrid(showGrid: bool): void {
    // draws a grid of given tilesize
    this.grid = new Pixi.Graphics();
    this.grid.moveTo(0, 0);
    this.grid.lineStyle(1, 0x336699, 0.3);
    for (let i = 0; i <= this.renderer.view.width; i += this.tileSize) {
      this.grid.moveTo(i, 0);
      this.grid.lineTo(i, this.renderer.view.height);
    }
    for (let i = 0; i < this.renderer.view.height; i += this.tileSize) {
      this.grid.moveTo(0, i);
      this.grid.lineTo(this.renderer.view.width, i);
    }
    if (!showGrid) {
      this.grid.visible = false;
    }
    this.stage.addChild(this.grid);
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
    gob.__init();

    // if it contains a collider, we need to put it into the collision engine,
    // regardless whether or not it is a rigid body
    if (gob._body != null) {
      Matter.World.add(this.engine.world, gob._body)
    }

    // add the sprite to the stage
    this.stage.addChild(gob.data.sprite)

    this.gobs.push(gob);
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

    // because the spatial hash is now being regenerated on each update, we just
    // pass all the gobs to the ceng

    // TODO: add ONLY THE ONES THAT CHANGED back to the spatial hash
    Matter.Engine.update(this.engine, Time.dtms);

    // TODO: Refactor this + above
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].constructor.collider) {
        this.gobs[i]._postCollisionUpdate();
      }
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
