import { GridConfig, TableShape } from './constants.js';
import { createFloor, createTable, createFloorObject } from './models.js';
import { checkCollisionAtGrid, isWithinBounds, findFreePosition } from './collision-service.js';

export function addFloor(floors, name) {
  const floorName = name || `Floor ${floors.length + 1}`;
  return floors.concat([createFloor(floorName)]);
}

export function removeFloor(floors, index) {
  return floors.filter((_, i) => i !== index);
}

export function renameFloor(floors, index, name) {
  return floors.map((floor, i) => i === index ? { ...floor, name } : floor);
}

export function addTableToFloor(floor, params) {
  if (!isWithinBounds(params.gridX, params.gridY, params.gridWidth, params.gridHeight)) {
    return { success: false, error: 'bounds', floor };
  }
  if (checkCollisionAtGrid(floor, params.gridX, params.gridY, params.gridWidth, params.gridHeight)) {
    return { success: false, error: 'collision', floor };
  }
  const table = createTable(params);
  return { success: true, floor: { ...floor, tables: [...floor.tables, table] }, table };
}

export function deleteTableFromFloor(floor, tableId) {
  return { ...floor, tables: floor.tables.filter(t => t.id !== tableId) };
}

function _updateTable(floor, tableId, updates) {
  return { ...floor, tables: floor.tables.map(t => t.id === tableId ? { ...t, ...updates } : t) };
}

export function updateTableInFloor(floor, tableId, updates) {
  return _updateTable(floor, tableId, updates);
}

export function rotateTableInFloor(floor, tableId) {
  const table = floor.tables.find(t => t.id === tableId);
  if (!table || table.shape !== TableShape.RECTANGLE) return { success: false, floor };

  const newGridWidth = table.gridHeight;
  const newGridHeight = table.gridWidth;
  const cs = GridConfig.CELL_SIZE;

  if (
    !isWithinBounds(table.gridX, table.gridY, newGridWidth, newGridHeight) ||
    checkCollisionAtGrid(floor, table.gridX, table.gridY, newGridWidth, newGridHeight, tableId)
  ) {
    return { success: false, floor };
  }

  return {
    success: true,
    floor: _updateTable(floor, tableId, {
      gridWidth: newGridWidth,
      gridHeight: newGridHeight,
      width: newGridWidth * cs,
      height: newGridHeight * cs,
      rotation: (table.rotation + 90) % 360,
    }),
  };
}

export function moveTableInFloor(floor, tableId, newGridX, newGridY) {
  const table = floor.tables.find(t => t.id === tableId);
  if (!table) return { success: false, floor };

  if (!isWithinBounds(newGridX, newGridY, table.gridWidth, table.gridHeight)) return { success: false, floor };
  if (checkCollisionAtGrid(floor, newGridX, newGridY, table.gridWidth, table.gridHeight, tableId)) return { success: false, floor };

  const cs = GridConfig.CELL_SIZE;
  return { success: true, floor: _updateTable(floor, tableId, { gridX: newGridX, gridY: newGridY, x: newGridX * cs, y: newGridY * cs }) };
}

export function addObjectToFloor(floor, params) {
  if (!isWithinBounds(0, 0, params.gridWidth, params.gridHeight)) return { success: false, error: 'bounds', floor };

  const pos = findFreePosition(floor, params.gridWidth, params.gridHeight);
  if (!pos) return { success: false, error: 'space', floor };

  const obj = createFloorObject({ ...params, ...pos });
  return { success: true, floor: { ...floor, objects: [...(floor.objects || []), obj] }, object: obj };
}

export function deleteObjectFromFloor(floor, objectId) {
  return { ...floor, objects: (floor.objects || []).filter(o => o.id !== objectId) };
}

function _updateObject(floor, objectId, updates) {
  return { ...floor, objects: (floor.objects || []).map(o => o.id === objectId ? { ...o, ...updates } : o) };
}

export function moveObjectInFloor(floor, objectId, newGridX, newGridY) {
  const obj = (floor.objects || []).find(o => o.id === objectId);
  if (!obj) return { success: false, floor };

  if (!isWithinBounds(newGridX, newGridY, obj.gridWidth, obj.gridHeight)) return { success: false, floor };
  if (checkCollisionAtGrid(floor, newGridX, newGridY, obj.gridWidth, obj.gridHeight, objectId)) return { success: false, floor };

  const cs = GridConfig.CELL_SIZE;
  return { success: true, floor: _updateObject(floor, objectId, { gridX: newGridX, gridY: newGridY, x: newGridX * cs, y: newGridY * cs }) };
}

export function clearFloorItems(floor) {
  return { ...floor, tables: [], objects: [] };
}

export function migrateFloors(floors) {
  const cs = GridConfig.CELL_SIZE;
  return floors.map(floor => ({
    ...floor,
    objects: floor.objects || [],
    tables: floor.tables.map(table => {
      const t = { ...table };
      if (t.gridX === undefined) {
        t.gridX = Math.floor(t.x / cs);
        t.gridY = Math.floor(t.y / cs);
        t.gridWidth = Math.ceil(t.width / cs);
        t.gridHeight = Math.ceil(t.height / cs);
      }
      t.x = t.gridX * cs;
      t.y = t.gridY * cs;
      t.width = t.gridWidth * cs;
      t.height = t.gridHeight * cs;
      return t;
    }),
  }));
}

export function getMaxTableNo(floors) {
  let max = 0;
  floors.forEach(floor => {
    floor.tables.forEach(table => {
      const n = parseInt(table.tableNo);
      if (!isNaN(n) && n > max) max = n;
    });
  });
  return max;
}

export function findTableInFloor(floor, tableId) {
  return floor.tables.find(t => t.id === tableId);
}
