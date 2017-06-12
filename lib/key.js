import {EVENTS} from './constants/public';
export default class Key {
  keyCode: number;
  pressed: bool;
  held: bool;
  keyHandlers: Object;
  count: number;
  released: bool;
  //
  constructor(keyCode) {
    this.keyCode = keyCode;
    this.pressed = false;
    this.held = false;
    this.released = false;

    // all subscribed handlers
    this.keyHandlers = {
      // [EventType]: {
      //   id: handlerFunc
      //   ...
      // },
      // ...
    };

    // the number of handlers
    this.count = 0;
  }

  processHandler(eventType, id, handler) {
    this.keyHandlers[eventType] = this.keyHandlers[eventType] || {};
    this.keyHandlers[eventType][id] = handler;
    this.count++;
  }

  removeHandler(eventType, id) {
    delete this.keyHandlers[eventType][id];
    this.count--;
  }

  // should only be fired the first time it gets pressed, until the next time it gets pressed (after keyup)
  // assumes that the context is valid!
  keyDown(evt, context) {
    this.pressed = true;
    // assumes it's bound properly
    for (let id in this.keyHandlers[EVENTS.ONKEYDOWN]) {
      this.keyHandlers[EVENTS.ONKEYDOWN][id](evt);
    }
  }

  // should only be fired 2nd time and beyond
  keyHold(evt, context) {
    this.held = true;
    // if it's held, we want to indicate that no more keydown so that
    // keydown is only on the first press
    // this.pressed = false;
    // assumes it's bound properly
    for (let id in this.keyHandlers[EVENTS.ONKEYHOLD]) {
      this.keyHandlers[EVENTS.ONKEYHOLD][id](evt);
    }
  }

  keyUp(evt, context) {
    this.pressed = false;
    this.held = false;
    this.released = true;
    // reset released on the next event loop
    window.setTimeout(() => (this.released = false), 0);
    // assumes it's bound properly
    for (let id in this.keyHandlers[EVENTS.ONKEYUP]) {
      this.keyHandlers[EVENTS.ONKEYUP][id](evt);
    }
  }
}
