/* @flow */

import Vector2 from '../../../vector2';
import type Gob from '../../../gob';

// TODO: for now it assumes both gobs are convex
// returns null if no collision, otherwise returns MTV
// http://www.metanetsoftware.com/technique/tutorialA.html
function SAT(gob1: Gob, gob2: Gob): ?Vector2 {
  // get the absolute vertices
  const vertices1: Array<Vector2> = gob1.getVertices();
  const vertices2: Array<Vector2> = gob2.getVertices();

  // gather the normals
  const normals1: Array<Vector2> = gob1.getNormals();
  const normals2: Array<Vector2> = gob2.getNormals();

  let MTV: ?Vector2 = new Vector2(-Infinity, -Infinity);

  // for each normal, project both shapes onto the normal. if they don't
  // intersect, then immediately return false.
  // otherwise return true at the end
  for (let i: number = 0; i < normals1.length; i++) {
    // $invariant: MTV will never be null
    MTV = checkProjectionOverlap(vertices1, vertices2, normals1[i], MTV);
    if (MTV == null) {
      return null;
    }
  }

  for (let i: number = 0; i < normals2.length; i++) {
    // $invariant: MTV will never be null
    MTV = checkProjectionOverlap(vertices1, vertices2, normals2[i], MTV);
    if (MTV == null) {
      return null;
    }
  }

  // TODO: adjust the gobs here instead of in collision engine
  // resolveStaticCollision(gob1, gob2, MTV);

  return MTV;
}

// if it overlaps, return the projection vector
function checkProjectionOverlap(
  vertices1: Array<Vector2>,
  vertices2: Array<Vector2>,
  vector: Vector2,
  MTV: Vector2,
): ?Vector2 {
  let min1: number = Infinity;
  let max1: number = -Infinity;
  let min2: number = Infinity;
  let max2: number = -Infinity;
  vertices1.map((vertex: Vector2): void => {
    const val: number = Vector2.ProjectScalar(vertex, vector);
    min1 = Math.min(min1, val);
    max1 = Math.max(max1, val);
  });

  vertices2.map((vertex: Vector2): void => {
    const val: number = Vector2.ProjectScalar(vertex, vector);
    min2 = Math.min(min2, val);
    max2 = Math.max(max2, val);
  });

  // no overlap
  if (min1 > max2 || max1 < min2) {
    return null;
  } else {
    // the magnitude of the overlap
    const newMTVMagnitude: number = Math.min(max2 - min1, max1 - min2);
    const vectorMag: number = vector.mag();
    // if the magnitude is smaller than the magnitude of the current mtv then we
    //    should update
    // the mtv with the new values
    if (newMTVMagnitude < MTV.mag()) {
      MTV.x = vector.x * newMTVMagnitude / vectorMag;
      MTV.y = vector.y * newMTVMagnitude / vectorMag;
    }
    return MTV;
  }
}

export default class SATDetector {
  checkPotentialCollisions(
    potentialCollisions: {
      [id: number]: {
        gob: Gob,
        collisions: Array<Gob>,
      }
    }
  ): Array<[Gob, Gob, ?Object]> {
    const allCollisions = [];

    // TODO: check contact cache? or check it outside.

    // for each id iterate through the array of gobs and check
    for (const id in potentialCollisions) {
      // $invariant id doesn't get inferred on loops atm
      const collisionMap = potentialCollisions[id]
      collisionMap.collisions.map((gob) => {
        const MTV = SAT(collisionMap.gob, gob);
        if (MTV != null) {
          allCollisions.push([collisionMap.gob, gob, MTV])
        }
      });
    }

    return allCollisions;
  }
}
