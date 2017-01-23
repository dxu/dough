/* @flow */
import Matter from 'matter-js';
import type Gob from '../gob';

// implements Collider interface
export default function BoxCollider(gob: Gob): Matter.Body {
  const vertices = [
    // TL
    Matter.Vector.create(
      gob.position.x - gob.width / 2,
      gob.position.y - gob.height / 2,
    ),
    // TR
    Matter.Vector.create(
      gob.position.x + gob.width / 2,
      gob.position.y - gob.height / 2,
    ),
    // BR
    Matter.Vector.create(
      gob.position.x + gob.width / 2,
      gob.position.y + gob.height / 2,
    ),
    // BL
    Matter.Vector.create(
      gob.position.x - gob.width / 2,
      gob.position.y + gob.height / 2,
    ),
  ];
  // create the collider from the width + height
  // Note that velocity and angularVelocity are read-only! they need to be
  // initialized by gob
  return Matter.Body.create({
    angle: gob.angle,
    mass: gob.mass,
    position: Matter.Vector.create(gob.position.x, gob.position.y),
    vertices: vertices,
  });
}
