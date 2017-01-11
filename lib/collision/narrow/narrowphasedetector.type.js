/* @flow */
// the base interface for a broad phase collision detector

import type Gob from '../../gob';

// TODO: should i be using declare?
export interface NarrowPhaseDetector {
  // given a single Gob, return the gobs that potentially collide,
  // along with an optional data (e.g, MTV)
  checkPotentialCollisions(
    potentialCollisions: {
      [id: number]: {
        gob: Gob,
        collisions: Array<Gob>,
      }
    }
  ): Array<[Gob, Gob, ?Object]>;
}

