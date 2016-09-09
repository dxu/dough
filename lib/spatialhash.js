import util from './util'
/*
 * A generic spatial hash used for comparing
 * @param comparator
 * @param collision - collision function for
 * @param bucketHash - hash function for determining buckets
 *
 * Usage:
 * Can only take in objects with a built in onCollide(object) method. The object must also contain an `_id` parameter to access a unique id
 *
 *
 * Pass in a bucket hash function that will determine the bucket index in which the object is located
 * Pass in the uuid hash function referencing the item
 * Pass in the Collision function for determining the collision of two polygons or game objects (AABB, Separating Axis, etc)
 *
 * compare(item) will return true if there exists a collision
 *
 *
 *
 * TODO:
 * - allow for a set of buckets with which you do not detect collision
 * - enforce that buckethash and _id exist on the object
 *
 * http://gamedev.stackexchange.com/questions/26501/how-does-a-collision-engine-work
 *
 */
class SpatialHash {
  // Takes in a 2d map tile size for calculating the bucket.
  constructor(tileSize=10, comparator, testCollide, bucketHash) {
    this.comparator = comparator
    this.testCollide = testCollide || defaultTestCollide
    this.buckets = {}

    // Required so that you can remove the old reference
    // {
    //   gob_id: {
    //    buckets: {
    //      current bucket_id1: 1,
    //      current_bucket_id2: 1
    //    },
    //    gob: gob
    //   }
    // }
    this.gobs = {}

    // this must also have a uuid
    this._id = util.uuid()

    this.tileSize = tileSize
    this.bucketHash = bucketHash || defaultBucketHash
  }


  add(gob) {
    let previous
    // add this to gob's refs
    gob.addRef(this)

    // remove from all existing buckets if any exist
    if (previous = this.gobs[gob._id]) {
      // for (let i=0; i<gob.buckets; i++) {
      //   this.remove(gob, gob.buckets[i])
      // }
      this.removeAll(gob)
    }

    // get buckets for the current position
    let buckets = this._getBuckets(gob)

    buckets.map((item) => {
      this.addToOneBucket(gob, item)
    })
  }

  // Note: This was added afterwards. The initial implementation can be found in release v0.0.1
  // TODO: stop duplicate checks - contact cache?
  // Note: DOES NOT REMOVE FROM PREVIOUS BUCKETS
  addToOneBucket(gob, bucket) {

    // initialize bucket
    this.buckets[bucket] = this.buckets[bucket] || {}
    // add gob to bucket
    this.buckets[bucket][gob._id] = gob
    // update items with the new bucket hash
    this.gobs[gob._id] = this.gobs[gob._id] || { buckets: {}, gob }
    this.gobs[gob._id].buckets[bucket] = 1


    // get the set of gobs that need to be checked for collision, and pass that to checkCollisions

    // check if it collides with anything else in the bucket
    let gobsToCheck = {}

    for (let id in this.buckets[bucket]) {
      let other = this.gobs[id].gob
      if (gob._id !== other._id && this.testCollide(other, gob)) {
        gobsToCheck[other._id] = other
      }
    }

    // execute collisions
    for (let id in gobsToCheck) {
      gobsToCheck[id].onCollide(gob)
      gob.onCollide(gobsToCheck[id])
    }

  }


  // TODO: remove gob from single bucket
  // TODO: see if there's a better way to remove all previous positions. Right now
  //       X lookups are required, where X is the number of buckets it previously occupied
  remove(gob, bucket=this.bucketHash(gob, this.tileSize)) {
    // calculate all possible buckets its in
    this.buckets[bucket] && delete this.buckets[bucket][gob._id]
  }

  // removes item from all buckets it is in
  // TODO: see if there's a better way to remove all previous positions. Right now
  //       X lookups are required, where X is the number of buckets it previously occupied
  removeAll(gob) {
    let cachedGob
    if (cachedGob = this.gobs[gob._id]) {
      for (let bucket in cachedGob.buckets) {
        // remove the bucket
        this.buckets[bucket] && delete this.buckets[bucket][gob._id]
        // delete from cache
        delete cachedGob.buckets[bucket]

      }
    }
  }

  // remove all references of gob from the spatialhash
  removeGob(gob) {
    //
    let bucketsContainingGob = this.gobs[gob._id].buckets
    for (let bucketId in bucketsContainingGob) {
      delete this.buckets[bucketId][gob._id]
    }
    this.gobs[gob._id].gob = null
    delete this.gobs[gob._id]
  }


  // returns all the possible buckets this item overlaps in
  _getBuckets(gob) {
    let l = Math.floor((gob.position.x - gob.size.width / 2) / this.tileSize),
        r = Math.floor((gob.position.x + gob.size.width / 2) / this.tileSize),
        t = Math.floor((gob.position.y - gob.size.height / 2) / this.tileSize),
        b = Math.floor((gob.position.y + gob.size.height / 2) / this.tileSize)

    let buckets = []

    for (let i=l; i<=r; i++) {
      for (let j=t; j<=b; j++) {
        buckets.push(defaultBucketHash(i, j))
      }
    }

    return buckets
  }

}

// assumes a default scheme for the bucket based on the default game object - position.x, position.y
function defaultBucketHash(x, y, tileSize) {
  return `${x}_${y}`
}

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


export default SpatialHash
