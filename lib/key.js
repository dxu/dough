export default class Key {
  //
  constructor(keyCode) {
    this.keyCode = keyCode

    // all subscribed handlers
    this.onKeyDownHandlers = {
      // id: handlerFunc
    }
    this.onKeyHoldHandlers = {
      // id: handlerFunc
    }
    this.onKeyUpHandlers = {
      // id: handlerFunc
    }
  }

  // should be called by Keyboard to add new handlers
  processKeyDownHandler(id, handler) {
    this.onKeyDownHandlers[id] = handler
  }

  processKeyUpHandler(id, handler) {
    this.onKeyUpHandlers[id] = handler
  }

  processKeyHoldHandlers(id, handler) {
    this.onKeyHoldHandlers[id] = handler
  }

  // should only be fired the first time it gets pressed, until the next time it gets pressed (after keyup)
  // assumes that the context is valid!
  keyDown(evt, context) {
    // assumes it's bound properly
    for (let id in this.onKeyDownHandlers) {
      this.onKeyDownHandlers[id](evt)
    }
  }

  // should only be fired 2nd time and beyond
  keyHold(evt, context) {
    // assumes it's bound properly
    for (let id in this.onKeyHoldHandlers) {
      this.onKeyHoldHandlers[id](evt)
    }
  }

  keyUp(evt, context) {
    // assumes it's bound properly
    for (let id in this.onKeyUpHandlers) {
      this.onKeyUpHandlers[id](evt)
    }
  }

}
