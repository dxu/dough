/* @flow */
import type Gob from '../gob';
import type {Body} from 'matter-js';

export type Collider = (gob: Gob) => Body;

