/* @flow */

import type Gob from './gob';
import type GobOptions from './gob';
import Vector2 from './vector2';

let count: number = 0;

// TODO: create a type out of the id
export const Utils = {
  uuid(): number {
    return count++;
    // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    //     return v.toString(16);
    // });
  },
};
