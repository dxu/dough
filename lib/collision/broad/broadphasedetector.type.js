/* @flow */
// the base interface for a broad phase collision detector

import type Gob from '../../gob';

// TODO: should i be using declare?
export interface BroadPhaseDetector {
  // given a single Gob, return the gobs that potentially collide
  detectPotentialCollisions(changedGobs: Array<Gob>): {
    [id: number]: {
      gob: Gob,
      collisions: Array<Gob>,
    }
  };
  // given a set of gobs, this seeds state needed for the broad phase detector
  seed(gobs: Array<Gob>): void;

  empty(): void;
}

