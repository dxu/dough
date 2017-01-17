/* @flow */
import * as Pixi from 'pixi.js';
import Gob from './gob';
import Matter from 'matter-js';

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
    // if it contains a collider, we need to put it into the collision engine

    // if it's a rigid body, we need to create a Matter.Body for it as well


  }

  // TODO: test this method
  // for destroy() and cleanup
  removeGob(gob: Gob): void {
    // TODO: remove keyboard even handlers
    // this._keyboard.removeGobEventHandlers(gob._id, gob.events);
  }
}
