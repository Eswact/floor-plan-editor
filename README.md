# Floor Plan Editor

Interactive restaurant floor plan editor built with vanilla JavaScript and native ES modules. Create multi-floor layouts with tables, doors, stairs and WC objects via drag-and-drop, then export the result as JSON for use in any viewer or POS integration.

## Modules

- **`create-floor-plan`** — Full editor interface. Add/manage floors, drag table templates onto the canvas, rotate and reposition tables, add fixed objects (door, stairs, WC, custom), export layout as JSON.
- **`show-floor-plan`** — Read-only viewer. Load a JSON file and display the floor plan with table state colors (available, occupied, reserved).

## Features

- Multi-floor support — add, remove, rename floors
- Drag-and-drop placement and repositioning (mouse + touch)
- Three table shapes: square, round, rectangle
- Fixed floor objects: door, stairs, WC, custom
- Grid-based collision detection
- Bulk table add with auto-placement
- JSON export / import
- Responsive — switches to list view on mobile