import { GridConfig, ObjectType } from '../../shared/constants.js';
import * as FloorService from '../../shared/floor-service.js';
import * as CollisionService from '../../shared/collision-service.js';
import * as StorageService from '../../shared/storage-service.js';
import * as FloorRenderer from '../../shared/renderer.js';
import * as DragHandler from './drag-handler.js';
import * as Toast from '../../shared/toast.js';

let floors = [];
let currentFloorIndex = 0;
let tableNoCounter = 1;
let selectedTableId = null;

const els = {
  canvas: document.getElementById('canvas'),
  floorSelect: document.getElementById('floorSelect'),
  jsonOutput: document.getElementById('jsonOutput'),
  propertiesModal: document.getElementById('propertiesModal'),
  addStairModal: document.getElementById('addStairModal'),
  addWcModal: document.getElementById('addWcModal'),
  addCustomObjectModal: document.getElementById('addCustomObjectModal'),
  addTableModal: document.getElementById('addTableModal'),
  tableNumberInput: document.getElementById('tableNumberInput'),
  tableCapacityInput: document.getElementById('tableCapacityInput'),
  mobileTableContainer: document.getElementById('mobileTableContainer'),
  floorNameInput: document.getElementById('floorNameInput'),
};

function init() {
  _setupCanvas();
  DragHandler.init(els.canvas, { onTemplateDrop: _handleTemplateDrop });
  _setupTemplates();
  _bindEvents();
  floors = FloorService.addFloor(floors);
  currentFloorIndex = 0;
  _sync();
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1000) _renderMobileList();
  });
}

function _setupCanvas() {
  els.canvas.style.width = GridConfig.WIDTH + 'px';
  els.canvas.style.height = GridConfig.HEIGHT + 'px';
  els.canvas.style.backgroundSize = GridConfig.CELL_SIZE + 'px ' + GridConfig.CELL_SIZE + 'px';
}

function _setupTemplates() {
  document.querySelectorAll('.template-table').forEach(el => {
    DragHandler.setupTemplate(el, {
      shape: el.dataset.shape,
      size: parseInt(el.dataset.size),
      gridWidth: parseInt(el.dataset.gridWidth),
      gridHeight: parseInt(el.dataset.gridHeight),
    }, _handleTemplateDrop);
  });
}

function _bindEvents() {
  document.getElementById('addFloorBtn').addEventListener('click', _handleAddFloor);
  document.getElementById('removeFloorBtn').addEventListener('click', _handleRemoveFloor);
  document.getElementById('renameFloorBtn').addEventListener('click', _handleRenameFloor);
  els.floorSelect.addEventListener('change', _handleChangeFloor);
  document.getElementById('exportJsonBtn').addEventListener('click', _handleExport);
  document.getElementById('importJsonBtn').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', _handleImport);
  document.getElementById('clearFloorBtn').addEventListener('click', _handleClearFloor);
  document.getElementById('applyPropertiesBtn').addEventListener('click', _handleApplyProperties);
  document.getElementById('closeModalBtn').addEventListener('click', _hidePropertiesModal);
  document.getElementById('closeAddTableModalBtn').addEventListener('click', () => _hideModal(els.addTableModal));
  document.getElementById('addDoorBtn').addEventListener('click', () => _handleAddObject(ObjectType.DOOR, 1, 1));
  document.getElementById('addStairModalBtn').addEventListener('click', () => _showModal(els.addStairModal));
  document.getElementById('closeStairModalBtn').addEventListener('click', () => _hideModal(els.addStairModal));
  document.getElementById('addStairBtn').addEventListener('click', _handleAddStair);
  document.getElementById('addWcModalBtn').addEventListener('click', () => _showModal(els.addWcModal));
  document.getElementById('closeWcModalBtn').addEventListener('click', () => _hideModal(els.addWcModal));
  document.getElementById('addWcBtn').addEventListener('click', _handleAddWc);
  document.getElementById('addObjectModalBtn').addEventListener('click', () => _showModal(els.addCustomObjectModal));
  document.getElementById('closeCustomObjectModalBtn').addEventListener('click', () => _hideModal(els.addCustomObjectModal));
  document.getElementById('addCustomObjectBtn').addEventListener('click', _handleAddCustomObject);
  document.getElementById('addTableMobileBtn').addEventListener('click', () => _showModal(els.addTableModal));

  document.querySelectorAll('.table-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(document.getElementById('autoTableCountInput').value) || 1;
      _handleAddMultipleTables(btn.dataset.shape, parseInt(btn.dataset.size), parseInt(btn.dataset.gridWidth), parseInt(btn.dataset.gridHeight), count);
    });
  });

  document.getElementById('addMultiTablesBtn').addEventListener('click', () => {
    const select = document.getElementById('multiTableShapeSelect');
    const opt = select.options[select.selectedIndex];
    _handleAddMultipleTables(
      select.value,
      parseInt(opt.dataset.size),
      parseInt(opt.dataset.gridWidth),
      parseInt(opt.dataset.gridHeight),
      parseInt(document.getElementById('multiTableCountInput').value)
    );
  });

  const modals = [els.propertiesModal, els.addTableModal, els.addStairModal, els.addWcModal, els.addCustomObjectModal];
  modals.forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) _hideModal(modal); });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modals.forEach(_hideModal);
  });
}

function _showModal(modal) { modal.classList.add('active'); }
function _hideModal(modal) { modal.classList.remove('active'); }

function _hidePropertiesModal() {
  selectedTableId = null;
  _hideModal(els.propertiesModal);
  _render();
}

function _handleAddFloor() {
  floors = FloorService.addFloor(floors);
  currentFloorIndex = floors.length - 1;
  _sync();
}

function _handleRemoveFloor() {
  if (floors.length <= 1) { Toast.error('There must be at least one floor!'); return; }
  if (confirm('Are you sure you want to delete this floor?')) {
    floors = FloorService.removeFloor(floors, currentFloorIndex);
    currentFloorIndex = Math.max(0, currentFloorIndex - 1);
    _sync();
  }
}

function _handleRenameFloor() {
  const name = els.floorNameInput.value.trim();
  if (!name) return;
  floors = FloorService.renameFloor(floors, currentFloorIndex, name);
  els.floorNameInput.value = '';
  FloorRenderer.updateFloorSelect(els.floorSelect, floors, currentFloorIndex);
}

function _handleChangeFloor() {
  currentFloorIndex = parseInt(els.floorSelect.value);
  selectedTableId = null;
  _hideModal(els.propertiesModal);
  _render();
}

function _handleTemplateDrop(templateData, pixelX, pixelY) {
  const gridX = Math.floor(pixelX / GridConfig.CELL_SIZE);
  const gridY = Math.floor(pixelY / GridConfig.CELL_SIZE);
  _placeTable(templateData.shape, templateData.size, templateData.gridWidth, templateData.gridHeight, gridX, gridY);
}

function _placeTable(shape, capacity, gridWidth, gridHeight, gridX, gridY) {
  const result = FloorService.addTableToFloor(_currentFloor(), {
    shape, capacity, gridWidth, gridHeight, gridX, gridY, tableNo: tableNoCounter,
  });
  if (!result.success) { Toast.error('Cannot place a table in this area!'); return; }
  tableNoCounter++;
  _updateCurrentFloor(result.floor);
  _sync();
}

function _handleTableMoved(tableId, newGridX, newGridY) {
  const result = FloorService.moveTableInFloor(_currentFloor(), tableId, newGridX, newGridY);
  _updateCurrentFloor(result.floor);
  _sync();
}

function _handleTableRotate(tableId) {
  const result = FloorService.rotateTableInFloor(_currentFloor(), tableId);
  if (!result.success) Toast.error('Cannot rotate at this position!');
  _updateCurrentFloor(result.floor);
  _sync();
}

function _handleTableDelete(tableId) {
  _updateCurrentFloor(FloorService.deleteTableFromFloor(_currentFloor(), tableId));
  if (selectedTableId === tableId) {
    selectedTableId = null;
    _hideModal(els.propertiesModal);
  }
  _sync();
}

function _handleTableClick(table) {
  selectedTableId = table.id;
  els.tableNumberInput.value = table.tableNo;
  els.tableCapacityInput.value = table.capacity;
  _showModal(els.propertiesModal);
  setTimeout(() => { els.tableNumberInput.focus(); els.tableNumberInput.select(); }, 300);
  _render();
}

function _handleApplyProperties() {
  if (!selectedTableId) return;
  const table = FloorService.findTableInFloor(_currentFloor(), selectedTableId);
  if (!table) return;

  const newCapacity = parseInt(els.tableCapacityInput.value);
  const newTableNo = els.tableNumberInput.value.trim();

  if (newCapacity < 1 || newCapacity > 20) { Toast.error('Capacity must be between 1 and 20!'); return; }
  if (!newTableNo) { Toast.error('Table number cannot be empty!'); return; }

  const duplicate = _currentFloor().tables.find(t => t.id !== table.id && String(t.tableNo) === String(newTableNo));
  if (duplicate) { Toast.error(`"${newTableNo}" is already used on this floor!`); return; }

  _updateCurrentFloor(FloorService.updateTableInFloor(_currentFloor(), selectedTableId, {
    capacity: newCapacity,
    tableNo: newTableNo,
  }));
  _hidePropertiesModal();
  _sync();
}

function _handleAddMultipleTables(shape, size, gridWidth, gridHeight, count) {
  let floor = _currentFloor();
  let added = 0;
  for (let i = 0; i < count; i++) {
    const pos = CollisionService.findFreePosition(floor, gridWidth, gridHeight);
    if (!pos) break;
    const result = FloorService.addTableToFloor(floor, {
      shape, capacity: size, gridWidth, gridHeight, gridX: pos.gridX, gridY: pos.gridY, tableNo: tableNoCounter,
    });
    if (result.success) { floor = result.floor; tableNoCounter++; added++; }
  }
  _updateCurrentFloor(floor);
  _hideModal(els.addTableModal);
  _sync();
  if (added < count) Toast.error('Not enough space, some tables could not be added.');
}

function _handleAddObject(type, gridWidth, gridHeight, name) {
  const result = FloorService.addObjectToFloor(_currentFloor(), { type, gridWidth, gridHeight, name });
  if (!result.success) { Toast.error('Not enough free space!'); return; }
  _updateCurrentFloor(result.floor);
  _sync();
}

function _handleAddStair() {
  const w = parseInt(document.getElementById('stairWidthInput').value);
  const h = parseInt(document.getElementById('stairHeightInput').value);
  if (w < 1 || h < 1 || w > GridConfig.COLS || h > GridConfig.ROWS) { Toast.error('Invalid dimensions!'); return; }
  _handleAddObject(ObjectType.STAIR, w, h);
  _hideModal(els.addStairModal);
}

function _handleAddWc() {
  const w = parseInt(document.getElementById('wcWidthInput').value);
  const h = parseInt(document.getElementById('wcHeightInput').value);
  if (w < 1 || h < 1 || w > GridConfig.COLS || h > GridConfig.ROWS) { Toast.error('Invalid dimensions!'); return; }
  _handleAddObject(ObjectType.WC, w, h);
  _hideModal(els.addWcModal);
}

function _handleAddCustomObject() {
  const name = document.getElementById('customObjectNameInput').value;
  const w = parseInt(document.getElementById('customObjectWidthInput').value);
  const h = parseInt(document.getElementById('customObjectHeightInput').value);
  if (w < 1 || h < 1 || w > GridConfig.COLS || h > GridConfig.ROWS) { Toast.error('Invalid dimensions!'); return; }
  _handleAddObject(ObjectType.CUSTOM, w, h, name || 'Object');
  _hideModal(els.addCustomObjectModal);
}

function _handleObjectMoved(objId, newGridX, newGridY) {
  const result = FloorService.moveObjectInFloor(_currentFloor(), objId, newGridX, newGridY);
  _updateCurrentFloor(result.floor);
  _sync();
}

function _handleObjectDelete(objId) {
  _updateCurrentFloor(FloorService.deleteObjectFromFloor(_currentFloor(), objId));
  _sync();
}

function _handleExport() {
  StorageService.exportToFile(floors, 'floors-layout.json');
}

function _handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  StorageService.importFromFile(file).then(importedFloors => {
    floors = importedFloors;
    currentFloorIndex = 0;
    tableNoCounter = FloorService.getMaxTableNo(floors) + 1;
    selectedTableId = null;
    _hideModal(els.propertiesModal);
    _sync();
    Toast.success('Design loaded successfully!');
  }).catch(() => Toast.error('Invalid JSON file!'));
  e.target.value = '';
}

function _handleClearFloor() {
  if (!confirm('Are you sure you want to clear all tables on this floor?')) return;
  _updateCurrentFloor(FloorService.clearFloorItems(_currentFloor()));
  selectedTableId = null;
  _hideModal(els.propertiesModal);
  _sync();
}

function _render() {
  FloorRenderer.renderFloor(els.canvas, _currentFloor(), {
    selectedTableId,
    ignoreState: true,
    onTableClick: _handleTableClick,
    onTableDelete: _handleTableDelete,
    onTableRotate: _handleTableRotate,
    onObjectDelete: _handleObjectDelete,
    onTableDragSetup: (el, table) => DragHandler.setupTableDrag(el, table, _handleTableMoved),
    onObjectDragSetup: (el, obj) => DragHandler.setupObjectDrag(el, obj, _handleObjectMoved),
  });
  els.jsonOutput.textContent = JSON.stringify(floors, null, 2);
  if (window.innerWidth <= 1000) _renderMobileList();
}

function _renderMobileList() {
  FloorRenderer.renderMobileList(els.mobileTableContainer, _currentFloor(), {
    onEdit: tableId => {
      const table = FloorService.findTableInFloor(_currentFloor(), tableId);
      if (table) _handleTableClick(table);
    },
    onDelete: _handleTableDelete,
  });
}

function _sync() {
  FloorRenderer.updateFloorSelect(els.floorSelect, floors, currentFloorIndex);
  FloorRenderer.updateStats(floors, _currentFloor());
  _render();
}

function _currentFloor() { return floors[currentFloorIndex]; }

function _updateCurrentFloor(newFloor) {
  floors = floors.map((f, i) => i === currentFloorIndex ? newFloor : f);
}

document.addEventListener('DOMContentLoaded', init);
