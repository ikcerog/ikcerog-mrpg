// ===========================
// Game State Manager
// ===========================
class GameState {
    constructor() {
        this.player = null;
        this.world = null;
        this.currentRoom = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.time = { day: 1, hour: 8 };
    }

    initialize() {
        this.player = new Player('Adventurer');
        this.world = new World();
        this.currentRoom = this.world.getRoom('town_square');
    }

    save() {
        const saveData = {
            player: this.player.serialize(),
            currentRoom: this.currentRoom.id,
            time: this.time
        };
        localStorage.setItem('mudSave', JSON.stringify(saveData));
    }

    load() {
        const saveData = localStorage.getItem('mudSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player.deserialize(data.player);
            this.currentRoom = this.world.getRoom(data.currentRoom);
            this.time = data.time;
            return true;
        }
        return false;
    }
}

// ===========================
// Player Character
// ===========================
class Player {
    constructor(name) {
        this.name = name;
        this.level = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.mp = 50;
        this.maxMp = 50;
        this.xp = 0;
        this.xpToLevel = 100;
        this.gold = 0;
        this.stats = {
            str: 10,
            dex: 10,
            int: 10,
            wis: 10
        };
        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
        this.maxHp += 20;
        this.maxMp += 10;
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        this.stats.str += 2;
        this.stats.dex += 2;
        this.stats.int += 2;
        this.stats.wis += 2;
        return true;
    }

    addItem(item) {
        if (this.inventory.length < 20) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }

    removeItem(itemName) {
        const index = this.inventory.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (index !== -1) {
            return this.inventory.splice(index, 1)[0];
        }
        return null;
    }

    serialize() {
        return JSON.stringify(this);
    }

    deserialize(data) {
        Object.assign(this, JSON.parse(data));
    }
}

// ===========================
// World & Rooms
// ===========================
class Room {
    constructor(id, name, description, exits = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.exits = exits; // { north: 'room_id', south: 'room_id', etc. }
        this.items = [];
        this.npcs = [];
        this.enemies = [];
    }
}

class World {
    constructor() {
        this.rooms = new Map();
        this.initializeWorld();
    }

    initializeWorld() {
        // Town Square
        this.addRoom(new Room(
            'town_square',
            'Town Square',
            'A bustling town square with a fountain in the center. Merchants hawk their wares while townsfolk go about their business.',
            { north: 'market', south: 'tavern', east: 'temple', west: 'forest_edge' }
        ));

        // Market
        this.addRoom(new Room(
            'market',
            'Marketplace',
            'Colorful stalls line the cobblestone streets. The smell of fresh bread and exotic spices fills the air.',
            { south: 'town_square', east: 'blacksmith' }
        ));

        // Blacksmith
        this.addRoom(new Room(
            'blacksmith',
            'Blacksmith Shop',
            'The rhythmic clanging of hammer on anvil echoes through the hot workshop. Weapons and armor line the walls.',
            { west: 'market' }
        ));

        // Tavern
        this.addRoom(new Room(
            'tavern',
            'The Rusty Dragon Tavern',
            'A warm, inviting tavern filled with laughter and the smell of roasted meat. Adventurers trade stories over mugs of ale.',
            { north: 'town_square' }
        ));

        // Temple
        this.addRoom(new Room(
            'temple',
            'Temple of Light',
            'Sunlight streams through stained glass windows, illuminating an altar of white marble. A sense of peace pervades the sacred space.',
            { west: 'town_square' }
        ));

        // Forest Edge
        this.addRoom(new Room(
            'forest_edge',
            'Edge of the Dark Forest',
            'The welcoming lights of town give way to dark, ancient trees. Strange sounds echo from the depths of the forest.',
            { east: 'town_square', west: 'forest_path' }
        ));

        // Forest Path
        this.addRoom(new Room(
            'forest_path',
            'Forest Path',
            'A narrow path winds between twisted trees. The canopy blocks most sunlight, creating an eerie twilight.',
            { east: 'forest_edge', west: 'forest_clearing' }
        ));

        // Forest Clearing
        this.addRoom(new Room(
            'forest_clearing',
            'Forest Clearing',
            'A small clearing where sunlight breaks through the trees. Wild flowers grow around a weathered stone circle.',
            { east: 'forest_path', north: 'cave_entrance' }
        ));

        // Cave Entrance
        this.addRoom(new Room(
            'cave_entrance',
            'Cave Entrance',
            'A dark cave mouth yawns before you, promising danger and treasure in equal measure. Cold air flows from within.',
            { south: 'forest_clearing' }
        ));

        // Add some items to rooms
        this.getRoom('market').items.push({ name: 'Apple', type: 'food', effect: 'heal', value: 5 });
        this.getRoom('forest_clearing').items.push({ name: 'Healing Herb', type: 'herb', effect: 'heal', value: 15 });
        this.getRoom('cave_entrance').items.push({ name: 'Rusty Sword', type: 'weapon', damage: 5, value: 10 });
    }

    addRoom(room) {
        this.rooms.set(room.id, room);
    }

    getRoom(id) {
        return this.rooms.get(id);
    }
}

// ===========================
// Command Parser
// ===========================
class CommandParser {
    constructor(gameState) {
        this.gameState = gameState;
        this.commands = {
            // Movement
            'north': () => this.move('north'),
            'south': () => this.move('south'),
            'east': () => this.move('east'),
            'west': () => this.move('west'),
            'n': () => this.move('north'),
            's': () => this.move('south'),
            'e': () => this.move('east'),
            'w': () => this.move('west'),

            // Observation
            'look': () => this.look(),
            'l': () => this.look(),
            'examine': (args) => this.examine(args),
            'ex': (args) => this.examine(args),

            // Inventory
            'inventory': () => this.inventory(),
            'inv': () => this.inventory(),
            'i': () => this.inventory(),
            'take': (args) => this.take(args),
            'get': (args) => this.take(args),
            'drop': (args) => this.drop(args),

            // Character
            'stats': () => this.stats(),
            'status': () => this.stats(),

            // Interaction
            'use': (args) => this.use(args),
            'rest': () => this.rest(),

            // System
            'help': () => this.help(),
            'save': () => this.save(),
            'clear': () => this.clear(),
        };
    }

    parse(input) {
        if (!input || input.trim() === '') return;

        const parts = input.trim().toLowerCase().split(' ');
        const command = parts[0];
        const args = parts.slice(1).join(' ');

        if (this.commands[command]) {
            return this.commands[command](args);
        } else {
            return { type: 'error', text: `Unknown command: ${command}. Type 'help' for available commands.` };
        }
    }

    move(direction) {
        const room = this.gameState.currentRoom;
        if (room.exits[direction]) {
            this.gameState.currentRoom = this.gameState.world.getRoom(room.exits[direction]);
            return { type: 'move', room: this.gameState.currentRoom };
        } else {
            return { type: 'error', text: 'You cannot go that way.' };
        }
    }

    look() {
        const room = this.gameState.currentRoom;
        let output = {
            type: 'look',
            room: room,
            items: room.items,
            exits: Object.keys(room.exits)
        };
        return output;
    }

    examine(args) {
        if (!args) return { type: 'error', text: 'Examine what?' };
        const item = this.gameState.currentRoom.items.find(i => i.name.toLowerCase().includes(args.toLowerCase()));
        if (item) {
            return { type: 'examine', text: `${item.name}: A ${item.type} ${item.effect ? 'that can ' + item.effect : ''}.` };
        }
        return { type: 'error', text: `You don't see any ${args} here.` };
    }

    inventory() {
        return { type: 'inventory', items: this.gameState.player.inventory };
    }

    take(args) {
        if (!args) return { type: 'error', text: 'Take what?' };

        const room = this.gameState.currentRoom;
        const itemIndex = room.items.findIndex(i => i.name.toLowerCase().includes(args.toLowerCase()));

        if (itemIndex !== -1) {
            const item = room.items.splice(itemIndex, 1)[0];
            if (this.gameState.player.addItem(item)) {
                return { type: 'success', text: `You take the ${item.name}.` };
            } else {
                room.items.push(item);
                return { type: 'error', text: 'Your inventory is full.' };
            }
        }

        return { type: 'error', text: `You don't see any ${args} here.` };
    }

    drop(args) {
        if (!args) return { type: 'error', text: 'Drop what?' };

        const item = this.gameState.player.removeItem(args);
        if (item) {
            this.gameState.currentRoom.items.push(item);
            return { type: 'success', text: `You drop the ${item.name}.` };
        }

        return { type: 'error', text: `You don't have any ${args}.` };
    }

    stats() {
        return { type: 'stats', player: this.gameState.player };
    }

    use(args) {
        if (!args) return { type: 'error', text: 'Use what?' };

        const item = this.gameState.player.inventory.find(i => i.name.toLowerCase().includes(args.toLowerCase()));
        if (!item) {
            return { type: 'error', text: `You don't have any ${args}.` };
        }

        if (item.effect === 'heal') {
            this.gameState.player.heal(item.value);
            this.gameState.player.removeItem(item.name);
            return { type: 'success', text: `You use the ${item.name} and restore ${item.value} HP!` };
        }

        return { type: 'error', text: `You're not sure how to use the ${item.name}.` };
    }

    rest() {
        this.gameState.player.heal(20);
        this.gameState.player.mp = Math.min(this.gameState.player.maxMp, this.gameState.player.mp + 10);
        return { type: 'success', text: 'You rest for a moment, recovering some health and mana.' };
    }

    help() {
        const helpText = `
Available Commands:
─────────────────────────────────
Movement: north (n), south (s), east (e), west (w)
Observe:  look (l), examine <item>
Items:    inventory (i), take <item>, drop <item>, use <item>
Character: stats, rest
System:   help, save, clear

Tips:
- Explore the world and interact with items
- Rest to recover health and mana
- Type 'look' to see your surroundings
        `;
        return { type: 'help', text: helpText };
    }

    save() {
        this.gameState.save();
        return { type: 'success', text: 'Game saved successfully!' };
    }

    clear() {
        return { type: 'clear' };
    }
}

// ===========================
// UI Manager
// ===========================
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.output = document.getElementById('output');
        this.commandInput = document.getElementById('command-input');
        this.mapDisplay = document.getElementById('map-display');
    }

    initialize() {
        this.updateCharacterStats();
        this.updateInventory();
        this.updateLocation();
        this.renderMap();

        // Show welcome message
        this.addOutput('welcome', 'Welcome to Shadow Realms!');
        this.addOutput('', 'Type "help" for a list of commands.');
        this.addOutput('', '');

        // Auto look on start
        this.handleCommandResult(parser.look());
    }

    addOutput(type, text) {
        const line = document.createElement('div');
        line.className = `output-line ${type ? 'output-' + type : ''}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    clearOutput() {
        this.output.innerHTML = '';
    }

    handleCommandResult(result) {
        if (!result) return;

        switch (result.type) {
            case 'move':
                this.addOutput('success', `You travel ${result.room.name}.`);
                this.addOutput('', '');
                this.displayRoom(result.room);
                this.updateLocation();
                this.renderMap();
                break;

            case 'look':
                this.displayRoom(result.room);
                break;

            case 'examine':
            case 'success':
                this.addOutput('success', result.text);
                break;

            case 'error':
                this.addOutput('error', result.text);
                break;

            case 'inventory':
                this.displayInventory(result.items);
                break;

            case 'stats':
                this.displayStats(result.player);
                break;

            case 'help':
                this.addOutput('', result.text);
                break;

            case 'clear':
                this.clearOutput();
                break;
        }

        this.updateCharacterStats();
        this.updateInventory();
    }

    displayRoom(room) {
        this.addOutput('room-title', room.name);
        this.addOutput('room-desc', room.description);

        if (room.items.length > 0) {
            this.addOutput('', `Items here: ${room.items.map(i => i.name).join(', ')}`);
        }

        const exits = Object.keys(room.exits);
        if (exits.length > 0) {
            this.addOutput('exits', `Exits: ${exits.join(', ')}`);
        }
    }

    displayInventory(items) {
        if (items.length === 0) {
            this.addOutput('', 'Your inventory is empty.');
        } else {
            this.addOutput('', 'Inventory:');
            items.forEach(item => {
                this.addOutput('', `  - ${item.name}`);
            });
        }
    }

    displayStats(player) {
        this.addOutput('', `${player.name} - Level ${player.level}`);
        this.addOutput('', `HP: ${player.hp}/${player.maxHp}  MP: ${player.mp}/${player.maxMp}`);
        this.addOutput('', `XP: ${player.xp}/${player.xpToLevel}`);
        this.addOutput('', `STR: ${player.stats.str}  DEX: ${player.stats.dex}  INT: ${player.stats.int}  WIS: ${player.stats.wis}`);
        this.addOutput('', `Gold: ${player.gold}`);
    }

    updateCharacterStats() {
        const player = this.gameState.player;

        // Update name and level
        document.getElementById('char-name').textContent = player.name;
        document.getElementById('char-level').textContent = player.level;

        // Update HP bar
        const hpPercent = (player.hp / player.maxHp) * 100;
        document.getElementById('hp-bar').style.width = hpPercent + '%';
        document.getElementById('hp-text').textContent = `${player.hp}/${player.maxHp}`;

        // Update MP bar
        const mpPercent = (player.mp / player.maxMp) * 100;
        document.getElementById('mp-bar').style.width = mpPercent + '%';
        document.getElementById('mp-text').textContent = `${player.mp}/${player.maxMp}`;

        // Update XP bar
        const xpPercent = (player.xp / player.xpToLevel) * 100;
        document.getElementById('xp-bar').style.width = xpPercent + '%';
        document.getElementById('xp-text').textContent = `${player.xp}/${player.xpToLevel}`;

        // Update stats
        document.getElementById('stat-str').textContent = player.stats.str;
        document.getElementById('stat-dex').textContent = player.stats.dex;
        document.getElementById('stat-int').textContent = player.stats.int;
        document.getElementById('stat-wis').textContent = player.stats.wis;

        // Update gold
        document.getElementById('gold-amount').textContent = player.gold;
    }

    updateInventory() {
        const player = this.gameState.player;
        const inventoryGrid = document.getElementById('inventory-grid');
        inventoryGrid.innerHTML = '';

        // Show first 6 items
        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';

            if (i < player.inventory.length) {
                const item = player.inventory[i];
                slot.textContent = this.getItemIcon(item.type);
                slot.title = item.name;
                slot.classList.remove('empty');
            } else {
                slot.classList.add('empty');
            }

            inventoryGrid.appendChild(slot);
        }
    }

    getItemIcon(type) {
        const icons = {
            'food': '🍎',
            'herb': '🌿',
            'weapon': '⚔️',
            'armor': '🛡️',
            'potion': '⚗️',
            'key': '🔑',
            'treasure': '💎'
        };
        return icons[type] || '📦';
    }

    updateLocation() {
        document.getElementById('current-location').textContent = this.gameState.currentRoom.name;
    }

    renderMap() {
        const room = this.gameState.currentRoom;
        const world = this.gameState.world;

        // Simple ASCII map - centered on current room
        let map = '';

        // Build a simple directional map
        const north = room.exits.north ? world.getRoom(room.exits.north) : null;
        const south = room.exits.south ? world.getRoom(room.exits.south) : null;
        const east = room.exits.east ? world.getRoom(room.exits.east) : null;
        const west = room.exits.west ? world.getRoom(room.exits.west) : null;

        // Top row (north)
        if (north) {
            map += '       [' + this.truncate(north.name, 12) + ']\n';
            map += '              │\n';
        } else {
            map += '\n\n';
        }

        // Middle row (west, current, east)
        const westText = west ? '[' + this.truncate(west.name, 10) + ']' : '              ';
        const eastText = east ? '[' + this.truncate(east.name, 10) + ']' : '';
        const connector = (west && east) ? '──[@]──' : west ? '──[@]  ' : east ? '  [@]──' : '  [@]  ';

        map += westText + connector + eastText + '\n';

        // Bottom row (south)
        if (south) {
            map += '              │\n';
            map += '       [' + this.truncate(south.name, 12) + ']\n';
        }

        this.mapDisplay.textContent = map;
    }

    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 2) + '..';
    }
}

// ===========================
// Game Initialization
// ===========================
let gameState, parser, ui;

function initGame() {
    gameState = new GameState();
    gameState.initialize();

    parser = new CommandParser(gameState);
    ui = new UIManager(gameState);

    // Try to load saved game
    if (gameState.load()) {
        ui.initialize();
        ui.addOutput('success', 'Saved game loaded!');
    } else {
        ui.initialize();
    }

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    const commandInput = document.getElementById('command-input');

    // Command input
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            if (command) {
                ui.addOutput('command', '> ' + command);
                const result = parser.parse(command);
                ui.handleCommandResult(result);

                // Add to history
                gameState.commandHistory.push(command);
                gameState.historyIndex = gameState.commandHistory.length;

                commandInput.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (gameState.historyIndex > 0) {
                gameState.historyIndex--;
                commandInput.value = gameState.commandHistory[gameState.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (gameState.historyIndex < gameState.commandHistory.length - 1) {
                gameState.historyIndex++;
                commandInput.value = gameState.commandHistory[gameState.historyIndex];
            } else {
                gameState.historyIndex = gameState.commandHistory.length;
                commandInput.value = '';
            }
        }
    });

    // Quick command buttons
    document.querySelectorAll('.quick-cmd').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.dataset.cmd;
            commandInput.value = cmd;
            commandInput.focus();
            commandInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
    });

    // Clear output button
    document.getElementById('clear-output').addEventListener('click', () => {
        ui.clearOutput();
    });

    // Panel toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            const content = document.getElementById(panel + '-content');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                btn.textContent = '−';
            } else {
                content.style.display = 'none';
                btn.textContent = '+';
            }
        });
    });
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
