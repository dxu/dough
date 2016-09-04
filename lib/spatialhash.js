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
 * - allow for a set of items with which you do not detect collision
 * - enforce that buckethash and _id exist on the object
 *
 *
 *
 */
class SpatialHash {
  constructor(comparator, didCollide, bucketHash) {
    this.comparator = comparator
    this.didCollide = didCollide
    this.items = {}
  }

  add(item) {
    let hashed = this.bucketHash(item)
    this.items[hashed] = this.items[hashed] || {}
    this.items[hashed][item._id] = item
  }

  remove(item) {
    delete this.items[this.bucketHash(item)][item._id]
  }

  compare(item) {
    // if there exists a collision, return true
    let bucketHash = this.bucketHash(item)
    let itemHash = item._id
    for (other in this.items[bucketHash]) {
      if (item !== other && this.didCollide(other, item)) {
        item.onCollide(other)
        other.onCollide(item)
        return true
      }
    }
    return false
  }
}

// assumes a default scheme for the bucket based on the default game object - position.x, position.y
function defaultBucketHash() {

}


export default SpatialHash
