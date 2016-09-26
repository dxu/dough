import util from './util'
import {Time} from './constants/private'
import Vector2 from './vector2'
/*
 * A generic game object (gob) used as a basis for all objects instantiated with Pew
 * Should be extended to add functionality and overwrite collision methods
 *
 * @param opts
 *   Possible opts:
 *     - collidable
 *     - position vector {x, y}
 *     - speed (scalar) {x, y}
 *     - velocity (vector) {x, y} - generally -1 <-> +1
 *     - data
 *
 * IMPORTANT: Every game object contains a destroy() method, which will manually remove all references
 *            to itself from objects (for example, the spatial hash) that may contain it by referencing
 *            the `refs` attribute and calling removeGob(). If you are using a custom data structure to
 *            contain these gobs, you should be adding CustomDataStructureInstanceX into the `refs`
 *            attribute of this gob within `CustomDataStructureInstanceX.add(gob)`, and implementing
 *            `CustomDataStructureInstanceX._removeGob(gob)` to remove any references to prevent
 *            memory leaks.
 *
 * NOTE: Every Gob will have an AABB (in terms of a center point and width + height), and a set of polygon points upon initialization (assuming valid inputs). You can specify the center point and the width+height within the options, or pass in a set of vertices. The set of polygon points are required for the SAT collision detection, and the AABB (in terms of width/height/center) is required for the Spatial Hash (to simplify calculating buckets)
 *
 * TODO: address how circles fit into the above. Won't need the set of polygon points unless you create a polygon out of a circle. Will probably need some separate representation for the voronoi algorithm. AABB won't be a problem.
 *
 * this.points = [Vector2, Vector2...]
 *
 * NOTE: position should be relative to the center!!
 *
 */

class Gob {
  // NOTE: The parent container should be responsible for adding this to a stage. this should have
  // no knowledge of the game, spatial hash, or the stage
  constructor(game, opts) {
    // Generate uuid
    this._id = util.uuid()
    this._destroyed = false

    // default to 1
    this.mass = opts.mass || 1

    // default
    this.events = {}

    this.collidable = opts.collidable

    this._previousPosition = new Vector2(0, 0)
    this.position = new Vector2(0, 0)

    this._absoluteVertices = []
    // pairwise differences. The normals can be calculated by negating the edge
    this._edges = []
    this._normals = []

    // the AABB
    this._aabb = {
      tl: new Vector2(0, 0),
      tr: new Vector2(0, 0),
      bl: new Vector2(0, 0),
      br: new Vector2(0, 0)
    }
    // TODO: enforce vector2 somehow. probably have to rely on duck typing

    // A gob can have a number of shapes: a 2D AABB, a polygon, or a circle.
    if (opts.position) {
      this.position.x = opts.position.x
      this.position.y = opts.position.y
      this._previousPosition.x = opts.position.x
      this._previousPosition.y = opts.position.y
      // 2D AABB consists of a this.position, and a this.width and this.height
      if (opts.width && opts.height) {
        this.width = opts.width
        this.height = opts.height
        this.updateAABB()
        this.changeAbsoluteVertices([this._aabb.tl, this._aabb.tr, this._aabb.br, this._aabb.bl])
      }
      // A circle consists of a this.position, and a this.radius
      // TODO: not yet implemented! Implementing circle collision detection requires voronoi regions or some other way to convert the geometry into polygons
      else {
        throw new Error('Invalid game object. A position was given, but neither a radius nor [width && height] were given')

      }
    // } else if (opts.vertices && opts.vertices.length !== 0) {
    //   // TODO: Even if we support the polygon, we should still find the AABB for the spatial hash
    //   let farthestLeft = 0
    //   let farthestRight = 0
    //   let farthestTop = 0
    //   let farthestBottom = 0
    //   opts.vertices.map(function(vertex) {
    //     farthestLeft = Math.min(farthestLeft, vertex.x)
    //     farthestRight = Math.max(farthestRight, vertex.x)
    //     farthestBottom = Math.min(farthestBottom, vertex.y)
    //     farthestTop = Math.max(farthestTop, vertex.y)
    //   })
    //   // position is the midpoint (and, the center of the AABB)
    //   this.position = new Vector2((farthestRight + farthestLeft) / 2, (farthestTop + farthestBottom) / 2)
    //   this.width = farthestRight - farthestLeft
    //   this.height = farthestTop - farthestBottom

    //   // if there's no position, then there must be a set of vertices
    //   this.vertices = opts.vertices.map((vertex) => {
    //     return Vector2.subtract(vertex, this.position)
    //   })
    } else {
      throw new Error('Invalid game object. No vertices or position provided.')
    }

    // defaults to no movement
    this.maxVelocity = opts.maxVelocity || new Vector2(0, 0)


    // defaults
    this.velocity = opts.velocity || new Vector2(0, 0)
    this.acceleration = opts.acceleration || new Vector2(0, 0)

    // TODO: do we need scalar speed?

    // generic optional data
    this.data = opts.data

    // initialize a refs array. This will contain any other object that will contain references
    // to this object
    this.refs = {
      [game._id]: game
    }
    this.game = game

    // TODO: completely separate sprite and image into a different class
    this.data.sprite.position.set(this.position.x, this.position.y);

    // default to 0.5, 0.5
    // TODO: allow this to be customized
    this.data.sprite.anchor.set(0.5, 0.5);

    // TODO: allow separately setting the sprite width/height
    this.data.sprite.scale.set(
      this.width / this.data.sprite.width,
      this.height / this.data.sprite.height
    );

    // TODO: add handler for checking if a key is being pressed. SHOULD THIS BE HANDLED BY THE GAME?
    // answer: yes.



    // default false
    this.debug = opts.debug || false

    if (this.debug) this._setupDebug(game)
  }

  // update the vertices relative to center. Will update AABB together with the vertices
  updateAABB() {
    this._aabb.tl.x = this._aabb.bl.x = this.position.x - this.width / 2
    this._aabb.tr.x = this._aabb.br.x = this.position.x + this.width / 2

    this._aabb.tl.y = this._aabb.tr.y = this.position.y - this.height / 2
    this._aabb.bl.y = this._aabb.br.y = this.position.y + this.height / 2
  }

  // TODO: NOT TESTED!
  changeAbsoluteVertices(vertices) {
    this._absoluteVertices = vertices
    // update edges
    this._edges = vertices.map(function(vertex, index) {
      return Vector2.Subtract(vertices[(index + 1) % vertices.length], vertex)
    })
    this._normals = this._edges.map(function(vertex) {
      return vertex.orthol()
    })
  }

  // get absolute vertices, instead of relative to the center
  getAbsoluteVertices() {
    return this._absoluteVertices
  }

  getEdges() {
    return this._edges
  }

  getNormals() {
    return this._normals
  }

  // should be implemented
  onCollide(obj) {
  }

  // add it as a ref
  addRef(ref) {
    this.refs[ref._id] = ref
  }

  // remove all references. Enforce asynchronicity so that it will finish one update before executing
  destroy() {
    // We still need to set state for whether or not this object is destroyed already
    // Imagine one huge object that gets hit by two other objects. It will try to destroy itself twice
    // no matter how you structure the contact cache
    if (this._destroyed) {
      return
    }

    // TODO: for some reason this still gets called a bunch of times?
    // Problem: can't actually just let it run because if i call destroy() in onCollide, the objects gets destroyed before the other objects get to use it in their onCollide
    window.requestAnimationFrame(() => {

      for (let index in this.refs) {
        this.refs[index].removeGob(this)
        this.refs[index] = null
      }

      // remove PIXI sprite from its parent
      this.data.sprite.parent.removeChild(this.data.sprite)

      // TODO: I don't think I actually need to do any of the following
      this._id = null
      this.data = null
      this.vertices = null
      this.refs = null
      this.speed = null
      this.position = null
      this.collidable = null
    })
    this._destroyed = true
  }

  _preUpdate() {
    this._previousPosition.x = this.position.x
    this._previousPosition.y = this.position.y
  }

  // this is the update that will get called privately
  _update() {

    // https://www.niksula.hut.fi/~hkankaan/Homepages/gravity.html
    // http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/
    // http://gafferongames.com/game-physics/integration-basics/

    // update velocity based on acceleration
    let dv = this.acceleration.x * Time.dts
    this.velocity.x += this.acceleration.x * Time.dts
    this.velocity.y += this.acceleration.y * Time.dts

    this.position.x += this.velocity.x * Time.dts
    this.position.y += this.velocity.y * Time.dts

    this.data.sprite.position.y = this.position.y;
    this.data.sprite.position.x = this.position.x;


  }

  // TODO: is there any way to enforce that methods are run?
  // this is the update that is publicly called and should be overridden
  update() {

  }

  // this is where you add post checks
  _postUpdate() {
    let xDiff = this.position.x - this._previousPosition.x
    let yDiff = this.position.y - this._previousPosition.y

    if (xDiff !== 0 && yDiff !== 0) {
      // update all absolute vertices with the position - previousposition
      this._absoluteVertices.map(function(vert) {
        vert.add(xDiff, yDiff)
      })
    }
    this.updateAABB()
  }

  _postCollisionUpdate() {
    // TODO: ideally we shouldn't even have to run this check in production :(
    // if this.debug is set, turn on debug mode
    if (this.debug) this._debug()
  }


  _setupDebug(game) {
    this._debugData = {}
    this._debugData.outline = new PIXI.Graphics()
    this._debugData.outline.lineStyle(1, 0x000000, 1)
    this._debugData.outline.drawPolygon(this._absoluteVertices.reduce(function(memo, vertex, index, arr) {
      memo.push(vertex.x)
      memo.push(vertex.y)
      if (index === arr.length - 1) {
        memo.push(arr[0].x)
        memo.push(arr[0].y)
      }
      return memo
    }, []))

    // Note: the outline will be added to the stage by the game object!
  }

  _debug() {
    // update the position of the outline
    let xDiff = this.position.x - this._previousPosition.x
    let yDiff = this.position.y - this._previousPosition.y
    this._debugData.outline.position.x += xDiff
    this._debugData.outline.position.y += yDiff
  }
}

export default Gob
