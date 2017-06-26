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
  getPixiResourceKey(gobClass: string, spriteKey) {
    return `${gobClass}${spriteKey}`;
  },

  stringToBuffer(str) {
    var len = str.length;
    var buf = new Buffer(len);
    for (var i = 0; i < len; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  },

  convertTileMapLayer(layerData) {
    const data = Utils.stringToBuffer(window.atob(layerData.data));
    layerData.data = new Uint32Array(data.buffer, 0, data.length / 4);
  },
};
