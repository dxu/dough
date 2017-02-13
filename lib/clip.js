/* @flow */
export default class Clip {
  buffer: AudioBuffer;
  context: AudioContext;

  constructor(context: AudioContext, buffer: AudioBuffer) {
    this.buffer = buffer;
    this.context = context;
  }

  // we need to create a new audio node each time
  play() {
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.context.destination);
    source.start(0);
  }
}
