import { TableShape } from './constants.js';
import { getShapeName, getObjectLabel } from './utils.js';

export function createTableElement(table, options = {}) {
  const el = document.createElement('div');
  el.dataset.tableid = table.id;
  el.className = 'table-element';
  if (table.shape === TableShape.ROUND) el.classList.add('round');
  if (options.isSelected) el.classList.add('selected');
  if (table.state) el.classList.add(table.state);

  el.style.left = `${table.x}px`;
  el.style.top = `${table.y}px`;
  el.style.width = `${table.width}px`;
  el.style.height = `${table.height}px`;

  const tableNo = document.createElement('span');
  tableNo.className = 'table-no';
  tableNo.textContent = table.tableNo;
  el.appendChild(tableNo);

  if (table.desc) {
    const desc = document.createElement('span');
    desc.className = 'table-desc';
    desc.textContent = table.desc;
    el.appendChild(desc);
  }

  if (options.onDelete) {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', e => { e.stopPropagation(); options.onDelete(table.id); });
    el.appendChild(btn);
  }

  if (options.onRotate && table.shape === TableShape.RECTANGLE) {
    const btn = document.createElement('button');
    btn.className = 'rotate-btn';
    btn.innerHTML = '&#8635;';
    btn.addEventListener('click', e => { e.stopPropagation(); options.onRotate(table.id); });
    el.appendChild(btn);
  }

  if (options.onClick) {
    el.addEventListener('click', () => options.onClick(table));
  }

  return el;
}

export function createObjectElement(obj, options = {}) {
  const el = document.createElement('div');
  el.dataset.objectid = obj.id;
  el.className = `object-element ${obj.type}`;
  el.style.left = `${obj.x}px`;
  el.style.top = `${obj.y}px`;
  el.style.width = `${obj.width}px`;
  el.style.height = `${obj.height}px`;

  const span = document.createElement('span');
  span.textContent = getObjectLabel(obj);
  el.appendChild(span);

  if (options.onDelete) {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', e => { e.stopPropagation(); options.onDelete(obj.id); });
    el.appendChild(btn);
  }

  return el;
}

export function renderFloor(canvas, floor, options = {}) {
  canvas.innerHTML = '';
  if (!floor) return;

  (floor.objects || []).forEach(obj => {
    const el = createObjectElement(obj, { onDelete: options.onObjectDelete });
    if (options.onObjectDragSetup) options.onObjectDragSetup(el, obj);
    canvas.appendChild(el);
  });

  floor.tables.forEach(table => {
    const el = createTableElement(table, {
      isSelected: options.selectedTableId === table.id,
      onDelete: options.onTableDelete,
      onRotate: options.onTableRotate,
      onClick: options.onTableClick,
    });
    if (options.onTableDragSetup) options.onTableDragSetup(el, table);
    canvas.appendChild(el);
  });
}

export function renderMobileList(container, floor, options = {}) {
  container.innerHTML = '';

  if (!floor || floor.tables.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#6c757d;padding:20px;">No tables added yet</p>';
    return;
  }

  floor.tables.forEach(table => {
    const item = document.createElement('div');
    item.className = 'mobile-table-item';
    item.dataset.tableid = table.id;
    if (table.state) item.classList.add(table.state);

    const info = document.createElement('div');
    info.className = 'mobile-table-info';

    const h4 = document.createElement('h4');
    h4.textContent = `Table ${table.tableNo}`;

    const p = document.createElement('p');
    p.textContent = `${table.capacity} People - ${getShapeName(table.shape)}`;
    if (table.desc) p.textContent += ` - ${table.desc}`;

    info.appendChild(h4);
    info.appendChild(p);
    item.appendChild(info);

    if (options.onEdit || options.onDelete) {
      const actions = document.createElement('div');
      actions.className = 'mobile-table-actions';

      if (options.onEdit) {
        const editBtn = document.createElement('button');
        editBtn.className = 'mobile-edit-btn';
        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"/></svg>';
        editBtn.addEventListener('click', e => { e.stopPropagation(); options.onEdit(table.id); });
        actions.appendChild(editBtn);
      }

      if (options.onDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'mobile-delete-btn danger';
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>';
        deleteBtn.addEventListener('click', e => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this table?')) options.onDelete(table.id);
        });
        actions.appendChild(deleteBtn);
      }

      item.appendChild(actions);
    }

    if (options.onClick) {
      item.addEventListener('click', () => options.onClick(table));
    }

    container.appendChild(item);
  });
}

export function updateFloorSelect(selectEl, floors, currentIndex) {
  selectEl.innerHTML = floors
    .map((floor, i) => `<option value="${i}">${floor.name}</option>`)
    .join('');
  selectEl.value = currentIndex;
}

export function updateStats(floors, currentFloor) {
  const totalTables = floors.reduce((sum, f) => sum + f.tables.length, 0);
  const get = id => document.getElementById(id);
  if (get('totalFloors')) get('totalFloors').textContent = floors.length;
  if (get('totalTables')) get('totalTables').textContent = totalTables;
  if (get('currentFloorTables')) get('currentFloorTables').textContent = currentFloor ? currentFloor.tables.length : 0;
}
