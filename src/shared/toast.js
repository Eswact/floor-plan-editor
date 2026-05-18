let _container = null;

function _getContainer() {
  if (!_container) {
    _container = document.createElement('div');
    _container.className = 'toast-container';
    document.body.appendChild(_container);
  }
  return _container;
}

function _show(message, type) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;

  const container = _getContainer();
  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add('toast-visible'));

  setTimeout(() => {
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, 3000);
}

export function success(message) { _show(message, 'success'); }
export function error(message)   { _show(message, 'error'); }
