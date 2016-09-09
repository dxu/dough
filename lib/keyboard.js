
// there should be one canvas per game, one keyboard per game, hence one canvas per keyboard
export default class Keyboard {
  // takes in the canvas?
  constructor(opts) {
    this.canvas = opts.canvas

    // eventlisteners
    this.eventListeners = {
      /*
        'keyup': {
          func: handler function,
          handlers: []
        }
      */
    }

    this.keysPressed = {
      /*
       * keyCode: true/false
       */
    }


    // setup keydown handler
    //
    this.registerEventHandler('keydown', (evt) => {
      // for every keydown, register the key as pressed
      this.keysPressed[evt.keyCode] = true
    })

    this.registerEventHandler('keyup', (evt) => {
      // for every keydown, register the key as pressed
      this.keysPressed[evt.keyCode] = false
    })

  }

  isKeyPressed(keyCode) {
    return this.keysPressed[keyCode]
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
    this.canvas.addEventListener(event, listenerHandler)
  }

  // removes ALL handlers by removing the listener
  _removeEventListener(event) {
    this.canvas.removeEventListener(event,
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


  // TODO: remove gob references, for on destroy
  removeGob() {

  }
}

