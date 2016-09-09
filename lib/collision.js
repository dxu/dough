import SpatialHash from './spatialhash'
export default class CollisionEngine {

  constructor(tileSize) {
    this.tileSize = tileSize
    // initialize a spatialhash
    this.spatialHash = new SpatialHash(this.tileSize)

  }

  // takes in a map of gobs
  update(gobs) {
    for (let gobId in gobs) {
      this.spatialHash.add(gobs[gobId])
    }

  }


}
