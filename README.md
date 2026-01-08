# Shadow Realms - Web-Based MUD

A modern, clean web-based Multi-User Dungeon (MUD) game inspired by classic MUDs like Aardwolf. Built entirely with vanilla HTML, CSS, and JavaScript for a serverless experience.

## Features

### Core Gameplay
- **Text-based adventure** with command-line interface
- **Room exploration** with directional movement (north, south, east, west)
- **Character system** with stats (HP, MP, XP, STR, DEX, INT, WIS)
- **Inventory management** with item pickup, drop, and use
- **ASCII map display** showing your current location and connected rooms
- **Save/load system** using browser localStorage

### UI Components
- **Terminal panel** - Main command input/output area with scrolling history
- **Map panel** - Visual representation of your surroundings
- **Character panel** - Real-time stats, health/mana bars, and level progression
- **Inventory panel** - Visual grid showing your items with icons
- **Quick commands** - Button shortcuts for common actions

### Theme System
- **CSS variables** for easy theming - change the entire look by modifying CSS custom properties
- **Modern but timeless design** - clean, readable interface that won't feel dated
- **Responsive layout** - adapts to different screen sizes

## Getting Started

### Installation
1. Clone this repository
2. Open `index.html` in a modern web browser
3. Start playing!

No build process, no dependencies, no server required (for now).

### How to Play

#### Movement Commands
- `north`, `n` - Move north
- `south`, `s` - Move south
- `east`, `e` - Move east
- `west`, `w` - Move west

#### Observation Commands
- `look`, `l` - Look around the current room
- `examine <item>`, `ex <item>` - Examine an item closely

#### Inventory Commands
- `inventory`, `inv`, `i` - Show your inventory
- `take <item>`, `get <item>` - Pick up an item
- `drop <item>` - Drop an item from inventory
- `use <item>` - Use an item (healing items, etc.)

#### Character Commands
- `stats`, `status` - View your character stats
- `rest` - Rest to recover HP and MP

#### System Commands
- `help` - Show command list
- `save` - Save your game
- `clear` - Clear the terminal output

### Command History
- **↑ Arrow Up** - Cycle through previous commands
- **↓ Arrow Down** - Cycle forward through command history

## Customizing the Theme

The entire UI can be reskinned by modifying CSS variables in `styles.css`. Look for the `:root` section at the top of the file:

```css
:root {
    /* Colors */
    --bg-primary: #1a1a2e;
    --text-primary: #e4e4e7;
    --accent-primary: #3b82f6;
    /* ...and many more */
}
```

Change these values to create your own theme instantly!

## Architecture

### Modular Design
The codebase is structured for easy extension and future server integration:

- **GameState** - Central state management
- **Player** - Character data and methods
- **World/Room** - Game world structure
- **CommandParser** - Command interpretation and execution
- **UIManager** - DOM manipulation and display updates

### Adding New Features

#### Add a new room:
```javascript
this.addRoom(new Room(
    'room_id',
    'Room Name',
    'Room description...',
    { north: 'other_room_id', south: 'another_room_id' }
));
```

#### Add new commands:
```javascript
this.commands['mycommand'] = (args) => this.myCommand(args);
```

#### Add new items:
```javascript
room.items.push({
    name: 'Item Name',
    type: 'type',
    effect: 'heal',
    value: 10
});
```

## Future Enhancements

This game is built to easily transition to a client-server architecture:
- Replace `GameState` with API calls
- Add WebSocket support for real-time multiplayer
- Implement server-side game logic
- Add authentication and persistent player data
- Expand combat system with enemies and NPCs

## Tech Stack

- **HTML5** - Structure
- **CSS3** - Styling with CSS Grid, Flexbox, and Custom Properties
- **Vanilla JavaScript** - Game logic (no frameworks)
- **localStorage API** - Save system

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- CSS Custom Properties
- ES6 JavaScript
- localStorage

## License

See LICENSE file for details.