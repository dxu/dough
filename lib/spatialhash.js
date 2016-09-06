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
    // reference of item_id -> {
    //  bucket: last bucket,
    //  item
    // }
    // Required so that you can remove the old reference
    this.gobs = {}
    this.tileSize = tileSize
    this.bucketHash = bucketHash || defaultBucketHash
  }

  add(gob) {
    let hashed = this.bucketHash(gob, this.tileSize)
    let previous

    // remove the previous one if it exists
    if (previous = this.gobs[gob._id]) {
      this.remove(gob, previous.bucket)
    }

    // initialize bucket
    this.buckets[hashed] = this.buckets[hashed] || {}
    // add gob to bucket
    this.buckets[hashed][gob._id] = gob
    // update items with the new bucket hash
    this.gobs[gob._id] = {
      bucket: hashed,
      gob
    }

    // check if it collides with anything else in the bucket


    for (let id in this.buckets[hashed]) {
      let other = this.gobs[id].gob
      // console.log('hihi', other, gob)
      if (gob._id !== other._id && this.testCollide(other, gob)) {
        gob.onCollide(other)
        other.onCollide(gob)
        return true
      }
    }
  }

  remove(item, bucket=this.bucketHash(item, this.tileSize)) {
    this.buckets[bucket] && delete this.buckets[bucket][item._id]
  }

  // compare(item) {
  //   // if there exists a collision, return true
  //   let bucketHash = this.bucketHash(item)
  //   let itemHash = item._id
  //   for (other in this.buckets[bucketHash]) {
  //     if (item !== other && this.testCollide(other, item)) {
  //       item.onCollide(other)
  //       other.onCollide(item)
  //       return true
  //     }
  //   }
  //   return false
  // }
}

// assumes a default scheme for the bucket based on the default game object - position.x, position.y
function defaultBucketHash(gob, tileSize) {
  const posX = gob.position.x,
        posY = gob.position.y
  // console.log('gob', posX, posY, tileSize)
  return `${Math.floor(posX / tileSize)}_${Math.floor(posY / tileSize)}`
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
