import { migrateFloors } from './floor-service.js';

export function exportToFile(floors, filename = 'restaurant-layout.json') {
  const blob = new Blob([JSON.stringify(floors, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        resolve(migrateFloors(JSON.parse(e.target.result)));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function importFromUrl(url) {
  const data = await fetch(url).then(r => r.json());
  return migrateFloors(data);
}
