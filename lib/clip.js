/* @flow */
export default class Clip {
  buffer: AudioBuffer;
  context: AudioContext;

  constructor(context: AudioContext, buffer: AudioBuffer) {
    this.buffer = buffer;
    this.context = context;
  }

  // we need to create a new audio node each time
  play(volume?: number) {
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    if (volume != null) {
      if (!(volume >= 0 && volume <= 1)) {
        console.error(
          `Invalid volume of ${volume} specified.
           Only values from 0 to 1 are allowed!`,
        );
        return;
      }
      const gainNode = this.context.createGain();
      console.log(volume);
      gainNode.gain.value = volume;
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
    } else {
      source.connect(this.context.destination);
    }
    source.start(0);
  }
}
