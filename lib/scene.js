/* @flow */
import * as Pixi from 'pixi.js';
import Camera from './camera';
import Gob from './gob';
import Loader from './loader';
import Matter from 'matter-js';
import Game from './game';

/*
 * Scene lifecycle:
 *   Build-time Events:
 *     onSceneLoad
 *
 *   Run-time Events:
 *     __prePhysicsUpdate
 *     prePhysicsUpdate
 *     __postPhysicsUpdate
 *     postPhysicsUpdate
 *     __update
 *     update
 *     __preRenderUpdate
 */
export default class Scene {
  camera: Camera;
  gobs: Array<Gob>;
  loader: Loader;
  name: string;
  resources: Object;
  stage: Pixi.Container;
  game: Game;
  grid: Pixi.Graphics;
  loaded: bool;

  static preload: Array<typeof Gob>;

  constructor(game: Game): void {
    // the name of the scene is the name of the function or class you define
    this.name = this.constructor.name;
    this.stage = new Pixi.Container();
    // create a new camera for this instance
    this.camera = new Camera(this.stage);
    this.loaded = false;
    this.gobs = [];
    this.__init();
  }

  __init(): void {
    this.init();
  }

  load(game: Game) {
    this.game = game;
    this.loader = new Loader(this.__preloaded, this.game.audioContext);
    this.__preload(...this.constructor.preload);
    this._drawGrid(this.game.debug);
  }

  __preload(...gobs: Array<typeof Gob>): void {
    // if it's already loaded, just return a resolved promise with the resources
    if (this.loaded) {
      Promise.resolve([this.resources]);
      return;
    }
    const spritePromise = this.loader.loadSprites(...gobs);
    const audioPromise = this.loader.loadAudio(...gobs);

    Promise.all([spritePromise, audioPromise])
      .then(this.__preloaded)
      .catch(err => console.log('Error loading resources: ', err));
  }

  __preloaded = (
    [resources: Object, audioResources: Array<mixed>]: Array<mixed>,
  ) => {
    this.loaded = true;
    console.log(resources);
    // $FlowFixMe: not sure why it thinks its mixed, TODO: report
    this.resources = resources;
    this.onSceneLoad();
    // after the scene has loaded, load up the gobs
    this.gobs.map((gob: Gob) => {
      gob.__onSceneLoad();
      // add the sprite to the stage
      this.stage.addChild(gob.sprite.pixi);
    });
  };

  /* Run time Lifecycle Events */

  __prePhysicsUpdate() {
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].collider) {
        this.gobs[i].prePhysicsUpdate();
        this.gobs[i].__prePhysicsUpdate();
      }
    }
  }

  __update() {
    this.gobs.map(gob => {
      gob.__update();
      gob.update();
    });
  }

  __postPhysicsUpdate() {
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].collider) {
        this.gobs[i].__postPhysicsUpdate();
        this.gobs[i].postPhysicsUpdate();
      }
    }
  }

  // final update before rendering
  __preRenderUpdate() {
    // sort by the new z depth
    this.stage.children.sort((sprite1, sprite2) => {
      if (sprite1.zDepth < sprite2.zDepth) {
        return -1;
      } else if (sprite1.zDepth >= sprite2.zDepth) {
        return 1;
      }
      // null or undefined
      return 0;
    });
  }

  _drawGrid(showGrid: bool): void {
    // draws a grid of given tilesize
    this.grid = new Pixi.Graphics();
    this.grid.moveTo(0, 0);
    this.grid.lineStyle(1, 0x336699, 0.3);
    for (
      let i = 0;
      i <= this.game.renderer.view.width;
      i += this.game.tileSize
    ) {
      this.grid.moveTo(i, 0);
      this.grid.lineTo(i, this.game.renderer.view.height);
    }
    for (
      let i = 0;
      i < this.game.renderer.view.height;
      i += this.game.tileSize
    ) {
      this.grid.moveTo(0, i);
      this.grid.lineTo(this.game.renderer.view.width, i);
    }
    if (!showGrid) {
      this.grid.visible = false;
    }
    this.stage.addChild(this.grid);
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
      Matter.World.add(this.game.engine.world, gob.collider.body);
    }
    this.gobs.push(gob);
  }

  // TODO: test this method
  // for destroy() and cleanup
  removeGob(gob: Gob): void {
    if (gob.collider != null) {
      Matter.World.remove(this.game.engine.world, gob.collider.body);
    }
    this.gobs = this.gobs.filter(compare => compare._id !== gob._id);
    this.stage.removeChild(gob.sprite.pixi);
    if (gob.debug) {
      this.stage.removeChild(gob._debugData.colliderOutline);
      this.stage.removeChild(gob._debugData.spriteOutline);
    }
  }

  /* can be overridden by implementations */
  init() {}
  onSceneLoad() {}
  prePhysicsUpdate(): void {}
  update(): void {}
  postPhysicsUpdate(): void {}
}
