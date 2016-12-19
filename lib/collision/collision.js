/* @flow */
import Vector2 from '../vector2';
// TODO: don't use this directly, refer to it from game so this is completely
//       separate
import {Time} from '../constants/private';

import type Gob from '../gob';

// https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
// See section on "moving objects"

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

// TODO: for now it assumes both gobs are convex
// returns null if no collision, otherwise returns MTV
// http://www.metanetsoftware.com/technique/tutorialA.html
export function SAT(gob1: Gob, gob2: Gob): bool {
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
      return false;
    }
  }

  for (let i: number = 0; i < normals2.length; i++) {
    // $invariant: MTV will never be null
    MTV = checkProjectionOverlap(vertices1, vertices2, normals2[i], MTV);
    if (MTV == null) {
      return false;
    }
  }

  // TODO: adjust the gobs here instead of in collision engine
  // $invariant MTV will have returned by now if null
  resolveStaticCollision(gob1, gob2, MTV);

  return true;
}

/* resolve a collision between two non-moving objects (project them out) */
export function resolveStaticCollision(
  gob1: Gob,
  gob2: Gob,
  MTV: Vector2,
): void {
  // first project gob1 and gob2 out of the MTV by determining the proportion of
  // VELOCITY
  // const v1m: number = gob1.velocity.mag();
  // const v2m: number = gob2.velocity.mag();

  // const totalVelocity: number = v1m + v2m;

  // const p1: number = v1m / (v1m + v2m);
  // const p2: number = v2m / (v2m + v1m);

  const [, right]: Array<Gob> =
    gob1.position.x >= gob2.position.x ? [gob2, gob1] : [gob1, gob2];
  const [, bottom]: Array<Gob> =
    gob1.position.y >= gob2.position.y ? [gob2, gob1] : [gob1, gob2];

  right.position.x += MTV.x;
  bottom.position.y -= MTV.y;
}

// TODO: Have restitution ONLY BE APPLIED for normal velocities
// ALSO TODO: Have restitution be applied PER OBJEcT. It's just easier to
// think about that way. if you don't want an object to have energy lost in
// collistion, just set the mass to 0!
// http://vobarian.com/collisions/2dcollisions2.pdf
function adjustPhysicsVelocity(gob1: Gob, gob2: Gob, normal?: Vector2): void {
  if (normal == null) {
    throw new Error(`Tried to adjust post-collision velocities, but wasn't
      given a normal!`);
  }
  // tangent is the normal of the normal
  const tangent: Vector2 = normal.orthol();
  // const unitNormal = Vector2.Normalized(normal)

  const unitNormal: Vector2 = Vector2.Normalized(normal);
  const unitTangent: Vector2 = Vector2.Normalized(tangent);

  const m1: number = gob1.mass;
  const m2: number = gob2.mass;

  const v1n: number = Vector2.ProjectScalar(gob1.velocity, normal);
  const v1t: number = Vector2.ProjectScalar(gob1.velocity, tangent);
  const v2n: number = Vector2.ProjectScalar(gob2.velocity, normal);
  const v2t: number = Vector2.ProjectScalar(gob2.velocity, tangent);

  // coefficient of restitution == bounciness
  // See http://www.box2dflash.org/docs/2.0.2/manual#Friction_and_Restitution
  // const restitution = Math.max(gob1.bounce, gob2.bounce)
  //
  // Instead of having a single restitution value, we just use restitution
  // per object. this way, dev's can more easily imagine how individual objects
  // are affected by collisions
  //
  // (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2)
  const newv1n: number =
    gob1.bounce * (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
  // for tangent values, we need to adjust it according to the friction
  const newv1t: number = (1 - Math.max(0, 1 - gob1.friction)) * v1t;

  // coefficient of restitution == bounciness
  // (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2)
  const newv2n: number =
    gob2.bounce * (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);
  const newv2t: number = (1 - Math.max(0, 1 - gob2.friction)) * v2t;

  // find the new velocity normals
  const newVelocityNormal1: number = Vector2.ScalarProduct(unitNormal, newv1n);
  const newVelocityNormal2: number = Vector2.ScalarProduct(unitNormal, newv2n);

  const newVelocityTangent1: number =
    Vector2.ScalarProduct(unitTangent, newv1t);
  const newVelocityTangent2: number =
    Vector2.ScalarProduct(unitTangent, newv2t);

  const newVelocity1: Vector2 =
    Vector2.Sum(newVelocityNormal1, newVelocityTangent1);
  const newVelocity2: Vector2 =
    Vector2.Sum(newVelocityNormal2, newVelocityTangent2);

  gob1.velocity.x = newVelocity1.x;
  gob1.velocity.y = newVelocity1.y;
  gob2.velocity.x = newVelocity2.x;
  gob2.velocity.y = newVelocity2.y;
}

// https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
export function movingSAT(gob1: Gob, gob2: Gob): bool {
  // get the absolute vertices
  const vertices1: Array<Vector2> = gob1.getVertices();

  const vertices2: Array<Vector2> = gob2.getVertices();

  // velocity
  const velocity: Vector2 = Vector2.Difference(gob2._velocity, gob1._velocity);

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
  // if they don't intersect, then immediately return false.
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
        return false;
      }
      T = (min0 - max1) / speed;
      if (T > TFirst) {
        TFirst = T;
        Length = min0 - max1;
        normal = normals[i];
      }
      if (TFirst > TMax) {
        return false;
      }
      T = (max0 - min1) / speed;
      if (T < TLast) {
        TLast = T;
      }
      if (TFirst > TLast) {
        return false;
      }
    } else if (max0 < min1) {
      if (speed >= 0) {
        return false;
      }
      T = (max0 - min1) / speed;
      if (T > TFirst) {
        TFirst = T;
        Length = max0 - min1;
        normal = normals[i];
      }
      if (TFirst > TMax) {
        return false;
      }
      T = (min0 - max1) / speed;
      if (T < TLast) {
        TLast = T;
      }
      if (TFirst > TLast) {
        return false;
      }
    } else {
      if (speed > 0) {
        T = (max0 - min1) / speed;
        if (T < TLast) {
          TLast = T;
        }
        if (TFirst > TLast) {
          return false;
        }
      } else if (speed < 0) {
        T = (min0 - max1) / speed;
        if (T < TLast) {
          TLast = T;
        }
        if (TFirst > TLast) {
          return false;
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

  // collided! we limit the gob resolution to this method, to preserve
  // modularity
  if (TFirst !== 0) {
    // it's going to collide with this next move. in this case, we need to
    // adjust so it doesn't overshoot.

    // TODO: THIS IS A HACK. we set it to be at TFirst - 0.0001 so that there
    // isn't going to be an overlap
    gob1.position.y = gob1._position.y + gob1._velocity.y * (TFirst - 0.0001);
    gob1.position.x = gob1._position.x + gob1._velocity.x * (TFirst - 0.0001);

    gob2.position.y = gob2._position.y + gob2._velocity.y * (TFirst - 0.0001);
    gob2.position.x = gob2._position.x + gob2._velocity.x * (TFirst - 0.0001);

    adjustPhysicsVelocity(gob1, gob2, normal);

    // TODO: a leftover of (Time.dts - (TFirst - 0.0001)) of new velocity for
    // each will be lost
  }

  return true;
}
