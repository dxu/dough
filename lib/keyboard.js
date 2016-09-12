import constants from './constants'

// set of constant events that are possible
const EVENTS = {
  KEYDOWN: 'onKeyDown',
  KEYHOLD: 'onKeyHold',
  KEYUP:   'onKeyUp'
}

// there should be one canvas per game, one keyboard per game, hence one canvas per keyboard
// Note: Keyboard should never have a reference to gob
export default class Keyboard {
  // takes in the canvas?
  constructor(opts) {
    this.canvas = opts.canvas

    this.keysPressed = {
      /*
       * keyCode: true/false
       */
    }

    // set of keydown handlers. We use a hash of gob_id: [ handlers.. ] to make remove more efficient
    this.handlerSets = {
      [EVENTS.KEYDOWN]: {
        // [keyCode]: {
        //   [gob_id]: [ handlers... ]
        // }
        //
        //
      },
      [EVENTS.KEYHOLD]: {},
      [EVENTS.KEYUP]: {}
    }

    // set up the event handlers
    this.canvas.addEventListener('keydown', (evt) => {
      // only execute the hold handlers if it's already down
      if (this.keysPressed[evt.keyCode]) {
        let handlerSet = this.handlerSets[EVENTS.KEYHOLD][evt.keyCode]
        for (let gobId in handlerSet) {
          handlerSet[gobId]()
        }
      } else {
        // otherwise, only execute the keyDown handlers
        this.keysPressed[evt.keyCode] = true

        let handlerSet = this.handlerSets[EVENTS.KEYDOWN][evt.keyCode]
        for (let gobId in handlerSet) {
          handlerSet[gobId]()
        }
      }

    })

    this.canvas.addEventListener('keyup', (evt) => {
      // for every keydown, register the key as pressed
      this.keysPressed[evt.keyCode] = false
      let handlerSet = this.handlerSets[EVENTS.KEYUP][evt.keyCode]
      for (let gobId in handlerSet) {
        handlerSet[gobId]()
      }
    })


    // TODO: initialize all of the handlerSets with all the keyCodes
    for (let set in this.handlerSets) {
      for (let key in constants.KEYS) {
        this.handlerSets[set][constants.KEYS[key]] = {}
      }
    }

  }

  isKeyPressed(keyCode) {
    return this.keysPressed[keyCode]
  }

  addGobEventHandlers(gob) {
      console.log(gob.events)
    for (let e in EVENTS) {
      let event = EVENTS[e]
      for (let keyCode in gob.events[event]) {
        // Note: bind to gob, just for ease of use! also, they should never need the ref to canvas
        this.handlerSets[event][keyCode][gob._id] =
          gob.events[event][keyCode].bind(gob)
      }
    }
  }

  // TODO: remove gob references, for on destroy
  removeGobEventHandlers(gob) {
    for (let event in EVENTS) {
      for (let keyCode in gob.events[event]) {
        delete this.handlerSets[event][keyCode][gob._id]
      }
    }
  }

}

