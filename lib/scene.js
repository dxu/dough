/* @flow */
import * as Pixi from 'pixi.js';
import Camera from './camera';
import Gob from './gob';
import Loader from './loader';
import Game from './game';
import Keyboard from './keyboard';
import Matter from 'matter-js';
import Tilemap from './tilemap';

let currentCollisionGroupPow = 0;

type SceneOptions = {
  gravity: {
    x: number,
    y: number,
  },
};

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
  world: Matter.World;
  gobs: Array<Gob>;
  loader: Loader;
  name: string;
  resources: Object;
  stage: Pixi.Container;
  game: Game;
  grid: Pixi.Graphics;
  loaded: bool;
  gravity: {
    x: number,
    y: number,
  } = {
    x: 0,
    y: 0,
  };
  tilemaps: Array<Tilemap> = [];

  static preload: {
    tilemaps: Array<typeof Gob>,
    gobs: Array<typeof Gob>,
  } = {
    tilemaps: [],
    gobs: [],
  };

  constructor(game: Game, opts: SceneOptions = {}): void {
    // the name of the scene is the name of the function or class you define
    this.name = this.constructor.name;
    this.stage = new Pixi.Container();
    const gravity = opts.gravity || {};
    this.gravity.x = gravity.x || 0;
    this.gravity.y = gravity.y || 0;
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

    // initialize the world after the scene has loaded
    this.world = Matter.World.create({
      gravity: {
        x: this.gravity.x,
        y: this.gravity.y,
      },
    });
    this.game.engine.world = this.world;
    this.loader = new Loader(this.__preloaded, this.game.audioContext);
    this.__preload();
    this._drawGrid(this.game.debug);
  }

  __preload(...gobClasses: Array<typeof Gob>): void {
    const {gobs, tilemaps} = this.constructor.preload;
    // if it's already loaded, just return a resolved promise with the resources
    if (this.loaded) {
      Promise.resolve([this.resources]);
      return;
    }

    gobs.map(gobClass => gobClass.__load(this.loader));
    tilemaps.map(tilemap => Tilemap.__load(this.loader, tilemap));
    const spritePromise = this.loader.loadAssets();
    const audioPromise = this.loader.loadAudio();

    Promise.all([spritePromise, audioPromise])
      .then(this.__preloaded)
      .catch(err => console.log('Error loading resources: ', err));
  }

  __preloaded = (
    [resources: Object, audioResources: Array<mixed>]: Array<mixed>,
  ) => {
    this.loaded = true;
    // $FlowFixMe: not sure why it thinks its mixed, TODO: report
    this.resources = resources;
    this.onSceneLoad();
    // after the scene has loaded, load up the gobs
    this.gobs.map((gob: Gob) => {
      gob.__onSceneLoad();
    });
    // after the scene has loaded, load up the gobs
    this.tilemaps.map((tilemap: Tilemap) => {
      tilemap.__onSceneLoad();
    });
  };

  /* Run time Lifecycle Events */

  __prePhysicsUpdate() {
    for (let i = 0; i < this.gobs.length; i++) {
      if (this.gobs[i].rigidbody) {
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
      this.gobs[i].__postPhysicsUpdate();
      this.gobs[i].postPhysicsUpdate();
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
    this.gobs.push(gob);
    if (gob.onKeyDown) {
      Keyboard.registerGob(gob);
    }
  }

  /* name corresponds to the Tiled name */
  createTilemap(opts, name) {
    console.log('joijoj', arguments);
    const tilemap: Tilemap = new Tilemap(name);
    tilemap.__init(this, opts);
    this.tilemaps.push(tilemap);
  }

  // TODO: test this method
  // for destroy() and cleanup
  removeGob(gob: Gob): void {
    if (gob.collider != null) {
      // Matter.World.remove(this.game.engine.world, gob.collider.body);
    }
    this.gobs = this.gobs.filter(compare => compare._id !== gob._id);
    this.stage.removeChild(gob.currentSprite._pixi);
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

  destroy() {
    // reset the keyboard listeners when we load a new scene
    Keyboard.clearRegisteredGobs();
  }
}
