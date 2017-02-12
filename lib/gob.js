/* @flow */
import Vector2 from './vector2';
import * as PIXI from 'pixi.js';
import {Time} from './constants/private';
import Matter from 'matter-js';

import {Utils} from './util';

import type Pool from './pool';

import type {Collider} from './colliders/collider.type';

export type GobOptions = Object;

type GobTransformProps = {
  position: Vector2,
  scale: Vector2,
  angle: number,
}

type GobRigidBodyProps = {
  mass: number,
  friction: number,
  frictionStatic: number,
  frictionAir: number,
  restitution: number,
  velocity: Vector2,
  angularVelocity: number,
  maxVelocity: Vector2,
  maxAngularVelocity: number,
}


type GobSpriteOptions = {
  width: number,
  height: number,
  anchor: Vector2,
  scale: Vector2,
  path: string,
  pixi: PIXI.Sprite,
}

type GobMutableProps = {
}


// Gob.rb
// Every Collider will be an object itself
// Rb will
export default class Gob {
  _id: number;
  game: Pool;
  _destroyed: bool;
  __opts: GobOptions;

  collider: Collider;
  rigidbody: GobRigidBodyProps;
  sprite: GobSpriteOptions;
  static spritePath: string;
  // can support multiple audio sounds. You will be able to reference them
  static audioSources: {[id: string]: string} | string;
  transform: GobTransformProps = {
    position: new Vector2(0, 0),
    scale: new Vector2(1, 1),
    angle: 0,
  };


  debug: bool;
  _debugData: Object;

  // depth of the sprite. Can be calculated as an explicit number, or a function
  depth: number | Function = 0;

  // possible options:
  // {
  //   transform: {
  //     position: Vector2,
  //     scale?: Vector2,
  //     angle?: number,
  //   },
  //   sprite: {
  //     width: number,
  //     height: number,
  //     anchor?: Vector2,
  //     rotation?: number,
  //     scale?: Vector2,
  //     pixi: PIXI.Sprite,
  //   },
  // }
  // Rigid bodies and Colliders should be set on the class itself
  constructor(): void {
  }

  // This is the method that is called invisibly to set up the rigidbody +
  // collider stuff
  __init(game: Pool, opts: GobOptions) {
    this.__opts = opts;
    this._id = Utils.uuid();
    if (opts.transform == null || opts.transform.position == null) {
      throw new Error('Invalid game object created. No position provided.');
    }
    this.transform.position = new Vector2(
      opts.transform.position.x,
      opts.transform.position.y
    );
    this.transform.angle =
      opts.transform.angle ||
      this.transform.angle;
    if (opts.transform.scale != null) {
      this.transform.scale.x = opts.transform.scale.x;
      this.transform.scale.y = opts.transform.scale.y;
    }



    // if this object has a rigidbody, lets set some sane defaults
    // if the object is instantiated with options for a rigid body, do the same
    if (this.rigidbody || opts.rigidbody) {
      // if a rigidbody is being added, we have to default it
      this.rigidbody = this.rigidbody || {};

      this.rigidbody.mass =
        opts.rigidbody.mass || this.rigidbody.mass || 1;
      this.rigidbody.friction =
        opts.rigidbody.friction || this.rigidbody.friction || 0;
      this.rigidbody.frictionAir =
        opts.rigidbody.frictionAir || this.rigidbody.frictionAir || 0;
      this.rigidbody.frictionStatic =
        opts.rigidbody.frictionStatic || this.rigidbody.frictionStatic || 0;
      this.rigidbody.restitution =
        opts.rigidbody.restitution || this.rigidbody.restitution || 0;
      this.rigidbody.velocity =
        opts.rigidbody.velocity ?
          new Vector2(
            opts.rigidbody.velocity.x,
            opts.rigidbody.velocity.y,
          ) : (
            this.rigidbody.velocity ?
            new Vector2(
              this.rigidbody.velocity.x,
              this.rigidbody.velocity.y,
            ) : new Vector2(0, 0)
          );

      this.rigidbody.angularVelocity =
        opts.rigidbody.angularVelocity || this.rigidbody.angularVelocity || 0;
      this.rigidbody.maxVelocity =
        opts.rigidbody.maxVelocity || this.rigidbody.maxVelocity || new Vector2(Infinity, Infinity);
      this.rigidbody.maxAngularVelocity =
        opts.rigidbody.maxAngularVelocity || this.rigidbody.maxAngularVelocity || Infinity;
    }

    this.game = game;
    if (this.game == null) {
      throw new Error('Gob instantiated without a game object.');
    }

    // default to no debug
    this.debug = opts.debug || false;

    // if it has a collider defined, then we should create a Collider object -
    // and a body of that type of collider.
    if (this.collider != null) {
      // if it has no rigidbody property, then this should be considered a trigger
      if (!this.rigidbody) {
        this.collider.body.isSensor = true
      }
      else {
        Matter.Body.setPosition(
          this.collider.body,
          Matter.Vector.create(
            this.transform.position.x,
            this.transform.position.y,
          ),
        );
        Matter.Body.setMass(
          this.collider.body,
          this.rigidbody.mass,
        );
        this.collider.body.friction = this.rigidbody.friction;
        this.collider.body.frictionAir = this.rigidbody.frictionAir;
        this.collider.body.frictionStatic = this.rigidbody.frictionStatic;
        this.collider.body.restitution = this.rigidbody.restitution;
        Matter.Body.setVelocity(
          this.collider.body,
          Matter.Vector.create(
            this.rigidbody.velocity.x * Time.dts,
            this.rigidbody.velocity.y * Time.dts,
          ),
        );
        Matter.Body.setAngularVelocity(
          this.collider.body,
          this.rigidbody.angularVelocity * Time.dts * Math.PI / 180,
        );
      }
      this.collider.body.onCollide(this.onCollide.bind(this));
      this.collider.body.onCollideEnd(this.onCollideEnd.bind(this));
      this.collider.body.onCollideActive(this.onCollideActive.bind(this));
    }
  }

  // this will be called when resources have been loaded
  __initSprite() {
    const opts = this.__opts;
    // set up default sprite attributes
    if (this.sprite == null || this.constructor.spritePath == null) {
      throw new Error('Invalid game object created. No sprite path provided');
    }
    this.sprite.pixi = new PIXI.Sprite(this.game.resources[this.constructor.name].texture);
    this.sprite.width = this.sprite.width || this.sprite.pixi.width;
    this.sprite.height = this.sprite.height || this.sprite.pixi.height;
    this.sprite.anchor = this.sprite.anchor || new Vector2(0.5, 0.5);
    this.sprite.scale = this.sprite.scale || new Vector2(1, 1);

    if (opts.sprite != null) {
      this.sprite.width = opts.sprite.width || this.sprite.width;
      this.sprite.height = opts.sprite.height || this.sprite.height;
      if (opts.sprite.anchor) {
        this.sprite.anchor.x = opts.sprite.anchor.x;
        this.sprite.anchor.y = opts.sprite.anchor.y;
      }
    }
    this.__updateSprite();
  }

  __onGameLoaded() {
    this.__initSprite();
    if (this.debug) {
      this._setupDebug(this.game);
      this._debug();
    }
  }

  _setupDebug(game: Pool): void {
    this._debugData = {};
    this._debugData.colliderOutline = new PIXI.Graphics();
    // debug should always appear on top
    this._debugData.colliderOutline.zDepth = Infinity;
    this._debugData.spriteOutline = new PIXI.Graphics();
    this._debugData.spriteOutline.zDepth = Infinity;
    this.game.stage.addChild(this._debugData.colliderOutline);
    this.game.stage.addChild(this._debugData.spriteOutline);
    // Note: the outline will be added to the stage by the game object!
  }

  __update(): void {
    // update zDepth
    this.sprite.pixi.zDepth = typeof this.depth === "function" ?
      this.depth() :
      this.sprite.pixi.zDepth = this.depth;
  }

  // this is the update that is publicly called and should be overridden
  update(): void {}

  // public version
  prePhysicsUpdate(): void {}
  __prePhysicsUpdate(): void {
    // adjust the collider body velocities to be time per step to fit matter.js
    // instead of time per step
    // Matter.Body.setVelocity(
    //   this.collider.body,
    //   Matter.Vector.create(
    //     this.rigidbody.velocity.x * Time.dts,
    //     this.rigidbody.velocity.y * Time.dts,
    //   ),
    // );
  }

  // public version
  postPhysicsUpdate(): void {}
  // this is where you add post checks
  __postPhysicsUpdate(): void {
    this.__updatePostCollisionAttributes();
    this.__updateSprite();
    // TODO: ideally we shouldn't even have to run this check in production :(
    // if this.debug is set, turn on debug mode
    if (this.debug) {
      this._debug();
    }
  }

  // update the rendered attributes
  __updatePostCollisionAttributes() {
    // Multiply by Time.dts to convert from matter to pew coords
    this.transform.position.x = this.collider.body.position.x;
    this.transform.position.y = this.collider.body.position.y;
    this.transform.angle = this.collider.body.angle * 180 / Math.PI;
  }

  // updates the sprite's position. Should be called after committing position
  __updateSprite(): void {
    this.sprite.pixi.position.set(
      this.transform.position.x,
      this.transform.position.y
    );
    this.sprite.pixi.anchor.set(
      this.sprite.anchor.x,
      this.sprite.anchor.y,
    );
    this.sprite.pixi.width = this.sprite.width;
    this.sprite.pixi.height = this.sprite.height;
    this.sprite.pixi.rotation = this.transform.angle * Math.PI / 180;
  }

  _debug(): void {
    // update the spriteOutline
    this._debugData.spriteOutline.clear();
    this._debugData.spriteOutline.lineStyle(2, 0x428ff4, 0.9);
    this._debugData.spriteOutline.drawRect(
      0,
      0,
      this.sprite.width,
      this.sprite.height,
    );

    this._debugData.spriteOutline.setTransform(
      this.transform.position.x,
      this.transform.position.y,
    )
    this._debugData.spriteOutline.rotation =
      this.transform.angle * Math.PI / 180;

    this._debugData.spriteOutline.pivot.x = this.sprite.width / 2;
    this._debugData.spriteOutline.pivot.y = this.sprite.width / 2;

    // update the colliderOutline
    if (this.collider) {
      this._debugData.colliderOutline.clear();
      this._debugData.colliderOutline.lineStyle(2, 0xf44265, 0.9);

      const path: Array<number> = this.collider.body.vertices.reduce((
        memo: Array<number>,
        vertex: Matter.Vector,
        index: number,
        arr: Array<Matter.Vector>,
      ): Array<number> => {
        memo.push(vertex.x);
        memo.push(vertex.y);
        if (index === arr.length - 1) {
          memo.push(arr[0].x);
          memo.push(arr[0].y);
        }
        return memo;
      }, []);
      this._debugData.colliderOutline.drawPolygon(path);
    }

  }

  // should be overridden
  onCollide(pair: Matter.Pair): void {
  };
  onCollideEnd(pair: Matter.Pair): void {
  };
  onCollideActive(pair: Matter.Pair): void {
  };

  // remove all references. Enforce asynchronicity so that it will finish one
  // update before executing
  destroy(): void {
    // We still need to set state for whether or not this object is destroyed
    // already
    // Imagine one huge object that gets hit by two other objects. It will try
    // to destroy itself twice no matter how you structure the contact cache
    if (this._destroyed) {
      return;
    }

    // TODO: for some reason this still gets called a bunch of times?
    // Problem: can't actually just let it run because if i call destroy() in
    // onCollide, the objects gets destroyed before the other objects get to use
    // it in their onCollide
    window.requestAnimationFrame((): void => {
      // TODO: I don't think I actually need to do any of the following
      delete this._id;
    });
    this._destroyed = true;
  }
}
