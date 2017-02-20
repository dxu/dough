/* @flow */
import type {Container} from 'pixi.js';

export default class Camera {
  stage: Container;
  constructor(stage: Container): void {
    this.stage = stage;
  }
  moveTo(x: number, y: number) {
    this.stage.setTransform(x, y);
  }
  moveRelative(x: number, y: number) {
    this.stage.setTransform(
      this.stage.position.x + x,
      this.stage.position.y + y,
    );
  }

  // can be overridden
  update: () => void;
}
