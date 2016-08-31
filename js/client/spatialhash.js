/*
 * A generic spatial hash used for comparing
 * @param comparator
 * @param collision - collision function for
 * @param bucketHash - hash function for determining buckets
 * @param uuidHash - hash function for determining uuid
 *
 * Usage:
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
 * - enforce that buckethash and uuidhash exist on the object
 *
 *
 *
 */
class SpatialHash {
  constructor(comparator, collision, bucketHash, uuidHash) {
    this.comparator = comparator
    this.collision = collision
    this.items = {}
  }

  add(item) {
    let hashed = this.bucketHash(item)
    this.items[hashed] = this.items[hashed] || {}
    this.items[hashed][uuidHash(item)] = item
  }

  remove(item) {
    delete this.items[this.bucketHash(item)][uuidHash(item)]
  }

  compare(item) {
    // if there exists a collision, return true
    let bucketHash = this.bucketHash(item)
    let itemHash = uuidHash(item)
    for (other in this.items[bucketHash]) {
      if (item !== other && this.collision(other, item)) {
        return true
      }
    }
  }
}

export default SpatialHash
