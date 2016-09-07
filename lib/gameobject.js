import util from './util'
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

    // initialize a refs array. This will contain any other object that will contain references
    // to this object
    this.refs = []


  }

  // should be implemented
  onCollide(obj) {
    this.destroy()
  }

  addRef(ref) {
    this.refs.push(ref)
  }

  // remove all references. Enforce asynchronicity so that it will finish one update before executing
  destroy() {
    console.log('this id', this._id)
    window.requestAnimationFrame(() => {
      this.refs.map((ref, index) => {
        ref.removeGob(this)
        this[index] = null
      })

      // remove PIXI sprite from its parent
      this.data.sprite.parent.removeChild(this.data.sprite)

      // TODO: I don't think I actually need to do any of the following
      this._id = null
      this.data = null
      this.size = null
      this.refs = null
      this.speed = null
      this.position = null
      this.collidable = null
    })
  }
}

export default GameObject
