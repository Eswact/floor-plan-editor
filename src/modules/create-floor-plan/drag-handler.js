import { GridConfig } from '../../shared/constants.js';

let canvasEl = null;
let onTemplateDrop = null;
let dragOffset = { x: 0, y: 0 };
let templateTouch = { active: false, clone: null, data: {} };

export function init(canvas, callbacks) {
  canvasEl = canvas;
  onTemplateDrop = callbacks.onTemplateDrop;
  canvas.addEventListener('dragover', e => { e.preventDefault(); });
  canvas.addEventListener('drop', _handleCanvasDrop);
}

function _handleCanvasDrop(e) {
  e.preventDefault();
  const dt = e.dataTransfer;
  if (dt.getData('isTemplate') !== 'true') return;
  const data = {
    shape: dt.getData('shape'),
    size: parseInt(dt.getData('size')),
    gridWidth: parseInt(dt.getData('gridWidth')),
    gridHeight: parseInt(dt.getData('gridHeight')),
  };
  const rect = canvasEl.getBoundingClientRect();
  if (onTemplateDrop) onTemplateDrop(data, e.clientX - rect.left, e.clientY - rect.top);
}

export function setupTemplate(el, data, onDrop) {
  el.draggable = true;
  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('shape', data.shape);
    e.dataTransfer.setData('size', String(data.size));
    e.dataTransfer.setData('gridWidth', String(data.gridWidth));
    e.dataTransfer.setData('gridHeight', String(data.gridHeight));
    e.dataTransfer.setData('isTemplate', 'true');
  });
  _setupTemplateTouchDrag(el, data, onDrop);
}

function _setupTemplateTouchDrag(el, data, onDrop) {
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    templateTouch.active = true;
    templateTouch.data = data;

    const clone = el.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed',
      left: (touch.clientX - el.offsetWidth / 2) + 'px',
      top: (touch.clientY - el.offsetHeight / 2) + 'px',
      opacity: '0.7',
      zIndex: '9999',
      pointerEvents: 'none',
      width: el.offsetWidth + 'px',
      height: el.offsetHeight + 'px',
    });
    document.body.appendChild(clone);
    templateTouch.clone = clone;
    el.style.opacity = '0.3';
  }, { passive: false });

  el.addEventListener('touchmove', e => {
    if (!templateTouch.active) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (templateTouch.clone) {
      templateTouch.clone.style.left = (touch.clientX - templateTouch.clone.offsetWidth / 2) + 'px';
      templateTouch.clone.style.top = (touch.clientY - templateTouch.clone.offsetHeight / 2) + 'px';
    }
  }, { passive: false });

  el.addEventListener('touchend', e => {
    if (!templateTouch.active) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const canvasRect = canvasEl.getBoundingClientRect();

    el.style.opacity = '1';
    if (templateTouch.clone) { templateTouch.clone.remove(); templateTouch.clone = null; }

    const inCanvas = (
      touch.clientX >= canvasRect.left && touch.clientX <= canvasRect.right &&
      touch.clientY >= canvasRect.top && touch.clientY <= canvasRect.bottom
    );
    if (inCanvas) {
      const cb = onDrop || onTemplateDrop;
      if (cb) cb(templateTouch.data, touch.clientX - canvasRect.left, touch.clientY - canvasRect.top);
    }

    templateTouch.active = false;
    templateTouch.data = {};
  }, { passive: false });
}

export function setupTableDrag(el, table, onMoved) {
  el.draggable = true;
  el.addEventListener('dragstart', e => {
    const rect = el.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', e => {
    el.classList.remove('dragging');
    const rect = canvasEl.getBoundingClientRect();
    const newGridX = Math.floor((e.clientX - rect.left - dragOffset.x) / GridConfig.CELL_SIZE);
    const newGridY = Math.floor((e.clientY - rect.top - dragOffset.y) / GridConfig.CELL_SIZE);
    onMoved(table.id, newGridX, newGridY);
  });
  _setupTableTouchDrag(el, table, onMoved);
}

function _setupTableTouchDrag(el, table, onMoved) {
  let active = false;
  let touchStart = { x: 0, y: 0 };

  el.addEventListener('touchstart', e => {
    if (e.target.classList.contains('delete-btn') || e.target.classList.contains('rotate-btn')) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    active = true;
    touchStart.x = touch.clientX - rect.left;
    touchStart.y = touch.clientY - rect.top;
    el.classList.add('dragging');
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!active) return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvasRect = canvasEl.getBoundingClientRect();
    el.style.left = (touch.clientX - canvasRect.left - touchStart.x) + 'px';
    el.style.top = (touch.clientY - canvasRect.top - touchStart.y) + 'px';
  }, { passive: false });

  el.addEventListener('touchend', e => {
    if (!active) return;
    active = false;
    el.classList.remove('dragging');
    const touch = e.changedTouches[0];
    const canvasRect = canvasEl.getBoundingClientRect();
    const newGridX = Math.floor((touch.clientX - canvasRect.left - touchStart.x) / GridConfig.CELL_SIZE);
    const newGridY = Math.floor((touch.clientY - canvasRect.top - touchStart.y) / GridConfig.CELL_SIZE);
    onMoved(table.id, newGridX, newGridY);
  }, { passive: true });
}

export function setupObjectDrag(el, obj, onMoved) {
  el.draggable = true;
  el.addEventListener('dragstart', e => {
    const rect = el.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', e => {
    el.classList.remove('dragging');
    const rect = canvasEl.getBoundingClientRect();
    const newGridX = Math.floor((e.clientX - rect.left - dragOffset.x) / GridConfig.CELL_SIZE);
    const newGridY = Math.floor((e.clientY - rect.top - dragOffset.y) / GridConfig.CELL_SIZE);
    onMoved(obj.id, newGridX, newGridY);
  });
  _setupObjectTouchDrag(el, obj, onMoved);
}

function _setupObjectTouchDrag(el, obj, onMoved) {
  let active = false;
  let touchStart = { x: 0, y: 0 };

  el.addEventListener('touchstart', e => {
    if (e.target.classList.contains('delete-btn')) return;
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();
    active = true;
    touchStart.x = touch.clientX - rect.left;
    touchStart.y = touch.clientY - rect.top;
    el.classList.add('dragging');
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!active) return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvasRect = canvasEl.getBoundingClientRect();
    el.style.left = (touch.clientX - canvasRect.left - touchStart.x) + 'px';
    el.style.top = (touch.clientY - canvasRect.top - touchStart.y) + 'px';
  }, { passive: false });

  el.addEventListener('touchend', e => {
    if (!active) return;
    active = false;
    el.classList.remove('dragging');
    const touch = e.changedTouches[0];
    const canvasRect = canvasEl.getBoundingClientRect();
    const newGridX = Math.floor((touch.clientX - canvasRect.left - touchStart.x) / GridConfig.CELL_SIZE);
    const newGridY = Math.floor((touch.clientY - canvasRect.top - touchStart.y) / GridConfig.CELL_SIZE);
    onMoved(obj.id, newGridX, newGridY);
  }, { passive: true });
}
