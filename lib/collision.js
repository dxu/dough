import SpatialHash from './spatialhash'

// this assumes object is centered
// TODO: replace with sat
function defaultTestCollide(gob1, gob2) {
  let l1 = gob1.position.x - gob1.size.width / 2,
      r1 = l1 + gob1.size.width,
      t1 = gob1.position.y - gob1.size.height / 2,
      b1 = t1 + gob1.size.height,
      l2 = gob2.position.x - gob2.size.width / 2,
      r2 = l2 + gob2.size.width,
      t2 = gob2.position.y - gob2.size.height / 2,
      b2 = t2 + gob2.size.height

      return (l1 > l2 && l1 < r2 && t1 > t2 && t1 < b2) ||
             (l1 > l2 && l1 < r2 && b1 > t2 && b1 < b2) ||
             (r1 > l2 && r1 < r2 && t1 > t2 && t1 < b2) ||
             (r1 > l2 && r1 < r2 && b1 > t2 && b1 < b2)
}


export default class CollisionEngine {

  constructor(tileSize) {
    this.tileSize = tileSize
    // initialize a spatialhash
    this.spatialHash = new SpatialHash(this.tileSize)

  }

  // takes in a map of gobs
  update(gobs) {
    // add all gobs into the spatial hash
    for (let gobId in gobs) {
      this.spatialHash.add(gobs[gobId])
    }

    // TODO: Race condition: 2 bullets of different speed, will hit guy on same frame. should both be destroyed? probably.
    // for every gob determine if there is a collision
    for (let gobId in gobs) {
      let collidableGobs = this.spatialHash.getPossibleGobs(gobs[gobId])

      for (let id in collidableGobs) {

        if (defaultTestCollide(gobs[gobId], collidableGobs[id])) {
          debugger
          gobs[gobId].onCollide(collidableGobs[id])
          collidableGobs[id].onCollide(gobs[gobId])
        }

      }

    }

  }


}
