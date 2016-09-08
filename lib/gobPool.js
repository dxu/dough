import SpatialHash from './spatialhash'

// TODO: Multiple game states might be necessary. For example, in Phaser, you can define Victory, Play, Intro, states, etc.
class Game {
  // contains a spatial hash, gobs, renderer
  constructor(renderer) {
    this.renderer = renderer

    // construct a spatial hash
    // TODO: tilesize hardcoded
    this.spatialHash = new SpatialHash(renderer.width / 8)


    // eventlisteners
    this.eventListeners = {
      /*
        'keyup': {
          event: '',
          handlers: []
        }
      */
    }
    this.gobs = {
      /*
       * [gob_id]: gob
       */
    }

  }

  // creates a gob of type GobClass
  createGob(GobClass, opts) {


  }

  // create an event listener
  _registerEventListener(event) {
    let that = this
    this.eventListeners[event] = {
      [event]: this.renderer.view.addEventListener(event, function(evt) {
            for (let handler in that.eventListeners[event].handlers) {
              handler.call(this, evt)
            }
          }),
      handlers: []
    }
  }

  // register a handler for the event listener
  registerEventHandler(event, handler) {
    if (this.eventListeners[event] == null) {
      this._registerEventListener(event)
    }
    this.eventListeners[event].handlers.push[handler]
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
    this.gobs.map(function(gob) {
      gob.update()
    })
    // TODO: add everything back to the spatial hash
    //
    // TODO: physics responses
    // TODO: need to update spatial hash post physics response

  }

  // TODO: in the future, if game states are implemented, this should be found in the game states. The Game object should shift between the states to determine which update methods are called
  //
  // run through the pool of objects and update all positions based on the velocities
  // Should be defined/overwritten when extended
  update() {}
}
