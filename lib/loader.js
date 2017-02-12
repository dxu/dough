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
  load(...gobs: Array<typeof Gob>): Promise<Array<Object>> {
    if (gobs.length === 0) {
      throw new Error('No resources were included in the load function.')
    }

    gobs.map((gob: typeof Gob) => {
      this.loader.add(gob.name, gob.spritePath);
    });

    const loadSprites = new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        if (resources.error != null) {
          reject(resources);
        } else {
          resolve(resources);
          console.log('awjewefjef', resources)
        }
      })
    });

    const loadAudio = Promise.all(
      gobs.map((gob) => this.loadAudioClip(gob)),
    );

    return Promise.all([loadSprites, loadAudio]);
  }

  loadAudioClip(gob: typeof Gob): Promise<?Object | Array<?Object>> {
    if (gob.audioSources == null) return Promise.resolve();
    if (typeof gob.audioSources === 'string') {
      return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        // $FlowFixMe see https://github.com/facebook/flow/issues/3369
        request.open('GET', gob.audioSources);
        request.onload = resolve;
        request.onerror = resolve;
        request.send();
      });
    }

    if (typeof gob.audioSources === 'string') {
      const arr = [];
      // if an object, load each gob.audioSources clip
      for (const key in gob.audioSources) {
        arr.push(this.loadAudioClip(gob.audioSources[key]))
      }
      return Promise.all(arr);
    }
    return Promise.reject(`${gob.name}'s audio sources were not recognized, and could not be loaded`);
  }
}
