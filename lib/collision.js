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
    let val = Vector2.ProjectScalar(vertex, vector)
    min = Math.min(min, val)
    max = Math.max(max, val)
  })
  // represents the min -> max projection
  return new Vector2(min, max)
}

// return true if projection oerlaps
function checkProjectionOverlap(vertices1, vertices2, vector) {
  let min1 = Infinity
  let max1 = -Infinity
  let min2 = Infinity
  let max2 = -Infinity
  vertices1.map(function(vertex) {
    let val = Vector2.ProjectScalar(vertex, vector)
    min1 = Math.min(min1, val)
    max1 = Math.max(max1, val)
  })

  vertices2.map(function(vertex) {
    let val = Vector2.ProjectScalar(vertex, vector)
    min2 = Math.min(min2, val)
    max2 = Math.max(max2, val)
  })

  return min1 > max2 || max1 < min2
}

// TODO: for now it assumes both gobs are convex
function SAT(gob1, gob2) {
  // get the absolute vertices
  let vertices1 = gob1.getAbsoluteVertices()
  let vertices2 = gob2.getAbsoluteVertices()

  // gather the normals
  let normals1 = gob1.getNormals()
  let normals2 = gob2.getNormals()

  // for each normal, project both shapes onto the normal. if they don't intersect, then immediately return false.
  // otherwise return true at the end

  for (let i=0; i<normals1.length; i++) {
    if (checkProjectionOverlap(vertices1, vertices2, normals1[i])) {
      return false
    }
  }

  for (let i=0; i<normals2.length; i++) {
    if (checkProjectionOverlap(vertices1, vertices2, normals2[i])) {
      return false
    }
  }

  // for (let i=0; i<normals.length; i++) {
  //   let projection1 = projectPolygonOntoVector(vertices1, normals[i])
  //   let projection2 = projectPolygonOntoVector(vertices2, normals[i])
  //   // compare if there's an overlap.

  //   if (projection1.x > projection2.y || projection1.y < projection2.x) {
  //     return false
  //   }
  // }



  return true
}



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
    let count = 0
    // add all gobs into the spatial hash
    for (let i=0; i<gobs.length; i++) {
      this.spatialHash.add(gobs[i])
      this.contactCache[gobs[i]._id] = {}
    }
    // console.log(changedGobs)

    // TODO: Race condition: 2 bullets of different speed, will hit guy on same frame. should both be destroyed? probably.
    // for every gob determine if there is a collision
    for (let i=0; i<changedGobs.length; i++) {
      let collidableBuckets = this.spatialHash.getPossibleGobs(changedGobs[i])

      // for each gob in each bucket

      for (let j=0; j<collidableBuckets.length; j++) {
        for (let k=0; k<collidableBuckets[j].length; k++) {
          let gob1 = changedGobs[i]
          let gob2 = collidableBuckets[j][k]
          // console.log(collidableBuckets.length)

          if (gob1._id !== gob2._id &&
              !this.contactCache[gob1._id][gob2._id] &&  // if this pair hasn't
              !this.contactCache[gob2._id][gob1._id] &&  // been checked already
              SAT(gob1, gob2)) {                         // and also collides!!
          // check if gob1 has ever collided with gob2 EVER before, or vice versa
          // if (SAT(gob1, gob2) &&
          //     !this.contactCache[gob1._id][gob2._id] && !this.contactCache[gob2._id][gob1._id]) {
            gob1.onCollide(gob2)
            gob2.onCollide(gob1)
            // update contact cache
          }

          this.contactCache[gob1._id][gob2._id] = true

        }

      }

      // for (let j=0; j<collidableGobs.length; j++) {
      // }

    }
    // console.log(count)
    // debugger

    // free contactCache
    this.contactCache = {}

    this.spatialHash.empty()
  }


}
