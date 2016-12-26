/* @flow */
import Vector2 from '../../vector2';
import {Time} from '../../constants/private';
import type Gob from '../../gob';

// https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
// See section on "moving objects"
// Returns TFirst, first time of collision. If no collision, returns Infinity
// NOTE: Infinity is not exactly accurate since it will collide in TFirst time,
// but in this case it just means there is no collision at the next time step
export default function movingSAT(gob1: Gob, gob2: Gob): [number, ?Vector2] {
  // get the absolute vertices
  const vertices1: Array<Vector2> = gob1.getVertices();

  const vertices2: Array<Vector2> = gob2.getVertices();

  // velocity
  const velocity: Vector2 = Vector2.Difference(gob2.velocity, gob1.velocity);

  // gather the normals
  const normals: Array<Vector2> = gob1.getNormals().concat(gob2.getNormals());

  // const MTV: Vector2 = new Vector2(-Infinity, -Infinity);

  // we are calculating in terms of a single timestep
  const TMax: number = Time.dts;
  let TFirst: number = 0;
  let TLast: number = Infinity;

  // TODO: do we need this?
  let Length: number = 0; Length;

  // if there has been a collision, calculate how far it's gone
  let TElapsed: number = 0; TElapsed;
  let normal: Vector2;

  // for each normal, project both shapes onto the normal.
  // if they don't intersect, then immediately return [Infinity, null].
  // otherwise return true at the end
  for (let i: number = 0; i < normals.length; i++) {
    // speed is the projection of the speed onto the normal
    const speed: number = Vector2.ProjectScalar(velocity, normals[i]);
    let T: number;

    let min0: number = Infinity;
    let max0: number = -Infinity;
    let min1: number = Infinity;
    let max1: number = -Infinity;

    // TODO: do we need this?
    const min0Index: number = Infinity; min0Index;
    let max0Index: number = -Infinity; max0Index;
    const min1Index: number = Infinity; min1Index;
    let max1Index: number = -Infinity; max1Index;

    // get max and min of collison
    vertices1.map((vertex: Vector2, index: number): void => {
      const val: number = Vector2.ProjectScalar(vertex, normals[i]);
      min0 = Math.min(min0, val);
      if (val > max0) {
        max0 = val;
        max0Index = index;
      }
    });

    vertices2.map((vertex: Vector2, index: number): void => {
      const val: number = Vector2.ProjectScalar(vertex, normals[i]);
      min1 = Math.min(min1, val);
      if (val > max1) {
        max1 = val;
        max1Index = index;
      }
    });

    if (max1 < min0) {
      if (speed <= 0) {
        return [Infinity, null];
      }
      T = (min0 - max1) / speed;
      if (T > TFirst) {
        TFirst = T;
        Length = min0 - max1;
        normal = normals[i];
      }
      if (TFirst > TMax) {
        return [Infinity, null];
      }
      T = (max0 - min1) / speed;
      if (T < TLast) {
        TLast = T;
      }
      if (TFirst > TLast) {
        return [Infinity, null];
      }
    } else if (max0 < min1) {
      if (speed >= 0) {
        return [Infinity, null];
      }
      T = (max0 - min1) / speed;
      if (T > TFirst) {
        TFirst = T;
        Length = max0 - min1;
        normal = normals[i];
      }
      if (TFirst > TMax) {
        return [Infinity, null];
      }
      T = (min0 - max1) / speed;
      if (T < TLast) {
        TLast = T;
      }
      if (TFirst > TLast) {
        return [Infinity, null];
      }
    } else {
      if (speed > 0) {
        T = (max0 - min1) / speed;
        if (T < TLast) {
          TLast = T;
        }
        if (TFirst > TLast) {
          return [Infinity, null];
        }
      } else if (speed < 0) {
        T = (min0 - max1) / speed;
        if (T < TLast) {
          TLast = T;
        }
        if (TFirst > TLast) {
          return [Infinity, null];
        }
      }
    }

    // set TElapsed
    // the minimum of the two possible overlaps, to determine actual overlap
    if (speed !== 0) {
      TElapsed = Math.min(
        Math.abs(max0 - min1),
        Math.abs(max1 - min0),
      ) / Math.abs(speed);
    }
  }


  return [TFirst, normal];
}
