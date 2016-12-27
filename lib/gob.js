/* @flow */
import util from './util';
import Vector2 from './vector2';
import type Pool from './pool';
import * as PIXI from 'pixi.js';

import {Time} from './constants/private';

class Gob {
  _id: number;
  _aabb: Array<Vector2>;
  _debugData: Object;
  _edges: Array<Vector2>;
  _normals: Array<Vector2>;
  _destroyed: bool;
  game: Pool;
  mass: number;
  position: Vector2;  // also, the center of mass
  velocity: Vector2;
  acceleration: Vector2;  // the gob's NATURAL acceleration.
  force: Vector2;  // external forces applied
  angularVelocity: number;
  // TODO: maxAngularVelocity and maxVelocity
  torque: number;
  inertia: number; // moment of inertia
  angle: number;
  vertices: Array<Vector2>;
  // everything is derived from relativeVertices
  relativeVertices: Array<Vector2>;
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
  friction: number;
  bounce: number;
  debug: bool;
  height: number;
  width: number;
  refs: {[id: string]: Pool};
  maxVelocity: Vector2;

  constructor(game: Pool, opts: Object): void {
    this._id = util.uuid();
    this._destroyed = false;
    this.mass = opts.mass != null ? opts.mass : 1;
    this.friction = opts.friction != null ? opts.friction : 1;
    this.bounce = opts.bounce != null ? opts.bounce : 1;
    this._normals = [];
    this.position = new Vector2(0, 0);
    this.angle = opts.angle || 0;
    this.angularVelocity = opts.angularVelocity || 0;
    this.torque = opts.torque != null ? opts.torque : 0;
    this.inertia = opts.inertia != null ? opts.inertia : 1;

    if (opts.position) {
      this.position.x = opts.position.x;
      this.position.y = opts.position.y;
      // 2D AABB consists of a this.position, and a this.width and this.height
      if (opts.width && opts.height) {
        this.width = opts.width;
        this.height = opts.height;
        this.relativeVertices = [
          new Vector2(-this.width / 2, -this.height / 2),
          new Vector2(this.width / 2, -this.height / 2),
          new Vector2(this.width / 2, this.height / 2),
          new Vector2(-this.width / 2, this.height / 2),
        ];
      } else if (opts.relativeVertices) {
        this.relativeVertices = opts.relativeVertices;
      } else {
        // A circle consists of a this.position, and a this.radius
        // TODO: not yet implemented! Implementing circle collision detection
        //       requires voronoi regions or some other way to convert the
        //       geometry into polygons
        throw new Error(`Invalid game object. A position was given, but neither
                         a radius nor [width && height] were given`);
      }
    } else {
      throw new Error('Invalid game object. No vertices or position provided.');
    }
    // set up the initial angle
    this.relativeVertices.map(
      (vertex: Vector2): Vector2 => vertex.rotate(this.angle),
    );
    this.calculateVertices();
    this.updateNormals();


    // defaults to no movement
    this.maxVelocity = opts.maxVelocity || new Vector2(0, 0);

    this.velocity = opts.velocity || new Vector2(0, 0);
    this.acceleration = opts.acceleration || new Vector2(0, 0);
    this.force = opts.force || new Vector2(0, 0);

    // generic optional data
    this.data = opts.data;

    // initialize a refs array. This will contain any other object that will
    // contain references
    // to this object
    this.refs = {
      [game._id]: game,
    };
    this.game = game;

    // TODO: completely separate sprite and image into a different class

    // default to 0.5, 0.5
    // TODO: allow this to be customized
    this.data.sprite.anchor.set(0.5, 0.5);

    // TODO: allow separately setting the sprite width/height
    this.data.sprite.scale.set(
      this.width / this.data.sprite.width,
      this.height / this.data.sprite.height,
    );

    this.updateSprite();

    // TODO: add handler for checking if a key is being pressed. SHOULD THIS BE
    //       HANDLED BY THE GAME?
    // answer: yes.

    // default false
    this.debug = opts.debug || false;

    if (this.debug) {
      this._setupDebug(game);
      this._debug();
    }
  }

  getVertices(): Array<Vector2> {
    return this.vertices;
  }

  // TODO: normals need to be updated when rotating!!!
  getNormals(): Array<Vector2> {
    return this._normals;
  }

  // should be implemented
  onCollide(obj: Object): void {}

  // add it as a ref
  addRef(ref: Object): void {
    this.refs[ref._id] = ref;
  }

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

  // recalculate the vertices and normals based on relativeVertices or
  // width/height
  calculateVertices(): void {
    // if there is a width and height, and isn't rotating/rotated then use AABB
    if (
      this.width && this.height &&
      this.angularVelocity === 0 && this.angle === 0
    ) {
      this.vertices = this._aabb = this.calculateAABB();
      return;
    }
    // otherwise, update absolute vertices, and
    this.vertices = this.relativeVertices.map((vertex: Vector2): Vector2 => {
      return Vector2.Sum(vertex, this.position);
    });
    this._aabb = this.calculateAABBFromVertices();
  }

  // update the vertices relative to center. Will update AABB together with the
  // vertices
  calculateAABB(): Array<Vector2> {
    // the AABB. Goes from TL, clockwise
    const aabb: Array<Vector2> = [
      new Vector2(0, 0), // TL
      new Vector2(0, 0), // TR
      new Vector2(0, 0), // BR
      new Vector2(0, 0), // BL
    ];

    // TL, BL
    aabb[0].x = aabb[3].x = this.position.x - this.width / 2;
    // TR, BR
    aabb[1].x = aabb[2].x = this.position.x + this.width / 2;

    // TL, BL
    aabb[0].y = aabb[1].y = this.position.y - this.height / 2;
    // TR, BR
    aabb[2].y = aabb[3].y = this.position.y + this.height / 2;

    return aabb;
  }

  calculateAABBFromVertices(): Array<Vector2> {
    let minX: number = 0;
    let minY: number = 0;
    let maxX: number = 0;
    let maxY: number = 0;
    // go through vertices
    this.vertices.map((vertex: Vector2): void => {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minX, vertex.y);
      maxX = Math.max(minX, vertex.x);
      maxY = Math.max(minX, vertex.y);
    });
    // the AABB. Goes from TL, clockwise
    const aabb: Array<Vector2> = [
      new Vector2(minY, minX), // TL
      new Vector2(minY, maxX), // TR
      new Vector2(maxY, minX), // BR
      new Vector2(maxY, maxX), // BL
    ];
    return aabb;
  }


  updateNormals(): void {
    this._edges = this.vertices.map((
      vertex: Vector2,
      index: number,
    ): Vector2 => {
      return Vector2.Difference(
        this.vertices[(index + 1) % this.vertices.length], vertex,
      );
    });

    this._normals = this._edges.map((vertex: Vector2): Vector2 => {
      return vertex.orthol();
    });
  }


  _setupDebug(game: Pool): void {
    this._debugData = {};
    this._debugData.outline = new PIXI.Graphics();
    // Note: the outline will be added to the stage by the game object!
  }

  // this is the update that will get called privately
  // https://www.niksula.hut.fi/~hkankaan/Homepages/gravity.html
  // http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/
  // http://gafferongames.com/game-physics/integration-basics/
  _update(): void {
    // this will get overridden later if the engine detects there is a collision
    this.position.x = this.position.x + this.velocity.x * Time.dts;
    this.position.y = this.position.y + this.velocity.y * Time.dts;

    // total acceleration is equal to this.acceleration + force acceleration
    const totalXAcceleration = this.acceleration.x + this.force.x / this.mass;
    const totalYAcceleration = this.acceleration.y + this.force.y / this.mass;

    this.velocity.x = this.velocity.x + totalXAcceleration * Time.dts;
    this.velocity.y = this.velocity.y + totalYAcceleration * Time.dts;

    this.angularVelocity =
      this.angularVelocity + ((this.torque / this.inertia) * Math.PI / 180);

    this.angle += this.angularVelocity;

    // same with derived values
    this.updateDerived();
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

  // THIS SHOULD BE USED ONLY IF YOU DO NOT WANT TO RELY ON THE AUTOMATIC
  // VELOCITY AND ACCELERATION CALCULATION DONE BY THE ENGINE! Only use this
  // if you are building custom code.
  updatePosition(xDiff: number, yDiff: number): void {
    this.position.x += xDiff;
    this.position.y += yDiff;
  }

  // updates the sprite's position. Should be called after committing position
  updateSprite(): void {
    this.data.sprite.position.set(this.position.x, this.position.y);
    this.data.sprite.rotation = this.angle * (Math.PI / 180);
  }

  // TODO: reuse the vectors (add the differences when it moves instead of
  // reinstantiating every vector)
  updateDerived(): void {
    this.relativeVertices.map(
      (vertex: Vector2): Vector2 => vertex.rotate(this.angularVelocity),
    );
    this.calculateVertices();
    this.updateNormals();
  }

  // add a max force at position
  addForceAtPosition(force: Vector2, position: Vector2): void {
    this.force.add(force.x, force.y);
    this.torque +=
      (position.x - this.position.x) * force.y -
      (position.y - this.position.y) * force.x;
  }

  // add a force directly to the center of mass
  addForce(force: Vector2): void {
    this.force.add(force.x, force.y);
  }

  // add a torque directly
  addTorque(torque: number): void {
    this.torque += torque;
  }

}

export default Gob;
