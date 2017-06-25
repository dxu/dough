import Vector2 from './vector2';
import {Utils} from './util';

export default class Gobi {
  _id: number;
  scene: Scene;
  transform: GobTransformProps = {
    position: new Vector2(0, 0),
    scale: new Vector2(1, 1),
    angle: 0,
  };
  _destroyed: bool;

  // This is the method that is called invisibly to set up the rigidbody +
  // collider stuff
  __init(scene: Scene, opts: GobOptions) {
    this.__opts = opts;
    this._id = Utils.uuid();
    if (opts.transform == null || opts.transform.position == null) {
      throw new Error('Invalid game object created. No position provided.');
    }
    this.transform.position = new Vector2(
      opts.transform.position.x,
      opts.transform.position.y,
    );
    this.transform.angle = opts.transform.angle || this.transform.angle;
    if (opts.transform.scale != null) {
      this.transform.scale.x = opts.transform.scale.x;
      this.transform.scale.y = opts.transform.scale.y;
    }

    this.scene = scene;
    if (this.scene == null) {
      throw new Error('Gobi instantiated without a scene object.');
    }
  }

  __onSceneLoad() {}
}
