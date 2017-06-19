import Gob from './gob';
import invariant from 'invariant';
import Vector2 from './vector2';
import Matter from 'matter-js';

type GobRigidBodyProps = {
  mass: number,
  friction: number,
  frictionStatic: number,
  frictionAir: number,
  restitution: number,
  velocity: Vector2,
  angularVelocity: number,
  maxVelocity: Vector2,
  maxAngularVelocity: number,
};

const RIGIDBODY_DEFAULTS = {
  mass: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  restitution: 0,
  angularVelocity: 0,
  isStatic: false,
};

//
export default class RigidBody {
  gob: Gob;
  mass: number;
  isStatic: bool;
  collider: BoxCollider;

  constructor({mass = 1, isStatic = false, collider, rotatable = false}) {
    this.mass = mass;
    this.isStatic = isStatic;
    this.collider = collider;
    invariant(this.collider, 'RigidBody must be provided a collider');
    this.collider.rigidbody = this;
  }

  __init(world: Matter.World, gob: Gob) {
    this.gob = gob;
    this.collider.__init(world, gob);
    // update ability to rotate
    if (!this.rotatable) {
      Matter.Body.setInertia(this.collider.body, Infinity);
    }

    this.collider.body.onCollide(pair => {
      this.gob.onCollide(pair);
    });

    this.collider.body.onCollideEnd(pair => {
      this.gob.onCollideEnd(pair);
    });

    this.collider.body.onCollideActive(pair => {
      this.gob.onCollideActive(pair);
    });
  }

  // TODO: clenaup
  destroy() {}

  getVelocity(): Vector2 {
    return new Vector2(
      this.collider.body.velocity[0],
      this.collider.body.velocity[1],
    );
  }

  setVelocity(
    x: number = this.collider.body.velocity.x,
    y: number = this.collider.body.velocity.y,
  ) {
    Matter.Body.setVelocity(this.collider.body, {x, y});
  }

  setVelocityY(y: number = this.collider.body.velocity.y) {
    Matter.Body.setVelocity(this.collider.body, {
      x: this.collider.body.velocity.x,
      y,
    });
  }
}
