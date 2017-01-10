/* @flow */

import type Gob from '../../gob';

type Cache = {
  [name: number]: Object
}

// a simple cache backed by an object
class ContactCache {
  cache: Cache;
  constructor(): void {
    this.cache = {};
  }

  // TODO: revisit this API.
  // initialize the ContactCache with seed data
  seed(gobs: Array<Gob>): void {
    for (let i = 0; i < gobs.length; i++) {
      this.cache[gobs[i]._id] = {};
    }
  }

  add(gob: Gob): void {
    this.cache[gob._id] = {};
  }

  // mark an object as checked
  mark(gob1: Gob, gob2: Gob): void {
    this.cache[gob1._id][gob2._id] = true;
  }

  // see if a gob has already been checked
  checked(gob1: Gob, gob2: Gob): bool {
    return !this.cache[gob1._id][gob2._id] &&
      !this.cache[gob2._id][gob1._id]
  }

  free(): void {
    this.cache = {};
  }
}

export default ContactCache;
