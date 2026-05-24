# Floor Plan Editor

Interactive restaurant floor plan editor built with vanilla JavaScript and native ES modules. Create multi-floor layouts with tables, doors, stairs and WC objects via drag-and-drop, then export the result as JSON for use in any viewer or POS integration.

No build step required — runs directly in the browser via ES module imports.

## Modules

- **`create-floor-plan`** — Full editor interface. Add/manage floors, drag table templates onto the canvas, rotate and reposition tables, add fixed objects (door, stairs, WC, custom), export layout as JSON.
- **`show-floor-plan`** — Read-only viewer. Load a JSON file and display the floor plan with table state colors (available, occupied, reserved). Table states are hidden in the editor view and only visible in the viewer.

## Features

- Multi-floor support — add, remove, rename floors
- Drag-and-drop placement and repositioning (mouse + touch)
- Three table shapes: square, round, rectangle
- Fixed floor objects: door, stairs, WC, custom
- Grid-based collision detection to prevent overlapping objects
- Bulk table add with auto-placement
- JSON export / import
- Responsive — switches to list view on mobile

## Usage

Include either module as a Cordova component or drop it into any web page. Pass the editor a container element and an optional initial JSON layout; the viewer takes a JSON layout and a table-state map keyed by table ID.

## Output Format

The exported JSON contains an array of floors, each with a name and an array of objects. Every object records its type, shape, position (grid coordinates), size, rotation, and label — making it straightforward to render in any canvas or SVG-based viewer.