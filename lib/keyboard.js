/* @flow */
import {EVENTS, KEYS} from './constants/public';
import Key from './key';

import type Gob from './gob';
type optionsType = {
  canvas: HTMLCanvasElement,
};

// there should be one canvas per game, one keyboard per game,
//       hence one canvas per keyboard
// Note: Keyboard should never have a reference to gob
export default class Keyboard {
  static canvas: HTMLCanvasElement;

  static registeredGobs: {
    [id: string]: Gob,
  } = {};

  static keys = Object.keys(KEYS).reduce(
    (memo, k) => ((memo[KEYS[k]] = new Key(KEYS[k])), memo),
    {},
  );

  static registerGob(gob) {
    Keyboard.registeredGobs[gob.id] = gob;
  }

  // TODO: handle this better
  static clearRegisteredGobs() {
    Keyboard.registeredGobs = {};
  }

  static init({canvas}: {canvas: HTMLCanvasElement}) {
    Keyboard.canvas = canvas;

    // set up the event handlers
    Keyboard.canvas.addEventListener('keydown', (evt: KeyboardEvent): void => {
      // only execute the hold handlers if it's already down
      if (
        Keyboard.keys[evt.keyCode].pressed ||
        Keyboard.keys[evt.keyCode].held
      ) {
        Keyboard.keys[evt.keyCode].keyHold();
      } else {
        for (const id in Keyboard.registeredGobs) {
          console.log(Keyboard.registeredGobs[id]);
          Keyboard.registeredGobs[id].onKeyDown &&
            Keyboard.registeredGobs[id].onKeyDown(evt);
        }
        Keyboard.keys[evt.keyCode].keyDown();
      }
    });

    Keyboard.canvas.addEventListener('keyup', (evt: KeyboardEvent): void => {
      Keyboard.keys[evt.keyCode].keyUp();
    });
  }

  static getKeyDown(keyCode: number) {
    return Keyboard.keys[keyCode].pressed;
  }

  static getKeyHeld(keyCode: number) {
    return Keyboard.keys[keyCode].held;
  }

  // returns true if this is the first frame you released the key
  static getKeyUp(keyCode: number) {
    return Keyboard.keys[keyCode].released;
  }
}
