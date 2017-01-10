/* @flow */

import util from '../../../util';
import {Time} from '../../../constants/private';

import type Gob from '../../../gob';
/*
 * A generic spatial hash used for comparing
 * @param comparator
 * @param collision - collision function for
 * @param bucketHash - hash function for determining buckets
 *
 * Usage:
 * Can only take in objects with a built in onCollide(object) method. The
 *     object must also contain an `_id` parameter to access a unique id
 *
 *
 * Pass in a bucket hash function that will determine the bucket index in which
 *      the object is located
 * Pass in the uuid hash function referencing the item
 * Pass in the Collision function for determining the collision of two polygons
 *      or game objects (AABB, Separating Axis, etc)
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
  _id: number;
  tileSize: number;
  bucketHash: (x: number, y: number) => string;
  buckets: {
    [id: string]: Array<Gob>,
  };
  // Takes in a 2d map tile size for calculating the bucket.
  constructor(
    tileSize: number = 10,
    bucketHash: (x: number, y: number) => string = defaultBucketHash,
  ): void {
    // this must also have a uuid
    this._id = util.uuid();

    this.buckets = {
      // {
      //   bucket_id: [gob (actual gob objects)]
      // }
      //
    };

    this.tileSize = tileSize;
    this.bucketHash = bucketHash || defaultBucketHash;
  }

  // returns possible gobs that might collide with given gob
  getPossibleGobs(gob: Gob): Array<Gob> {
    // return you an array of buckets (arrays of gobs)
    return [].concat.apply([], this._getBuckets(gob));
  }


  // because the spatialhash should get cleared every udpate, we no longer need
  // to keep track of and remove gobs
  add(gob: Gob): void {
    // get buckets for the current position
    const buckets: Array<Array<Gob>> = this._getBuckets(gob);

    for (let i = 0; i < buckets.length; i++) {
      this.addToOneBucket(gob, buckets[i]);
    }
  }

  seed(gobs: Array<Gob>): void {
    for (let i = 0; i < gobs.length; i++) {
      this.add(gobs[i]);
    }
  }

  addToOneBucket(gob: Gob, bucket: Array<Gob>): void {
    // add gob to bucket
    bucket.push(gob);
  }

  // removes all gobs from this spatial hash
  empty(): void {
    this.buckets = {};
  }

  // returns all the possible buckets this item overlaps in
  // NOTE: will return the actual arrays!!
  // NOTE THAT IT'S NO LonGER JUST THE ITEMS THIS OVErLAPS WITH - IT'S ACTUALLY
  // ALL THE BUCKETS THAT ARE WITHIN ITS MOVEABLE RADIUS!! this is because we
  // are now predicting/calculating the future value for where this will be!!!
  _getBuckets(gob: Gob): Array<Array<Gob>> {
    const xVel: number = gob.velocity.x * Time.dts;
    const yVel: number = gob.velocity.y * Time.dts;

    const minX: number = gob._aabb[0].x;
    const maxX: number = gob._aabb[1].x;
    const minY: number = gob._aabb[0].y;
    const maxY: number = gob._aabb[3].y;

    // if the x velocity is > 0, then don't need to add anything, the leftmost
    // corner is this object
    const l: number = Math.floor(
      (minX + Math.min(xVel, 0)) / this.tileSize,
    );
    // if the x velocity is < 0, then don't need to add anything, the rightmost
    // corner is this object
    const r: number = Math.floor(
      (maxX + Math.max(xVel, 0)) / this.tileSize,
    );
    // if the y velocity is < 0, then don't need to add anything, the topmost
    // corner is this object
    const t: number = Math.floor(
      (minY + Math.min(yVel, 0)) / this.tileSize,
    );
    // if the y velocity is > 0, then don't need to add anything, the topmost
    // corner is this object
    const b: number = Math.floor(
      (maxY + Math.max(yVel, 0)) / this.tileSize,
    );

    const buckets: Array<Array<Gob>> = [];
    let bucketHash: string;
    for (let i = l; i <= r; i++) {
      for (let j: number = t; j <= b; j++) {
        bucketHash = this.bucketHash(i, j);
        // initialize bucket
        this.buckets[bucketHash] = this.buckets[bucketHash] || [];
        buckets.push(this.buckets[bucketHash]);
      }
    }
    return buckets;
  }
}

// assumes a default scheme for the bucket based on the default game object -
// position.x, position.y
function defaultBucketHash(x: number, y: number): string {
  return `${x}_${y}`;
}

export default SpatialHash;
