/* @flow */
import Gob from './gob';
import * as Pixi from 'pixi.js';
import Clip from './clip';
import {Utils} from './util';

export default class Loader {
  resources: Object;
  onComplete: (loader: Pixi.Loader, resources: Object) => void;
  loader = new Pixi.loaders.Loader();
  audioContext: AudioContext;

  constructor(
    onComplete: (loader: Pixi.Loader, resources: Object) => void,
    audioContext: AudioContext,
  ) {
    this.onComplete = onComplete;
    this.audioContext = audioContext;
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
   *         frameDurations: Array<number>
   *       }
   *     }
   *   }
   * }
   */
  loadSprites(...gobs: Array<typeof Gob>): Promise<Object> {
    if (gobs.length === 0) {
      throw new Error('No resources were included in the load function.');
    }
    gobs.map((gob: typeof Gob) => {
      for (const key in gob.spriteSheets) {
        if (gob.spriteSheets == null) {
          throw new Error(
            `Invalid game object ${gob.name} created.
              No sprite paths provided`,
          );
        }
        // for each spritesheet, load
        this.loader.add(
          Utils.getPixiResourceKey(gob.name, key),
          gob.spriteSheets[key].path,
        );
      }
    });

    return new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        console.log('erlo');
        if (resources.error != null) {
          reject(resources);
        } else {
          resolve(resources);
        }
      });
    });
  }

  loadAudio(...gobs: Array<typeof Gob>): Promise<Array<mixed>> {
    const audioPromises = [];
    gobs.map(gob => {
      for (const key in gob.audioSources) {
        audioPromises.push(this.loadAudioClip(gob, key, gob.audioSources[key]));
      }
    });

    return Promise.all(audioPromises);
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
    return audioPromise;
  }
}
