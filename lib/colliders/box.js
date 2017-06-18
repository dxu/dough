/* @flow */
import type Gob from '../gob';
import Game from '../game';
import p2 from 'p2';
import Vector2 from '../vector2';
import type RigidBody from '../rigidbody';

type BoxColliderProps = {
  body: Matter.Body,
  width: number,
  height: number,
  // vertices: Array<Matter.Vector>,
  // TODO: only used for polygon
  // relativeVertices: Array<Vector2>,
  // _edges: Array<Vector2>,
  // _normals: Array<Vector2>,
  // _aabb: Array<Vector2>,
};

// implements Collider interface
export default class BoxCollider {
  body: p2.Body;
  width: number;
  height: number;
  shape: p2.Shape;
  gob: Gob;
  rigidbody: RigidBody;

  // vertices: Array<Matter.Vector>;
  constructor(gob: Gob, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.gob = gob;

  }

  __init(world: Box2D.World) {

    console.log('trans',this.gob.transform.position)
    this.body = new p2.Body({
      mass: this.rigidbody ? this.rigidbody.mass : 0,
      position: [
        this.gob.transform.position.x,
        this.gob.transform.position.y,
      ],
    });
    this.shape = new p2.Box({
      width: this.width,
      height: this.height,
    });
    this.body.addShape(this.shape)

    // const circleShape = new p2.Circle({ radius: 1 });
    // this.body.addShape(circleShape)
    world.addBody(this.body)
  }

  // convert to vertices..
  getVertices() {
    return this.shape.vertices.map((vertex) => {
      // console.log(this.body.position, vertex)
      return new Vector2(
        vertex[0] + this.body.position[0],
        vertex[1] + this.body.position[1],
      );
    })
  }
}
