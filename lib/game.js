/* @flow */
import * as Pixi from 'pixi.js';
import Gob from './gob';
import Camera from './camera';
import Keyboard from './keyboard';
import Scene from './scene';

import {Time} from './constants/private';
import {Utils} from './util';

import Loader from './loader';

import Stats from 'stats.js';

import b2dlib from 'box2D';

type GameOpts = Object;

const Box2DLoadPromise = b2dlib();

Box2DLoadPromise.then(Box2D => {
  Game.Box2D = Box2D;
  Game.loaded = true;
});

export default class Game {
  _id: number;
  camera: Camera;
  scenes: {[name: string]: Scene};
  currentScene: Scene;
  gobs: Array<Gob>;
  renderer: Pixi.WebGLRenderer;
  tileSize: number;
  canvas: HTMLCanvasElement;

  debug: bool;

  stats: Stats;

  loader: Loader;
  resources: Object;
  audioContext: AudioContext;

  // has Box2D loaded?
  static loaded = false;

  constructor(opts: GameOpts): void {
    this._id = Utils.uuid();
    this.canvas = opts.canvas;
    this.renderer = new Pixi.WebGLRenderer(opts.width, opts.height, {
      view: opts.canvas,
    });
    this.renderer.backgroundColor = 0xffffff;
    Keyboard.init({
      canvas: opts.canvas,
    });
    // TODO: tilesize hardcoded
    this.tileSize = 30;

    // array of gob objects
    this.gobs = [];

    // this.engine = Matter.Engine.create();

    this.audioContext = new AudioContext();
    this.debug = false || opts.debug;

    this.stats = new Stats();
    this.stats.showPanel(0);
    // && document.body just for flow..
    if (this.debug && document.body) {
      document.body.appendChild(this.stats.dom);
    }
  }

  loadScene(scene: Scene) {
    // we can only load scenes if Box2D has loaded
    Box2DLoadPromise.then(() => {
      console.log(Box2DLoadPromise, Box2D);
      this.currentScene = scene;
      if (!scene.loaded) {
        this.currentScene.load(this);
      }
    });
    // this.engine.world.gravity.x = this.currentScene.gravity.x;
    // this.engine.world.gravity.y = this.currentScene.gravity.y;
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
    // if Box2D hasn't loaded we can't do anything yet
    if (!Game.loaded) {
      return;
    }
    this.stats.begin();
    // if the resources haven't been loaded yet, do not do anything!
    // TODO: support multiple states in the game
    if (this.currentScene.resources == null) {
      return;
    }

    this.currentScene.__prePhysicsUpdate();
    this.currentScene.prePhysicsUpdate();
    // 8 & 3 suggested by Box2D user manual
    this.currentScene.world && this.currentScene.world.Step(Time.dtms, 8, 3);
    // Matter.Engine.update(this.engine, Time.dtms);
    this.currentScene.__postPhysicsUpdate();
    this.currentScene.postPhysicsUpdate();

    this.currentScene.__update();
    this.currentScene.update();

    this.currentScene.__preRenderUpdate();
    // TODO: physics responses
    // TODO: need to update spatial hash post physics response
    this.renderer.render(this.currentScene.stage);
    this.stats.end();
  }

  // TODO: in the future, if game states are implemented, this should be found
  // in the game states. The Game object should shift between the states to
  // determine which update methods are called
  //
  // run through pool of objects and update positions based on the velocities
  // Should be defined/overwritten when extended
  update(): void {}
}
