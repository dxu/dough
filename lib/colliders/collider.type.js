/* @flow */
import type Gob from '../gob';
import type {Body} from 'matter-js';
import type Matter from 'matter-js';

// export type Collider = (gob: Gob) => Body;

export interface Collider {
  body: Matter.Body,
}
