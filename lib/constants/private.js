/* @flow */
// A lot of time constants are based on Phaser's decisions:
// https://github.com/photonstorm/phaser/blob/a29cc649327fe57e4eb0c2b89813aadf33ab6e5b/src/time/Time.js
export const Time = {
  // change in time per frame, in seconds
  dts: 1 / 60,
  dtms: 1 / 60 * 1000,
  // target fps
  desiredFps: 60,
};
