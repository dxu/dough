import SpatialHash from './spatialhash'
import Gob from './gob'

// TODO: Multiple game states might be necessary. For example, in Phaser, you can define Victory, Play, Intro, states, etc.
// TODO: handle sprite and asset preloading
export default class Game {

  // contains a spatial hash, gobs, renderer
  constructor(renderer, opts) {
    this.renderer = renderer

    // construct a spatial hash
    // TODO: tilesize hardcoded
    this.tileSize = renderer.width / 8
    this.spatialHash = new SpatialHash(this.tileSize)


    // eventlisteners
    this.eventListeners = {
      /*
        'keyup': {
          func: handler function,
          handlers: []
        }
      */
    }
    this.gobs = {
      /*
       * [gob_id]: gob
       */
    }
    this.stage = opts.stage

    // draws a grid of given tilesize
    this.grid = new PIXI.Graphics()
    this.grid.moveTo(0, 0)
    this.grid.lineStyle(1, 0x336699, 1)

    for (let i=0; i<=renderer.view.width; i+=this.tileSize) {
      this.grid.moveTo(i, 0)
      this.grid.lineTo(i, renderer.view.height)
    }
    for (let i=0; i<renderer.view.height; i+=this.tileSize) {
      this.grid.moveTo(0, i)
      this.grid.lineTo(renderer.view.width, i)
    }
    this.stage.addChild(this.grid)


    // this.hideGrid()
  }


  showGrid() {
    this.grid.visible = true
  }
  hideGrid() {
    this.grid.visible = false
  }

  // TODO: test this method
  // creates a gob of type GobClass
  createGob(opts, GobClass=Gob) {
    let gob = new GobClass(this, opts)
    this.stage.addChild(gob.data.sprite)
    this.gobs[gob._id] = gob
    // update the handlers with the handlers on this gob
    for (let event in gob.events) {
      this.registerEventHandler(event, gob.events[event])
    }
    gob.addRef(this)
  }

  // TODO: test this method
  // for destroy() and cleanup
  removeGob(gob) {
    delete this.gobs[gob._id]
    // remove all event handlers
    for (let event in gob.events) {
      this.registerEventHandler(event, gob.events[event])
    }
  }

  _createEventListenerHandler(event) {
    let that = this
    return function(evt) {
      that.eventListeners[event].handlers.map((handler) => {
        handler.call(this, evt)
      })
    }
  }

  // create an event listener
  _registerEventListener(event) {
    let listenerHandler = this._createEventListenerHandler(event)

    this.eventListeners[event] = {
      func: listenerHandler,
      handlers: []
    }
    this.renderer.view.addEventListener(event,
                                        listenerHandler)
  }

  // removes ALL handlers by removing the listener
  _removeEventListener(event) {
    this.renderer.view.removeEventListener(event,
                                        this.eventListeners[event].func)
    // this.eventListeners[event] = []
    delete this.eventListeners[event]
  }

  // register a handler for the event listener
  registerEventHandler(event, handler) {
    if (this.eventListeners[event] == null) {
      this._registerEventListener(event)
    }
    this.eventListeners[event].handlers.push(handler)
  }

  // TODO: remove single eventHandler
  removeEventHandler(event, handler) {
    this.eventListeners[event].handlers = this.eventListeners[event].handlers.filter(function(hand) {
      return handler !== hand
    })
  }

  // TODO: remove event listeners, destroy method



  // TODO: EXPERIMENTAL: How do we handle allowing the definition of updates from gobs themselves, as well as an overarching update?
  // Perhaps, have an internal method updateCanvas that delegates and calls all the updates
  //
  // TODO: in the future, if game states are implemented, the Game object should shift between the states to determine which update methods are called
  updateCanvas() {
    this.update()
    // TODO: should updates be passed any state?
    for (let gobId in this.gobs) {
      this.gobs[gobId].update()
      this.spatialHash.add(this.gobs[gobId])
    }
    // TODO: add everything back to the spatial hash
    //
    // TODO: physics responses
    // TODO: need to update spatial hash post physics response

    this.renderer.render(this.stage);
  }

  // TODO: in the future, if game states are implemented, this should be found in the game states. The Game object should shift between the states to determine which update methods are called
  //
  // run through the pool of objects and update all positions based on the velocities
  // Should be defined/overwritten when extended
  update() {}
}
