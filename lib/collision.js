import SpatialHash from './spatialhash'
import Vector2 from './vector2'
import ContactCache from './contactcache'

// this assumes object is centered
// TODO: replace with sat
function defaultTestCollide(gob1, gob2) {
  let l1 = gob1.position.x - gob1.width / 2,
      r1 = l1 + gob1.width,
      t1 = gob1.position.y - gob1.height / 2,
      b1 = t1 + gob1.height,
      l2 = gob2.position.x - gob2.width / 2,
      r2 = l2 + gob2.width,
      t2 = gob2.position.y - gob2.height / 2,
      b2 = t2 + gob2.height

      return (l1 > l2 && l1 < r2 && t1 > t2 && t1 < b2) ||
             (l1 > l2 && l1 < r2 && b1 > t2 && b1 < b2) ||
             (r1 > l2 && r1 < r2 && t1 > t2 && t1 < b2) ||
             (r1 > l2 && r1 < r2 && b1 > t2 && b1 < b2)
}


// run through every vertex and project it
function projectPolygonOntoVector(vertices, vector) {
  let min = Infinity
  let max = -Infinity
  vertices.map(function(vertex) {
    let val = Vector2.projectScalar(vertex, vector)
    min = Math.min(min, val)
    max = Math.max(max, val)
  })
  // represents the min -> max projection
  return new Vector2(min, max)
}

// TODO: for now it assumes both gobs are convex
function SAT(gob1, gob2) {
  // get the absolute vertices
  let vertices1 = gob1.getAbsoluteVertices()
  let vertices2 = gob2.getAbsoluteVertices()


  // gather the normals
  let normals = vertices1.map(function(vertex, index) {
      return Vector2.subtract(vertices1[(index + 1) % vertices1.length], vertex)
    }).map(function(edge) {
      return Vector2.normalized(edge)
    }).concat(
      vertices2.map(function(vertex, index) {
        return Vector2.subtract(vertices2[(index + 1) % vertices2.length], vertex)
      }).map(function(edge) {
        return Vector2.normalized(edge)
      })
    )

  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end

  for (let i=0; i<normals.length; i++) {
    let projection1 = projectPolygonOntoVector(vertices1, normals[i])
    let projection2 = projectPolygonOntoVector(vertices2, normals[i])
    // compare if there's an overlap.

    if (projection1.x > projection2.y || projection1.y < projection2.x) {
      return false
    }
  }

  return true
}



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
  update(gobs) {
    // add all gobs into the spatial hash
    for (let gobId in gobs) {
      this.spatialHash.add(gobs[gobId])
    }

    // TODO: Race condition: 2 bullets of different speed, will hit guy on same frame. should both be destroyed? probably.
    // for every gob determine if there is a collision
    for (let gobId in gobs) {
      let collidableGobs = this.spatialHash.getPossibleGobs(gobs[gobId])
      // console.log(collidableGobs)
      // console.log(Object.keys(collidableGobs).length)

      for (let i=0; i<collidableGobs.length; i++) {
        let gob1 = gobs[gobId]
        let gob2 = collidableGobs[i]
        this.contactCache[gobId] = this.contactCache[gobId] || {}
        this.contactCache[gob2._id] = this.contactCache[gob2._id] || {}
        // check if gob1 has ever collided with gob2 EVER before, or vice versa
        if (SAT(gob1, gob2) &&
            !this.contactCache[gob1._id][gob2._id] && !this.contactCache[gob2._id][gob1._id]) {
          gob1.onCollide(gob2)
          gob2.onCollide(gob1)
          // update contact cache
          this.contactCache[gob1._id][gob2._id] = true
        }

      }

      // for (let id in collidableGobs) {
      //   let gob1 = gobs[gobId]
      //   let gob2 = collidableGobs[id]
      //   this.contactCache[gobId] = this.contactCache[gobId] || {}
      //   this.contactCache[id] = this.contactCache[id] || {}

      //   // check if gob1 has ever collided with gob2 EVER before, or vice versa
      //   if (SAT(gob1, gob2) &&
      //       !this.contactCache[gob1._id][gob2._id] && !this.contactCache[gob2._id][gob1._id]) {
      //     gob1.onCollide(gob2)
      //     gob2.onCollide(gob1)
      //     // update contact cache
      //     this.contactCache[gob1._id][gob2._id] = true
      //   }
      // }
    }

    // free contactCache
    this.contactCache = {}
  }


}
