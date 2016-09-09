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

class Gob {
  // NOTE: The parent container should be responsible for adding this to a stage. this should have
  // no knowledge of the game, spatial hash, or the stage
  constructor(game, opts) {
    // Generate uuid
    this._id = util.uuid()

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

    // generic optional data
    this.data = opts.data

    // initialize a refs array. This will contain any other object that will contain references
    // to this object
    this.refs = {
      [game._id]: game
    }
    this.game = game

    this.data.sprite.position.set(this.position.x, this.position.y);

    // default to 0.5, 0.5
    // TODO: allow this to be customized
    this.data.sprite.anchor.set(0.5, 0.5);

    this.data.sprite.scale.set(
      this.size.width / this.data.sprite.width,
      this.size.height / this.data.sprite.height
    );

    // represents keys that are being pressed
    this._keysPressed = {

    }

    // TODO: add handler for checking if a key is being pressed. SHOULD THIS BE HANDLED BY THE GAME?
    // answer: yes.

    // add default keyhandlers
  }

  // returns if a key is pressed
  keyIsPressed(keyCode) {
    return this._keysPressed != null
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
    // TODO: for some reason this still gets called a bunch of times?
    // Problem: can't actually just let it run because if i call destroy() in onCollide, the objects gets destroyed before the other objects get to use it in their onCollide
    window.setTimeout(() => {

      for (let index in this.refs) {
        this.refs[index].removeGob(this)
        this.refs[index] = null
      }

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
    }, 0)
  }

  update() {

  }
}

export default Gob
