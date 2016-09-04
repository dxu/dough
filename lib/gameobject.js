import util from './util'
/*
 * A generic game object used as a basis for all objects instantiated with Pew
 * Should be extended to add functionality and overwrite collision methods
 *
 * @param opts
 *   Possible opts:
 *     - collidable
 *     - x
 *     - y
 *     - speed {x, y}
 *
 */

class GameObject {
  constructor(opts) {
    this.collidable = opts.collidable
    // TODO: enforce structure
    this.position = opts.position || { x: 0, y: 0 }
    this.speed = opts.speed || { x: 0, y: 0 }
    // TODO: scale, rotation, etc.

    // Generate uuid
    this._id = util.uuid()

  }

  // should be implemented
  onCollide(obj) {

  }
}

export default GameObject
