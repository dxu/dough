import SpatialHash from './spatialhash'

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

  }

  // creates a gob of type GobClass
  createGob(GobClass, opts) {


  }

  // create an event listener
  _registerEventListener(event) {
    let that = this
    this.eventListeners[event] = {
      `${event}`: this.renderer.view.addEventListener(event, function(evt) {
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

  // run through the pool of objects and update all positions based on the velocities
  update() {


  }
}
