/* @flow */
// the base interface for a broad phase collision detector

import type Gob from '../../gob';

declare interface BroadPhaseDetector {
  // given a single Gob, return the gobs that potentially collide
  detectPotentialCollisions(gob: Gob): Array<Gob>;
  // given a set of gobs, this updates state needed for the broad phase detector
  update(gobs: Array<Gob>): void;
}
