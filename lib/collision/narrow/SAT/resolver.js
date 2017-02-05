/* @noflow */

import type Vector2 from '../../../vector2';
import type Gob from '../../../gob';

/* resolve a collision between two non-moving objects (project them out) */
export default function resolveStaticCollision(
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
