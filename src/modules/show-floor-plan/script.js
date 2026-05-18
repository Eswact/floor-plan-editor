import { GridConfig } from '../../shared/constants.js';
import * as FloorService from '../../shared/floor-service.js';
import * as StorageService from '../../shared/storage-service.js';
import * as FloorRenderer from '../../shared/renderer.js';
import * as Toast from '../../shared/toast.js';

let floors = [];
let currentFloorIndex = 0;
let onTableClick = null;

const els = {
  canvas: document.getElementById('canvas'),
  floorSelect: document.getElementById('floorSelect'),
  fileInput: document.getElementById('fileInput'),
  loadJsonBtn: document.getElementById('loadJsonBtn'),
  mobileTableContainer: document.getElementById('mobileTableContainer'),
};

function init() {
  _setupCanvas();
  _bindEvents();
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1000) _renderMobileList();
  });
}

function _setupCanvas() {
  els.canvas.style.width = GridConfig.WIDTH + 'px';
  els.canvas.style.height = GridConfig.HEIGHT + 'px';
  els.canvas.style.backgroundSize = GridConfig.CELL_SIZE + 'px ' + GridConfig.CELL_SIZE + 'px';
}

function _bindEvents() {
  els.loadJsonBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', _handleImport);
  els.floorSelect.addEventListener('change', () => {
    currentFloorIndex = parseInt(els.floorSelect.value);
    _render();
  });
}

function _handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  StorageService.importFromFile(file).then(importedFloors => {
    _loadData(importedFloors);
    Toast.success('Layout loaded successfully!');
  }).catch(err => {
    Toast.error('Invalid JSON file!');
    console.error(err);
  });
  e.target.value = '';
}

function _loadData(floorsData) {
  floors = floorsData;
  currentFloorIndex = 0;
  FloorRenderer.updateFloorSelect(els.floorSelect, floors, currentFloorIndex);
  _render();
}

function _render() {
  FloorRenderer.renderFloor(els.canvas, _currentFloor(), {
    onTableClick: table => { if (onTableClick) onTableClick(table); },
  });
  FloorRenderer.updateStats(floors, _currentFloor());
  if (window.innerWidth <= 1000) _renderMobileList();
}

function _renderMobileList() {
  FloorRenderer.renderMobileList(els.mobileTableContainer, _currentFloor(), {
    onClick: table => { if (onTableClick) onTableClick(table); },
  });
}

function _currentFloor() { return floors[currentFloorIndex]; }

export function setOnTableClick(callback) { onTableClick = callback; }

export function loadFromData(floorsData) {
  try {
    _loadData(FloorService.migrateFloors(floorsData));
    return true;
  } catch (err) {
    console.error('Error loading data:', err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();

  fetch('../../assets/data/example.json')
    .then(r => r.json())
    .then(data => loadFromData(data))
    .catch(err => console.error('Error loading JSON file:', err));

  setOnTableClick(table => {
    console.log('Clicked Table:', table);
    Toast.success('Table No: ' + table.tableNo);
  });
});
