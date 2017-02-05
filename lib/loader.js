/* @flow */
import Gob from './gob';
import * as Pixi from 'pixi.js';

export default class Loader {
  resources: Object;
  onComplete: (loader: Pixi.Loader, resources: Object) => void;
  loader = new Pixi.loaders.Loader();
  constructor(onComplete: (loader: Pixi.Loader, resources: Object) => void) {
    this.onComplete = onComplete;
  }
  load(...gobs: Array<typeof Gob>) {
    if (gobs.length === 0) {
      throw new Error('No resources were included in the load function.')
    }
    gobs.map((gob: typeof Gob) => {
      this.loader.add(gob.name, gob.spritePath);
    });

    this.loader.load(this.onComplete)
  }
}
