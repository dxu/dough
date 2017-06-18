/* @flow */
import type Gob from '../gob';
import Game from '../game';

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
  body: Matter.Body;
  width: number;
  height: number;
  shape: Box2D.Shape;

  // vertices: Array<Matter.Vector>;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.shape = new Game.Box2D.b2PolygonShape();
    this.shape.SetAsBox(width, height);

  }

  __init(world: Box2D.World) {
    const bodyDef = new Game.Box2D.b2BodyDef();
    this.body = world.CreateBody(bodyDef)
    this.body.CreateFixture(this.shape, 5.0);
  }

  getVertices() {

  }
}
