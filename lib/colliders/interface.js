/* @flow */
import type Gob from '../gob';
import type {Body} from 'matter-js';

export interface Collider {
  gob: Gob;
  constructor(gob: Gob): void;
  // should be overridden
  getMatterBody(): Body;
}

