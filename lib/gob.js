/* @flow */
import Vector2 from './vector2';
import * as PIXI from 'pixi.js';
import {Time} from './constants/private';
import Matter from 'matter-js';

import {GobUtils, Utils} from './util';

import type Pool from './pool';


export type GobOptions = Object;

export default class Gob {
  _id: number;
  game: Pool;
  _destroyed: bool;

  vertices: Array<Vector2>;  // everything is derived from relativeVertices
  relativeVertices: Array<Vector2>;  // can be derived from width + height
  width: number;
  height: number;
  _edges: Array<Vector2>;
  _normals: Array<Vector2>;

  mass: number;
  position: Vector2;  // also, the center of mass
  velocity: Vector2;
  maxVelocity: Vector2;
  // TODO: should we even allow this
  acceleration: Vector2;  // Non rigid bodies only!! the gob's INITIAL acceleration.
  angle: number;
  angularVelocity: number;
  angularAcceleration: number;  // Non rigid bodies only!!

  rigidBody: bool;
  _body: Matter.Body;

  _aabb: Array<Vector2>;

  debug: bool;
  _debugData: Object;

  // Rendering data
  data: {
    sprite: {
      anchor: Object,
      rotation: number,
      scale: {
        set: Function,
      },
      parent: Object,
      width: number,
      height: number,
      position: {
        set: Function,
      },
    },
  };

  refs: {[id: string]: Pool};

  constructor(game: Pool, opts: GobOptions): void {
    if (opts.position == null) {
      throw new Error('Invalid game object. No position provided.');
    }
    if (opts.width && opts.height) {
      this.width = opts.width;
      this.height = opts.height;
      this.relativeVertices =
        GobUtils.calculateRelativeVertices(this.width, this.height);
    } else if (opts.relativeVertices != null) {
      this.relativeVertices = opts.relativeVertices;
      const {width, height} =
        GobUtils.calculateWidthAndHeight(this.relativeVertices);
      this.width = width;
      this.height = height;
    } else {
      throw new Error(`Invalid gob. You must provide at least relativeVertices
        or width + height`);
    }

    this._id = Utils.uuid();
    // default to no debug
    this.debug = opts.debug || false;
    this.refs = {
      [game._id]: game,
    };
    this.game = game;

    this.position.x = opts.position.x;
    this.position.y = opts.position.y;
    // defaults to no movement
    this.velocity = opts.velocity || new Vector2(0, 0);
    this.maxVelocity = opts.maxVelocity || new Vector2(0, 0);
    this.acceleration = opts.acceleration || new Vector2(0, 0);
    this.data = opts.data;

    this.updateDerived();

    this.data.sprite.anchor.set(0.5, 0.5);
    // TODO: allow separately setting the sprite width/height
    this.data.sprite.scale.set(
      this.width / this.data.sprite.width,
      this.height / this.data.sprite.height,
    );

    this.updateSprite();

    if (this.debug) {
      this._setupDebug(game);
      this._debug();
    }
  }

  // This is the method that is called invisibly to set up the rigidbody +
  // collider stuff
  __init() {
    // if it's a rigidBody, we have to create a body to be added to
    // the matter engine
    if (this.rigidBody) {
      this._body = Matter.Body.create({
        angle: this.angle,
        angularVelocity: this.angularVelocity,
        mass: this.mass,
        position: Matter.Vector.create(this.position.x, this.position.y),
        velocity: Matter.Vector.create(this.velocity.x, this.velocity.y),
      });
    }
    // if it has a collider defined, then we should create a Collider object


  }


  getVertices(): Array<Vector2> {
    return this.vertices;
  }

  // TODO: normals need to be updated when rotating!!!
  getNormals(): Array<Vector2> {
    return this._normals;
  }

  // add it as a ref
  _addRef(ref: Object): void {
    this.refs[ref._id] = ref;
  }

  _setupDebug(game: Pool): void {
    this._debugData = {};
    this._debugData.outline = new PIXI.Graphics();
    // Note: the outline will be added to the stage by the game object!
  }

  // this is the update that will get called privately,
  // ONLY IF it's not a rigid body!!
  // https://www.niksula.hut.fi/~hkankaan/Homepages/gravity.html
  // http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/
  // http://gafferongames.com/game-physics/integration-basics/
  _update(): void {
    // this will get overridden later if the engine detects there is a collision
    this.position.x = this.position.x + this.velocity.x * Time.dts;
    this.position.y = this.position.y + this.velocity.y * Time.dts;

    this.velocity.x = this.velocity.x + this.acceleration.x * Time.dts;
    this.velocity.y = this.velocity.y + this.acceleration.y * Time.dts;

    this.angularVelocity =
      this.angularVelocity + this.angularAcceleration;

    this.angle += this.angularVelocity;

    // same with derived values
    this.updateDerived();
  }

  // TODO: reuse the vectors (add the differences when it moves instead of
  // reinstantiating every vector)
  updateDerived(): void {
    GobUtils.updateDerived(this);
  }

  // TODO: is there any way to enforce that methods are run?
  // this is the update that is publicly called and should be overridden
  update(): void {}

  // this is where you add post checks
  _postCollisionUpdate(): void {
    this.updateSprite();
    // TODO: ideally we shouldn't even have to run this check in production :(
    // if this.debug is set, turn on debug mode
    if (this.debug) {
      this._debug();
    }
  }



  // updates the sprite's position. Should be called after committing position
  updateSprite(): void {
    this.data.sprite.position.set(this.position.x, this.position.y);
    this.data.sprite.rotation = this.angle * (Math.PI / 180);
  }

  _debug(): void {
    this._debugData.outline.clear();
    // update the position of the outline
    this._debugData.outline.position.x = this.position.x;
    this._debugData.outline.position.y = this.position.y;
    this._debugData.outline.lineStyle(1, 0x000000, 1);

    const path: Array<number> = this.relativeVertices.reduce((
      memo: Array<number>,
      vertex: Vector2,
      index: number,
      arr: Array<Vector2>,
    ): Array<number> => {
      memo.push(vertex.x);
      memo.push(vertex.y);
      if (index === arr.length - 1) {
        memo.push(arr[0].x);
        memo.push(arr[0].y);
      }
      return memo;
    }, []);
    this._debugData.outline.drawPolygon(path);
  }

  // should be overridden
  onCollide(obj: Object): void {}

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
      for (const index: string in this.refs) {
        this.refs[index].removeGob(this);
        delete this.refs[index];
      }

      // remove PIXI sprite from its parent
      this.data.sprite.parent.removeChild(this.data.sprite);

      // TODO: I don't think I actually need to do any of the following
      delete this._id;
      delete this.data;
      delete this.vertices;
      delete this.refs;
      delete this.position;
    });
    this._destroyed = true;
  }
}
