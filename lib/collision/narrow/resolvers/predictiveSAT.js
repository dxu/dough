/* @flow */
import Vector2 from '../../../vector2';
import type Gob from '../../../gob';

export default function resolvePredictiveSAT(
  gob1: Gob,
  gob2: Gob,
  TFirst: number,
  normal: Vector2,
): void {
  // collided! we limit the gob resolution to this method, to preserve
  // modularity
  if (TFirst !== 0) {
    // it's going to collide with this next move. in this case, we need to
    // adjust so it doesn't overshoot.

    // TODO: THIS IS A HACK. we set it to be at TFirst - 0.0001 so that there
    // isn't going to be an overlap
    gob1.position.y += gob1.velocity.y * (TFirst - 0.0001);
    gob1.position.x += gob1.velocity.x * (TFirst - 0.0001);

    gob2.position.y += gob2.velocity.y * (TFirst - 0.0001);
    gob2.position.x += gob2.velocity.x * (TFirst - 0.0001);

    adjustPhysicsVelocity(gob1, gob2, normal);

    // TODO: a leftover of (Time.dts - (TFirst - 0.0001)) of new velocity for
    // each will be lost
  }
}

// TODO: Have restitution ONLY BE APPLIED for normal velocities
// ALSO TODO: Have restitution be applied PER OBJEcT. It's just easier to
// think about that way. if you don't want an object to have energy lost in
// collistion, just set the mass to 0!
// http://vobarian.com/collisions/2dcollisions2.pdf
function adjustPhysicsVelocity(gob1: Gob, gob2: Gob, normal: Vector2): void {
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
