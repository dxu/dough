import Gob from './gob';
import invariant from 'invariant';
import Vector2 from './vector2';

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

  constructor({mass = 1, isStatic = false, collider}) {
    console.log('jiojoij');
    this.mass = mass;
    this.isStatic = isStatic;
    this.collider = collider;
    console.log('collider', this.collider);
    invariant(this.collider, 'RigidBody must be provided a collider');
    this.collider.rigidbody = this;
  }
  getVelocity(): Vector2 {
    return new Vector2(
      this.collider.body.velocity[0],
      this.collider.body.velocity[1],
    );
  }

  setVelocity(
    x: number = this.collider.body.velocity[0],
    y: number = this.collider.body.velocity[1],
  ) {
    console.log('joijoj');
    this.collider.body.velocity[0] = x;
    this.collider.body.velocity[1] = y;
  }
  setVelocityY(y: number = this.collider.body.velocity[1]) {
    this.collider.body.velocity[1] = y;
  }
}
