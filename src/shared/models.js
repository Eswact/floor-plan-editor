import { GridConfig } from './constants.js';
import { generateGUID } from './utils.js';

export function createFloor(name) {
  return {
    id: Date.now(),
    name: name,
    tables: [],
    objects: [],
  };
}

export function createTable(params) {
  const cs = GridConfig.CELL_SIZE;
  return {
    id: generateGUID(),
    tableNo: params.tableNo,
    shape: params.shape,
    capacity: params.capacity,
    gridX: params.gridX,
    gridY: params.gridY,
    gridWidth: params.gridWidth,
    gridHeight: params.gridHeight,
    x: params.gridX * cs,
    y: params.gridY * cs,
    width: params.gridWidth * cs,
    height: params.gridHeight * cs,
    rotation: 0,
  };
}

export function createFloorObject(params) {
  const cs = GridConfig.CELL_SIZE;
  const obj = {
    id: generateGUID(),
    type: params.type,
    gridX: params.gridX,
    gridY: params.gridY,
    gridWidth: params.gridWidth,
    gridHeight: params.gridHeight,
    x: params.gridX * cs,
    y: params.gridY * cs,
    width: params.gridWidth * cs,
    height: params.gridHeight * cs,
  };
  if (params.name) obj.name = params.name;
  return obj;
}
