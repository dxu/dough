/* a class for Sprites that wraps the PIXI Sprite class */
import invariant from 'invariant';
import type Gob from 'gob';
import Vector2 from './vector2';

import {Utils} from './util';

export default class Sprite {
  _pixi: PIXI.Sprite | Pixi.extras.AnimatedSprite;
  path: string;
  frameStart: number;
  frameEnd: number;
  fps: number;
  width: number;
  height: number;
  gob: Gob;
  anchor: Vector2;
  animated: bool;
  pixiKey: string;
  // the starting frame if we are showing an animation
  startingFrame: number = 0;

  // TODO: this only supports array based spritesheet data
  constructor(options: {
    _pixi: PIXI.Sprite | Pixi.extras.AnimatedSprite,
    pixiKey: string,
    path: string,
    frameStart: number,
    frameEnd: number,
    fps: number,
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
    // default it to 60fps
    this.fps = options.fps || 60;
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

    if (resource.texture) {
      this._pixi = PIXI.Sprite.from(texture);
      this.animated = false;
    } else {
      invariant(
        resource.textures,
        `[Sprite.js] No texture found
        for ${options.pixiKey}`,
      );
      // if there are multiple textures, this is an animated sprite, and we need
      // the frameStart and frameEnd of the spritesheet
      this.frameStart = options.frameStart;
      this.frameEnd = options.frameEnd;
      invariant(
        this.frameStart != null,
        `[Sprite.js] No "frameStart" specified for ${this.gob.constructor.name}`,
      );
      invariant(
        this.frameEnd != null,
        `[Sprite.js] No "frameEnd" specified for
        ${this.gob.constructor.name} sprite`,
      );

      // TODO: assumes that it is array based sprite atlas!
      const frames = [];
      for (let i = this.frameStart; i <= this.frameEnd; i++) {
        frames.push(resource.textures[i]);
      }
      console.log(frames);
      this._pixi = new PIXI.extras.AnimatedSprite(frames);
      console.log(this.fps);
      this._pixi.animationSpeed = this.fps / 60;
      console.log(this._pixi.animationSpeed);
      this.animated = true;
    }

    this.path = options.path;
    this.width = options.width;
    this.height = options.height;
    invariant(
      this._pixi,
      `[Sprite.js] Something went wrong! No Pixi Sprite was passed during
      the instantiation of this Sprite for ${this.gob.constructor.name}`,
    );
    invariant(this.path != null, 'a resource path must be specified');
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
  }

  // if it's an animated sprite, play it
  play() {
    if (this.animated) {
      this._pixi.play();
    }
  }

  // if it's an animated sprite, stop it
  stop() {
    if (this.animated) {
      this._pixi.stop();
    }
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
  }
}
