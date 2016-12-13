import SpatialHash from '../spatialhash'
import {SAT, movingSAT, resolveCollision} from './collision'


// TODO: contact cache should just store all checks to prevent duplicates, not just the ones that collided
export default class CollisionEngine {
  constructor(tileSize) {
    this.tileSize = tileSize
    // initialize a spatialhash
    this.spatialHash = new SpatialHash(this.tileSize)
    // this will just be a pairing of all collisions per update.
    // It should be cleared with each update!!
    // TODO: make contactcache shareable!!!
    this.contactCache = {}
  }

  // takes in a map of gobs
  update(gobs, changedGobs=gobs) {
    // add all gobs into the spatial hash
    for (let i=0; i<gobs.length; i++) {
      this.spatialHash.add(gobs[i])
      this.contactCache[gobs[i]._id] = {}
    }

    // TODO: Race condition: 2 bullets of different speed, will hit guy on same frame. should both be destroyed? probably.
    // for every gob determine if there is a collision
    for (let i=0; i<changedGobs.length; i++) {
      let collidableBuckets = this.spatialHash.getPossibleGobs(changedGobs[i])

      // for each gob in each bucket
      for (let j=0; j<collidableBuckets.length; j++) {
        for (let k=0; k<collidableBuckets[j].length; k++) {
          let gob1 = changedGobs[i]
          let gob2 = collidableBuckets[j][k]
          let partialTimeStep
          let MTV

          // check if gob1 has been checked with gob2
          if (
            gob1._id !== gob2._id &&
            !this.contactCache[gob1._id][gob2._id] &&
            !this.contactCache[gob2._id][gob1._id]
          ) {
            // if both are immobile, use regular SAT, otherwise movingSAT
            const method = gob1._velocity.isZero() && gob2._velocity.isZero() ?
              SAT :
              movingSAT

            if (method(gob1, gob2)) {
              gob1.onCollide(gob2)
              gob2.onCollide(gob1)
            }
          }
          this.contactCache[gob1._id][gob2._id] = true
        }
      }
    }

    // free contactCache
    this.contactCache = {}
    this.spatialHash.empty()
  }
}
