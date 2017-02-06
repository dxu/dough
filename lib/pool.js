/* @flow */
import * as Pixi from 'pixi.js';
import Gob from './gob';
import Matter from 'matter-js';

import {Time} from './constants/private';
import {Utils} from './util';

import Loader from './loader'

type PoolOpts = Object;

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

  loader: Loader;
  resources: Object;

  constructor(opts: PoolOpts): void {
    this._id = Utils.uuid();
    this.renderer =  new Pixi.WebGLRenderer(
      opts.width,
      opts.height,
      {view: opts.canvas},
    );
    this.renderer.backgroundColor = 0xFFFFFF;
    // TODO: tilesize hardcoded
    this.tileSize = 30;

    // array of gob objects
    this.gobs = [];

    this.stage = new Pixi.Container()

    this.engine = Matter.Engine.create();
    this.engine.world.gravity.x = 0;
    this.engine.world.gravity.y = 0;
    this._drawFPS();
    this._drawGrid(opts.showGrid);

    this.loader = new Loader(this.loaded)
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
    const gob: Gob = new GobClass();
    gob.__init(this, opts);

    // if it contains a collider, we need to put it into the collision engine,
    // regardless whether or not it is a rigid body
    if (gob.collider != null) {
      Matter.World.add(this.engine.world, gob.collider.body)
    }

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
    // if the resources haven't been loaded yet, do not do anything!
    // TODO: support multiple states in the game
    if (this.resources == null) {
      return;
    }

    const currentTime: number = Date.now();

    this.fps = 1000 / (currentTime - this.lastTime);
    this.lastTime = currentTime;
    this.fpsText.text = Math.floor(this.fps);

    this.update();

    // because the spatial hash is now being regenerated on each update, we just
    // pass all the gobs to the ceng

    // TODO: Refactor this + above
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].collider) {
        this.gobs[i].prePhysicsUpdate();
        this.gobs[i].__prePhysicsUpdate();
      }
    }

    // TODO: add ONLY THE ONES THAT CHANGED back to the spatial hash
    Matter.Engine.update(this.engine, Time.dtms);

    // TODO: Refactor this + above
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].collider) {
        this.gobs[i].__postPhysicsUpdate();
        this.gobs[i].postPhysicsUpdate();
      }
    }

    // TODO: can optimize here.
    // for each gob, calculate their new depth.
    this.gobs.map((gob) => {
      gob.sprite.pixi.zDepth = typeof gob.depth === "function" ?
        gob.depth() :
        gob.sprite.pixi.zDepth = gob.depth;
    });

    // sort by the new z depth
    this.stage.children.sort(
      (sprite1, sprite2) => sprite1.zDepth > sprite2.zDepth,
    );

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

  preload(...gobs: Array<typeof Gob>) {
    this.loader.load(...gobs);
  }

  loaded = (loader: Loader, resources: Object) => {
    this.resources = resources;
    this.gobs.map((gob: Gob) => {
      gob.__onGameLoaded()
      // add the sprite to the stage
      this.stage.addChild(gob.sprite.pixi);
    })
  }
}
