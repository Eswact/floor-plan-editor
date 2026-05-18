import { TableShape, ObjectType } from './constants.js';

const _shapeNames = {
  [TableShape.SQUARE]: 'Square',
  [TableShape.ROUND]: 'Round',
  [TableShape.RECTANGLE]: 'Rectangle',
};

const _objectLabels = {
  [ObjectType.DOOR]: 'Door',
  [ObjectType.STAIR]: 'Stairs',
  [ObjectType.WC]: 'WC',
};

export function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getShapeName(shape) {
  return _shapeNames[shape] || shape;
}

export function getObjectLabel(obj) {
  return _objectLabels[obj.type] || obj.name || 'Object';
}
