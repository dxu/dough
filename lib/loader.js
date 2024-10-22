/* @flow */
import Gob from './gob';
import * as Pixi from 'pixi.js';
import Clip from './clip';
import Tilemap from './tilemap';
import {Utils} from './util';

export default class Loader {
  resources: Object;
  onComplete: (loader: Pixi.Loader, resources: Object) => void;
  loader = new Pixi.loaders.Loader();
  audioContext: AudioContext;
  audioClipPromises: Array<Promise> = [];

  constructor(
    onComplete: (loader: Pixi.Loader, resources: Object) => void,
    audioContext: AudioContext,
  ) {
    this.onComplete = onComplete;
    this.audioContext = audioContext;
  }

  loadTilemap(key, path) {
    console.log('key', key);
    // for each spritesheet, load
    this.loader.add(key, path);
  }

  loadSprite(gobClass) {
    for (const key in gobClass.spriteSheets) {
      if (gobClass.spriteSheets == null) {
        throw new Error(
          `Invalid game object ${gobClass.name} created.
            No sprite paths provided`,
        );
      }
      // for each spritesheet, load
      this.loader.add(
        Utils.getPixiResourceKey(gobClass.name, key),
        gobClass.spriteSheets[key].path,
      );
    }
  }

  /*
   * Sprite paths are of the form:
   * {
   *   <key>: {
   *     path: <path to file>,
   *     sprites: {
   *       <spriteName>: {
   *         frameStart: number
   *         frameEnd: number
   *         fps: number
   *       }
   *     }
   *   }
   * }
   */
  loadAssets(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        if (resources.error != null) {
          reject(resources);
        } else {
          resolve(resources);
        }
      });
    });
  }

  loadAudio(...gobs: Array<typeof Gob>): Promise<Array<mixed>> {
    // const audioPromises = [];
    // gobs.map(gob => {
    //   for (const key in gob.audioSources) {
    //     audioPromises.push(this.loadAudioClip(gob, key, gob.audioSources[key]));
    //   }
    // });

    return Promise.all(this.audioClipPromises);
  }

  // TODO: better error handling!
  loadAudioClip(gob: typeof Gob, key: string, path: string): Promise<mixed> {
    const audioPromise = new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        this.audioContext.decodeAudioData(
          request.response,
          buffer => {
            buffer == null
              ? reject(`Error decoding file data for ${path}`)
              : resolve(buffer);
          },
          error =>
            reject(`Error decoding "${key}" audio for ${gob.name}: ${error}`),
        );
      };
      request.onerror = reject;
      request.send();
    });
    audioPromise.then(buffer => {
      // if it successfully finishes, we want to update the gob's audio
      gob.__audio[key] = new Clip(this.audioContext, buffer);
    });
    this.audioClipPromises.push(audioPromise);
  }
}
