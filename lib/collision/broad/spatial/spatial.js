/* @flow */

import Gob from '../../../gob';

import SpatialHash from './spatialhash.js'

// a broad phase collision solver using spatial hashes

export default class Spatial {
  spatialHash: SpatialHash
  tileSize: number;

  constructor(tileSize: number): void {
    this.tileSize = tileSize;
    this.spatialHash = new SpatialHash(this.tileSize);
  }

  detectPotentialCollisions(
    changedGobs: Array<Gob>
  ): {
    [id: number]: {
      gob: Gob,
      collisions: Array<Gob>,
    }
  } {
    const ret: {
      [id: number]: {
        gob: Gob,
        collisions: Array<Gob>,
      }
    } = {};

    for (let i = 0; i < changedGobs.length; i++) {
      ret[changedGobs[i]._id] = {
        gob: changedGobs[i],
        collisions: this.spatialHash.getPossibleGobs(changedGobs[i]),
      };
    }

    return ret;
  }

  seed(gobs: Array<Gob>): void {
    this.spatialHash.seed(gobs);
  }

  empty(): void {
    this.spatialHash.empty();
  }
}

