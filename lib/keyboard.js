import {EVENTS, KEYS} from './constants/public'
import Key from './key'

// there should be one canvas per game, one keyboard per game, hence one canvas per keyboard
// Note: Keyboard should never have a reference to gob
export default class Keyboard {
  // takes in the canvas?
  constructor(opts) {
    this.canvas = opts.canvas

    // holds the keys that have each of these handlers
    this.handlerSets = {
      [EVENTS.ONKEYDOWN]: {
        // keyCode: 1
      },
      [EVENTS.ONKEYUP]: {},
      [EVENTS.ONKEYHOLD]: {}
    }

    this.keys = {
      // keyCode: new Key()
    }

    // set up the event handlers
    this.canvas.addEventListener('keydown', (evt) => {
      // only execute the hold handlers if it's already down
      if (this.keys[evt.keyCode].pressed) {
        this.keys[evt.keyCode].keyHold()
      } else {
        this.keys[evt.keyCode].keyDown()
      }
    })

    this.canvas.addEventListener('keyup', (evt) => {
      this.keys[evt.keyCode].keyUp()
    })


    // initialize all of the Keys
    for (let keyCode in KEYS) {
      this.keys[KEYS[keyCode]] = new Key(KEYS[keyCode])
    }

  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode].pressed
  }

  // events comes in the form: {
  //  [eventType]: {
  //    [keyCode]: handlerFunc
  //  }
  // }
  addGobEventHandlers(id, events) {
    for (let eventType in events) {
      for (let keyCode in events[eventType]) {
        this.keys[keyCode].processHandler(eventType, id, events[eventType][keyCode])

        // update the handlersets
        this.handlerSets[eventType][keyCode] = 1
      }
    }
  }

  // TODO: remove gob references, for on destroy
  removeGobEventHandlers(id, events) {
    for (let eventType in events) {
      for (let keyCode in events[eventType]) {
        this.keys[keyCode].removeHandler(id, eventType)

        if (this.keys[keyCode].count === 0) {
          delete this.handlerSets[eventType][keyCode]
        }
      }
    }
  }

}

