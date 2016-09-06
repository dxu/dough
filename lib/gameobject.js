import util from './util'
/*
 * A generic game object used as a basis for all objects instantiated with Pew
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
 */

class GameObject {
  constructor(opts) {
    this.collidable = opts.collidable
    // TODO: enforce structure
    this.position = opts.position || { x: 0, y: 0 }
    // should be absolute valued
    this.speed = opts.speed || { x: 0, y: 0 }
    // defaults to no movement
    this.velocity = { x: 0, y: 0 }
    // TODO: scale, rotation, etc.
    // TODO: scale and width/height should not both be defined
    this.size = opts.size || {
      width: 100,
      height: 100
    }

    // Generate uuid
    this._id = util.uuid()
    // generic optional data
    this.data = opts.data

  }

  // should be implemented
  onCollide(obj) {

  }
}

export default GameObject
