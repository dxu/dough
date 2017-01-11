/* @flow */
import Spatial from './broad/spatial/spatial';
import SATDetector from './narrow/SAT/detector';

import type Gob from '../gob';
import type {BroadPhaseDetector} from './broad/broadphasedetector.type';
import type {NarrowPhaseDetector} from './narrow/narrowphasedetector.type';
import ContactCache from './cache/contactcache';

// import checkCollision from './collision';

// TODO: contact cache should just store all checks to prevent duplicates, not
//       just the ones that collided
export default class CollisionEngine {
  tileSize: number;
  broadphase: BroadPhaseDetector;
  narrowphase: NarrowPhaseDetector;
  contactCache: ContactCache;

  constructor(tileSize: number): void {
    this.tileSize = tileSize;
    // initialize a spatialhash
    this.broadphase = new Spatial(this.tileSize);
    // TODO: this shouldn't have to be a class. Should be able to just be a
    // method. Both broad phase and narrow phase should be able to use class vs
    // function?
    // TODO: What if this was done in a precompile step? You build an engine
    // using configuration...
    this.narrowphase = new SATDetector();
    // this will just be a pairing of all collisions per update.
    // It should be cleared with each update!!
    // TODO: make contactcache shareable!!!
    this.contactCache = new ContactCache();
  }

  // takes in a map of gobs
  update(gobs: Array<Gob>, changedGobs: Array<Gob> = gobs): void {
    // maintain an array of pairs
    const pairs: Array<[Gob, Gob]> = [];

    // seed the broadphase

    // for each changed gob,

    // - go through the broadphase. broadphase should return a set of potential
    // collisions
    // add all gobs gnto the spatial hash
    this.broadphase.seed(gobs);
    this.contactCache.seed(gobs);

    const broad = this.broadphase.detectPotentialCollisions(changedGobs);

    // - pass the pairs into the narrow phase, get back an array of pairs

    const narrow = this.narrowphase.checkPotentialCollisions(broad);

    // pass array of pairs into resolver. Resolver will go through and solve all
    // physics constraints
    // TODO;

    // free contactCache
    this.contactCache.free();
    this.broadphase.empty();
  }
}
