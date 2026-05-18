import { GridConfig } from './constants.js';

function _rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return !(ax + aw <= bx || ax >= bx + bw || ay + ah <= by || ay >= by + bh);
}

export function checkCollision(floor, x, y, width, height, excludeId = null) {
  const tableHit = floor.tables.some(t => {
    if (t.id === excludeId) return false;
    return _rectOverlap(x, y, width, height, t.x, t.y, t.width, t.height);
  });

  if (tableHit) return true;

  return (floor.objects || []).some(o => {
    if (o.id === excludeId) return false;
    return _rectOverlap(x, y, width, height, o.x, o.y, o.width, o.height);
  });
}

export function checkCollisionAtGrid(floor, gridX, gridY, gridWidth, gridHeight, excludeId = null) {
  const cs = GridConfig.CELL_SIZE;
  return checkCollision(floor, gridX * cs, gridY * cs, gridWidth * cs, gridHeight * cs, excludeId);
}

export function findFreePosition(floor, gridWidth, gridHeight) {
  for (let gy = 0; gy <= GridConfig.ROWS - gridHeight; gy++) {
    for (let gx = 0; gx <= GridConfig.COLS - gridWidth; gx++) {
      if (!checkCollisionAtGrid(floor, gx, gy, gridWidth, gridHeight)) {
        return { gridX: gx, gridY: gy };
      }
    }
  }
  return null;
}

export function isWithinBounds(gridX, gridY, gridWidth, gridHeight) {
  return (
    gridX >= 0 &&
    gridY >= 0 &&
    gridX + gridWidth <= GridConfig.COLS &&
    gridY + gridHeight <= GridConfig.ROWS
  );
}
