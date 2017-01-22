/* @flow */
import Matter from 'matter-js';
import type Gob from '../gob';

// implements Collider interface
export default class BoxCollider {
  gob: Gob;
  constructor(gob: Gob) {
    this.gob = gob;
  }
  getMatterBody(): Matter.Body {
    const vertices = [
      // TL
      Matter.Vector.create(
        this.gob.position.x - this.gob.width / 2,
        this.gob.position.y - this.gob.height / 2,
      ),
      // TR
      Matter.Vector.create(
        this.gob.position.x + this.gob.width / 2,
        this.gob.position.y - this.gob.height / 2,
      ),
      // BR
      Matter.Vector.create(
        this.gob.position.x + this.gob.width / 2,
        this.gob.position.y + this.gob.height / 2,
      ),
      // BL
      Matter.Vector.create(
        this.gob.position.x - this.gob.width / 2,
        this.gob.position.y + this.gob.height / 2,
      ),
    ];
    // create the collider from the width + height
    return Matter.Body.create({
      angle: this.gob.angle,
      angularVelocity: this.gob.angularVelocity,
      mass: this.gob.mass,
      position: Matter.Vector.create(this.gob.position.x, this.gob.position.y),
      velocity: Matter.Vector.create(this.gob.velocity.x, this.gob.velocity.y),
      vertices: vertices,
    });
  }
}
