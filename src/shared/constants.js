export const GridConfig = Object.freeze({
  COLS: 10,
  ROWS: 6,
  CELL_SIZE: 100,
  WIDTH: 1000,
  HEIGHT: 600,
});

export const TableState = Object.freeze({
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
});

export const TableShape = Object.freeze({
  SQUARE: 'square',
  ROUND: 'round',
  RECTANGLE: 'rectangle',
});

export const ObjectType = Object.freeze({
  DOOR: 'door',
  STAIR: 'stair',
  WC: 'wc',
  CUSTOM: 'custom',
});
