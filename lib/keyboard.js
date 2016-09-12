// there should be one canvas per game, one keyboard per game, hence one canvas per keyboard
export default class Keyboard {
  // takes in the canvas?
  constructor(opts) {
    this.canvas = opts.canvas

    this.keysPressed = {
      /*
       * keyCode: true/false
       */
    }

    // set up the event handlers
    this.canvas.addEventListener('keydown', function(evt) {
      // for every keydown, register the key as pressed
      this.keysPressed[evt.keyCode] = true

    })

    this.canvas.addEventListener('keyup', function(evt) {
      // for every keydown, register the key as pressed
      this.keysPressed[evt.keyCode] = false

    })

  }

  isKeyPressed(keyCode) {
    return this.keysPressed[keyCode]
  }

  addGobEventHandlers(gob) {

  }

  removeGobEventHandlers(gob) {

  }

  // TODO: remove gob references, for on destroy
  removeGob() {

  }
}

