/* @flow */
import util from './util';
import {Time} from './constants/private';
import Vector2 from './vector2';
import * as PIXI from 'pixi.js';
import type Pool from './pool';
/*
 * A generic game object (gob) used as a basis for all objects instantiated
 * with Pew
 * Should be extended to add functionality and overwrite collision methods
 *
 * @param opts
 *   Possible opts:
 *     - collidable
 *     - position vector {x, y}
 *     - velocity (vector) {x, y} - generally -1 <-> +1
 *     - data
 *
 * IMPORTANT: Every game object contains a destroy() method, which will manually
 *            remove all references to itself from objects (for example, the
 *            spatial hash) that may contain it by referencing the `refs`
 *            attribute and calling removeGob(). If you are using a custom data
 *            structure to contain these gobs, you should be adding
 *            CustomDataStructureInstanceX into the `refs` attribute of this gob
 *            within `CustomDataStructureInstanceX.add(gob)`, and implementing
 *            `CustomDataStructureInstanceX._removeGob(gob)` to remove any
 *            references to prevent memory leaks.
 *
 * NOTE: Every Gob will have an AABB (in terms of a center point and width +
 *       height), and a set of polygon points upon initialization (assuming
 *       valid inputs). You can specify the center point and the width+height
 *       within the options, or pass in a set of vertices. The set of polygon
 *       points are required for the SAT collision detection, and the AABB
 *       (in terms of width/height/center) is required for the Spatial Hash
 *       (to simplify calculating buckets)
 *
 * TODO: address how circles fit into the above. Won't need the set of polygon
 *       points unless you create a polygon out of a circle. Will probably need
 *       some separate representation for the voronoi algorithm. AABB won't be a
 *       problem.
 *
 * this.points = [Vector2, Vector2...]
 *
 * NOTE: position should be relative to the center!!
 *
 */

class Gob {
  _aabb: Array<Vector2>;
  _edges: Array<Vector2>;
  _normals: Array<Vector2>;
  _debugData: Object;

  // TODO: clean these two up
  _absoluteVertices: Array<Vector2>;
  _previousAbsoluteVertices: Array<Vector2>;

  _id: number;
  _destroyed: bool;
  _velocity: Vector2;
  _position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  // TODO: clean this up
  data: {
    sprite: {
      anchor: Object,
      scale: {
        set: Function,
      },
      parent: Object,
      width: number,
      height: number,
      position: {
        x: number,
        y: number,
      },
    },
  };
  friction: number;
  debug: bool;
  // sprite: PIXI.Sprite;
  height: number;
  width: number;
  refs: {[id: string]: Pool};
  game: Pool;
  maxVelocity: Vector2;
  vertices: Vector2;
  position: Vector2;
  mass: number;
  bounce: number;
  events: {
    onKeyDown?: {
      [id: number]: Function,
    },
    onKeyHold?: {
      [id: number]: Function,
    },
    onKeyUp?: {
      [id: number]: Function,
    },
  }

  // NOTE: The parent container should be responsible for adding this to a stage. this should have
  // no knowledge of the game, spatial hash, or the stage
  constructor(game: Pool, opts: Object): void {
    // Generate uuid
    this._id = util.uuid();
    this._destroyed = false;

    // default to 1
    this.mass = opts.mass != null ? opts.mass : 1;
    this.friction = opts.friction != null ? opts.friction : 1;
    this.bounce = opts.bounce != null ? opts.bounce : 1;


    this._position = new Vector2(0, 0);
    this.position = new Vector2(0, 0);

    // pairwise differences. The normals can be calculated by negating the edge
    this._edges = [];
    this._normals = [];

    // the AABB. Goes from TL, clockwise
    this._aabb = [
      new Vector2(0, 0), // TL
      new Vector2(0, 0), // TR
      new Vector2(0, 0), // BR
      new Vector2(0, 0), // BL
    ];
    // TODO: enforce vector2 somehow. probably have to rely on duck typing

    // A gob can have a number of shapes: a 2D AABB, a polygon, or a circle.
    if (opts.position) {
      this._position.x = opts.position.x;
      this._position.y = opts.position.y;
      this.position.x = opts.position.x;
      this.position.y = opts.position.y;
      // 2D AABB consists of a this._position, and a this.width and this.height
      if (opts.width && opts.height) {
        this.width = opts.width;
        this.height = opts.height;
        this.updateAABB();
      } else {
        // A circle consists of a this._position, and a this.radius
        // TODO: not yet implemented! Implementing circle collision detection
        //       requires voronoi regions or some other way to convert the
        //       geometry into polygons
        throw new Error(`Invalid game object. A position was given, but neither
                         a radius nor [width && height] were given`);
      }
    } else {
      throw new Error('Invalid game object. No vertices or position provided.');
    }

    // defaults to no movement
    this.maxVelocity = opts.maxVelocity || new Vector2(0, 0);


    // defaults
    this._velocity = opts.velocity || new Vector2(0, 0);
    this.velocity = new Vector2(this._velocity.x, this._velocity.y);
    this.acceleration = opts.acceleration || new Vector2(0, 0);

    // TODO: do we need scalar speed?

    // generic optional data
    this.data = opts.data;

    // initialize a refs array. This will contain any other object that will contain references
    // to this object
    this.refs = {
      [game._id]: game,
    };
    this.game = game;

    // TODO: completely separate sprite and image into a different class
    this.data.sprite.position.set(this._position.x, this._position.y);

    // default to 0.5, 0.5
    // TODO: allow this to be customized
    this.data.sprite.anchor.set(0.5, 0.5);

    // TODO: allow separately setting the sprite width/height
    this.data.sprite.scale.set(
      this.width / this.data.sprite.width,
      this.height / this.data.sprite.height,
    );

    // TODO: add handler for checking if a key is being pressed. SHOULD THIS BE HANDLED BY THE GAME?
    // answer: yes.

    // default false
    this.debug = opts.debug || false;

    if (this.debug) {
      this._setupDebug(game);
    }
  }

  // update the vertices relative to center. Will update AABB together with the vertices
  updateAABB(): void {
    // TL, BL
    this._aabb[0].x = this._aabb[3].x = this._position.x - this.width / 2;
    // TR, BR
    this._aabb[1].x = this._aabb[2].x = this._position.x + this.width / 2;

    // TL, BL
    this._aabb[0].y = this._aabb[1].y = this._position.y - this.height / 2;
    // TR, BR
    this._aabb[2].y = this._aabb[3].y = this._position.y + this.height / 2;

    this._edges = this._aabb.map((vertex: Vector2, index: number): Vector2 => {
      return Vector2.Difference(
        this._aabb[(index + 1) % this._aabb.length], vertex,
      );
    });

    this._normals = this._edges.map((vertex: Vector2): Vector2 => {
      return vertex.orthol();
    });
  }

  // TODO: NOT TESTED! DO NOT USE YET!! DOESN'T UPDATE PREVIOUS ABSOLUTE
  // VERTICES
  //
  // optional prevVertices to allow for seeding the previous vertices. normally
  // will just copy the old absolute vertices
  changeAbsoluteVertices(
    vertices: Array<Vector2>,
    prevVertices: Array<Vector2>,
  ): void {
    // update previousAbsoluteVertices
    if (prevVertices == null) {
      this._absoluteVertices.forEach((vertex: Vector2, index: number): void => {
        this._previousAbsoluteVertices[index].x = vertex.x;
        this._previousAbsoluteVertices[index].x = vertex.y;
      });
    } else {
      this._previousAbsoluteVertices = prevVertices;
    }
    this._absoluteVertices = vertices;
    // update edges
    this._edges = vertices.map((vertex: Vector2, index: number): Vector2 => {
      return Vector2.Difference(
        vertices[(index + 1) % vertices.length], vertex,
      );
    });
    this._normals = this._edges.map((vertex: Vector2): Vector2 => {
      return vertex.orthol();
    });
  }

  // get absolute vertices, instead of relative to the center
  getAbsoluteVertices(): Array<Vector2> {
    return this._absoluteVertices;
  }

  getAABB(): Array<Vector2> {
    return this._aabb;
  }

  // get previous absolute vertices
  getPreviousAbsoluteVertices(): Array<Vector2> {
    return this._previousAbsoluteVertices;
  }

  getEdges(): Array<Vector2> {
    return this._edges;
  }

  // TODO: normals need to be updated when rotating!!!
  getNormals(): Array<Vector2> {
    return this._normals;
  }

  // should be implemented
  onCollide(obj: Object): void {
  }

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
      delete this._position;
    });
    this._destroyed = true;
  }

  _preUpdate(): void {
    if (this.debug) {
      this._debugData.previousPosition = this._position.clone();
    }
  }

  // this is the update that will get called privately
  // https://www.niksula.hut.fi/~hkankaan/Homepages/gravity.html
  // http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/
  // http://gafferongames.com/game-physics/integration-basics/
  _update(): void {
    // update velocity based on acceleration
    this._position.x = this.position.x;
    this._position.y = this.position.y;

    this._velocity.x = this.velocity.x;
    this._velocity.y = this.velocity.y;

    // this will get overridden later if the engine detects there is a collision
    this.position.x = this._position.x + this._velocity.x * Time.dts;
    this.position.y = this._position.y + this._velocity.y * Time.dts;

    // same with derived values
    this.updateDerived();

    // this.updatePosition(this._velocity.x * Time.dts, this._velocity.y * Time.dts)

    // this.velocity.x = this._velocity.x + this.acceleration.x * Time.dts
    // this.velocity.y = this._velocity.y + this.acceleration.y * Time.dts
    // console.log('next', this._velocity, this.velocity)
  }

  // TODO: is there any way to enforce that methods are run?
  // this is the update that is publicly called and should be overridden
  update(): void {}

  // this is where you add post checks
  _postUpdate(): void {
    this.updateSprite();
    // TODO: ideally we shouldn't even have to run this check in production :(
    // if this.debug is set, turn on debug mode
    if (this.debug) {
      this._debug();
    }
  }

  _postCollisionUpdate(): void {}

  _setupDebug(game: Pool): void {
    this._debugData = {};
    this._debugData.outline = new PIXI.Graphics();
    this._debugData.outline.lineStyle(1, 0x000000, 1);

    const a: Array<number> = this._aabb.reduce((
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
    this._debugData.outline.drawPolygon(a);

    this._debugData.previousPosition = this._position.clone();
    // Note: the outline will be added to the stage by the game object!
  }

  _debug(): void {
    // update the position of the outline
    // let xDiff = this._position.x - this._previousPosition.x
    // let yDiff = this._position.y - this._previousPosition.y
    this._debugData.outline.position.x += this._position.x - this._debugData.previousPosition.x;
    this._debugData.outline.position.y += this._position.y - this._debugData.previousPosition.y;
  }

  // THIS SHOULD BE USED ONLY IF YOU DO NOT WANT TO RELY ON THE AUTOMATIC
  // VELOCITY AND ACCELERATION CALCULATION DONE BY THE ENGINE! Only use this
  // if you are building custom code.
  updatePosition(xDiff: number, yDiff: number): void {
    this._position.x += xDiff;
    this._position.y += yDiff;
  }

  // updates the sprite's position. Should be called after committing position
  updateSprite(): void {
    this.data.sprite.position.y = this._position.y;
    this.data.sprite.position.x = this._position.x;
  }

  // takes in an x and y to update the derived values - AABB,
  // previousAbsoluteVertices, absoluteVertices, etc.
  updateDerived(): void {
    // let xDiff = this._position.x - this._previousPosition.x
    // let yDiff = this._position.y - this._previousPosition.y

    // if (xDiff !== 0 || yDiff !== 0) {
    //   // update all absolute vertices with the position - previousposition
    //   this._absoluteVertices.map((vert, index) => {
    //     // console.log('updating prev')
    //     // update the previous
    //     this._previousAbsoluteVertices[index].x = vert.x
    //     this._previousAbsoluteVertices[index].y = vert.y
    //     vert.add(xDiff, yDiff)
    //   })
    // }
    this.updateAABB();
  }

}

export default Gob;
