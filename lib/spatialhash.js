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
  constructor(tileSize=10, bucketHash) {
    // this must also have a uuid
    this._id = util.uuid()

    this.buckets = {
      // {
      //   bucket_id: [gob (actual gob objects)]
      // }
      //
    }

    this.tileSize = tileSize
    this.bucketHash = bucketHash || defaultBucketHash
  }

  // returns possible gobs that might collide with given gob
  getPossibleGobs(gob) {
    // return you an array of buckets (arrays of gobs)
    return this._getBuckets(gob)
  }


  // because the spatialhash should get cleared every udpate, we no longer need
  // to keep track of and remove gobs
  add(gob) {
    // get buckets for the current position
    let buckets = this._getBuckets(gob)

    for (let i=0; i < buckets.length; i++) {
      this.addToOneBucket(gob, buckets[i])
    }
  }

  addToOneBucket(gob, bucket) {
    // add gob to bucket
    bucket.push(gob)
  }

  // removes all gobs from this spatial hash
  empty() {
    this.buckets = {}
  }

  // returns all the possible buckets this item overlaps in
  // NOTE: will return the actual arrays!!
  _getBuckets(gob) {
    let l = Math.floor((gob.position.x - gob.width / 2) / this.tileSize),
        r = Math.floor((gob.position.x + gob.width / 2) / this.tileSize),
        t = Math.floor((gob.position.y - gob.height / 2) / this.tileSize),
        b = Math.floor((gob.position.y + gob.height / 2) / this.tileSize)

    let buckets = []

    for (let i=l; i<=r; i++) {
      for (let j=t; j<=b; j++) {
        let bucketHash = this.bucketHash(i, j)
        // initialize bucket
        this.buckets[bucketHash] = this.buckets[bucketHash] || []
        buckets.push(this.buckets[bucketHash])
      }
    }

    return buckets
  }

}

// assumes a default scheme for the bucket based on the default game object - position.x, position.y
function defaultBucketHash(x, y, tileSize) {
  return `${x}_${y}`
}

export default SpatialHash
