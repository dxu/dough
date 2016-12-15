/* @flow */
import {EVENTS, KEYS} from './constants/public';
import Key from './key';

type optionsType = {
  canvas: HTMLCanvasElement,

};

// there should be one canvas per game, one keyboard per game,
//       hence one canvas per keyboard
// Note: Keyboard should never have a reference to gob
export default class Keyboard {
  canvas: HTMLCanvasElement;
  handlerSets: {
    [id: string]: Object,
  };
  keys: {
    [keycode: number]: Key,
  };
  // takes in the canvas?
  constructor(opts: optionsType): void {
    this.canvas = opts.canvas;

    // holds the keys that have each of these handlers
    this.handlerSets = {
      [EVENTS.ONKEYDOWN]: {
        // keyCode: 1
      },
      [EVENTS.ONKEYUP]: {},
      [EVENTS.ONKEYHOLD]: {},
    };

    this.keys = {
      // keyCode: new Key()
    };

    // set up the event handlers
    this.canvas.addEventListener('keydown', (evt: KeyboardEvent): void => {
      // only execute the hold handlers if it's already down
      if (this.keys[evt.keyCode].pressed) {
        this.keys[evt.keyCode].keyHold();
      } else {
        this.keys[evt.keyCode].keyDown();
      }
    });

    this.canvas.addEventListener('keyup', (evt: KeyboardEvent): void => {
      this.keys[evt.keyCode].keyUp();
    });


    // initialize all of the Keys
    for (const k: string in KEYS) {
      this.keys[KEYS[k]] = new Key(KEYS[k]);
    }
  }

  isKeyPressed(keyCode: number): bool {
    return this.keys[keyCode].pressed;
  }

  // events comes in the form: {
  //  [eventType]: {
  //    [keyCode]: handlerFunc
  //  }
  // }
  // TODO: add events type
  addGobEventHandlers(
    id: number,
    events: {
      [eventType: string]: {
        [keyCodeId: number]: Function,
      },
    },
  ): void {
    for (const eventType: string in events) {
      // $FlowFixMe: for in loops are broken: https://github.com/facebook/flow/issues/2970
      for (const keyCodeId: number in events[eventType]) {
        this.keys[keyCodeId].processHandler(
          eventType,
          id, events[eventType][keyCodeId],
        );
        // update the handlersets
        this.handlerSets[eventType][keyCodeId] = 1;
      }
    }
  }

  // TODO: remove gob references, for on destroy
  // TODO: add events type
  removeGobEventHandlers(
    id: number,
    events: {
      [eventType: string]: {
        [keyCodeId: number]: Function,
      },
    },
  ): void {
    for (const eventType: string in events) {
      // $FlowFixMe: for in loops are broken: https://github.com/facebook/flow/issues/2970
      for (const keyCode: number in events[eventType]) {
        this.keys[keyCode].removeHandler(id, eventType);
        if (this.keys[keyCode].count === 0) {
          delete this.handlerSets[eventType][keyCode];
        }
      }
    }
  }

}

