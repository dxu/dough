/* a class for Sprites that wraps the PIXI Sprite class */
import invariant from 'invariant';
import type Gob from 'gob';
import Vector2 from './vector2';

import {Utils} from './util';

export default class Sprite {
  _pixi: Pixi.Sprite;
  path: string;
  frameStart: number;
  frameEnd: number;
  frameDurations: Array<number>;
  width: number;
  height: number;
  gob: Gob;
  anchor: Vector2;
  animated: bool;
  pixiKey: string;
  // the number of times we have displayed the current frame
  // (used for frameDurations)
  _currentFrameCount: number = 0;
  // the current frame we are displaying
  currentFrame: number = 0;

  constructor(options: {
    _pixi: Pixi.Sprite,
    pixiKey: string,
    path: string,
    frameStart: number,
    frameEnd: number,
    frameDurations: Array<number>,
    gob: Gob,
    width: number,
    height: number,
    instance: {
      width?: number,
      height?: number,
      anchor: {
        x: number,
        y: number,
      },
    },
  }) {
    this.gob = options.gob;
    invariant(
      this.gob,
      `[Sprite.js] No gob was provided for this sprite ${this.path}`,
    );
    const gobClass = this.gob.constructor;
    // grab the textures
    const resource = this.gob.scene.resources[options.pixiKey];
    invariant(resource, `[Sprite.js] No resource found for ${options.pixiKey}`);
    this.animated = resource.texture ? true : false;
    const texture = resource.texture || resource.textures[this.currentFrame];
    invariant(
      texture,
      `[Sprite.js] No texture found
      for ${options.pixiKey}`,
    );
    this._pixi = PIXI.Sprite.from(texture);
    this.path = options.path;
    this.frameStart = options.frameStart;
    this.frameEnd = options.frameEnd;
    this.width = options.width;
    this.height = options.height;
    invariant(
      this._pixi,
      `[Sprite.js] Something went wrong! No Pixi Sprite was passed during
      the instantiation of this Sprite for ${this.gob.constructor.name}`,
    );
    invariant(this.path != null, 'a resource path must be specified');
    invariant(
      this.frameStart != null,
      `[Sprite.js] No "frameStart" specified for ${this.gob.constructor.name}`,
    );
    invariant(
      this.frameEnd != null,
      `[Sprite.js] No "frameEnd" specified for ${this.gob.constructor.name} sprite`,
    );
    invariant(
      this.width != null,
      `[Sprite.js] No "width" provided for ${this.gob.constructor.name} sprite`,
    );

    const anchor = options.scale || {x: 0.5, y: 0.5};
    this.anchor = new Vector2(anchor.x, anchor.y);

    this._pixi.width = this.width;
    this._pixi.height = this.height;

    if (options.instance != null) {
      if (options.instance.anchor) {
        invariant(
          options.instance.anchor.x != null,
          'instance anchor options must contain x',
        );
        invariant(
          options.instance.anchor.y != null,
          'instance anchor options must contain y',
        );
        this.anchor.x = options.instance.anchor.x;
        this.anchor.y = options.instance.anchor.y;
      }
    }

    this._pixi.anchor.x = this.anchor.x;
    this._pixi.anchor.y = this.anchor.y;

    // default it to have a single iteration per frame
    this.frameDurations =
      options.frameDurations ||
      Array(options.frameEnd - options.frameStart + 1).fill(1);
  }

  // updates the sprite's position. Should be called after committing position
  // on every frame update
  update() {
    // update zDepth
    this._pixi.zDepth = typeof this.gob.depth === 'function'
      ? this.gob.depth()
      : (this._pixi.zDepth = this.gob.depth);

    this._pixi.position.set(
      this.gob.transform.position.x,
      this.gob.transform.position.y,
    );
    this._pixi.rotation = this.gob.transform.angle * Math.PI / 180;
    // if it's an animation we want to tick the frame forward
    if (this.animated) {
      const count = this.frameDurations[this.currentFrame];
    }
  }
}
