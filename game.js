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

    initialize(contentPack) {
        this.player = new Player('Adventurer');
        this.world = new World(contentPack);
        this.currentRoom = this.world.getRoom(this.world.getStartRoom());
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
    constructor(contentPack) {
        this.rooms = new Map();
        this.contentPack = contentPack;
        this.initializeWorld();
    }

    initializeWorld() {
        if (!this.contentPack || !this.contentPack.data || !this.contentPack.data.rooms) {
            console.error('Invalid content pack');
            return;
        }

        // Load rooms from content pack
        const packData = this.contentPack.data;

        packData.rooms.forEach(roomData => {
            const room = new Room(
                roomData.id,
                roomData.name,
                roomData.description,
                roomData.exits
            );

            // Add items
            if (roomData.items && roomData.items.length > 0) {
                room.items.push(...roomData.items);
            }

            // Add enemies
            if (roomData.enemies && roomData.enemies.length > 0) {
                roomData.enemies.forEach(enemyData => {
                    room.enemies.push(new Enemy(
                        enemyData.name,
                        enemyData.level,
                        enemyData.hp,
                        enemyData.damage,
                        enemyData.xpReward,
                        enemyData.goldReward
                    ));
                });
            }

            this.addRoom(room);
        });
    }

    getStartRoom() {
        return this.contentPack.data.startRoom || 'town_square';
    }

    getCurrencyName() {
        return this.contentPack.data.currencyName || 'Gold';
    }

    getWelcomeMessage() {
        return this.contentPack.data.welcomeMessage || 'Welcome to the game!';
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

            // Combat
            'attack': () => this.attack(),
            'fight': () => this.attack(),
            'flee': () => this.flee(),
            'run': () => this.flee(),

            // System
            'help': () => this.help(),
            'save': () => this.save(),
            'clear': () => this.clear(),
        };
    }

    parse(input) {
        if (!input || input.trim() === '') return;

        // Try NLP processing first
        const normalized = nlp.normalize(input);
        const parts = normalized.trim().toLowerCase().split(' ');
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

    attack() {
        // Check if there are enemies in the room
        const room = this.gameState.currentRoom;

        if (combatManager.inCombat) {
            return combatManager.playerAttack();
        }

        if (room.enemies.length > 0) {
            // Start combat with first enemy
            const enemy = room.enemies[0];
            return combatManager.startCombat(enemy);
        }

        return { type: 'error', text: 'There is nothing to fight here.' };
    }

    flee() {
        return combatManager.flee();
    }

    help() {
        const helpText = `
Available Commands:
─────────────────────────────────
Movement:  north (n), south (s), east (e), west (w)
           You can also say "go north", "walk south", etc.

Observe:   look (l), examine <item>

Items:     inventory (i), take/get <item>, drop <item>, use <item>

Character: stats, rest

Combat:    attack/fight - Engage or continue fighting an enemy
           flee/run - Escape from combat

System:    help, save, clear

Tips:
- Some areas have enemies - be prepared to fight!
- Use items to heal during or after combat
- Rest to recover health and mana
- Natural language supported: try "grab apple" or "walk north"
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
                soundManager.play('move');
                particleManager.showEffect('move');
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
                this.addOutput('success', result.text);
                break;

            case 'success':
                soundManager.play('success');
                particleManager.showEffect('success');
                this.addOutput('success', result.text);
                break;

            case 'error':
                soundManager.play('error');
                particleManager.showEffect('error');
                this.addOutput('error', result.text);
                break;

            case 'inventory':
                this.displayInventory(result.items);
                break;

            case 'stats':
                this.displayStats(result.player);
                break;

            case 'combat':
                soundManager.play('combat');
                particleManager.showEffect('combat');
                this.addOutput('combat', result.text);

                if (result.victory) {
                    soundManager.play('success');
                    particleManager.showEffect('levelup');
                    // Remove defeated enemy from room
                    const room = this.gameState.currentRoom;
                    room.enemies.shift();
                }

                if (result.defeat) {
                    soundManager.play('error');
                    this.updateLocation();
                    this.renderMap();
                }
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

        if (room.enemies.length > 0) {
            const enemyList = room.enemies.map(e => `${e.name} (Level ${e.level})`).join(', ');
            this.addOutput('warning', `⚠️ Enemies here: ${enemyList}`);
        }

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
// Sound Effects Manager
// ===========================
class SoundManager {
    constructor() {
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.context = null;
        this.sounds = {};
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    play(soundName) {
        if (!this.enabled) return;

        const sounds = {
            'move': () => this.playTone(440, 0.1, 'sine', 0.2),
            'pickup': () => this.playTone(660, 0.15, 'sine', 0.3),
            'drop': () => this.playTone(330, 0.15, 'sine', 0.2),
            'error': () => this.playTone(200, 0.2, 'sawtooth', 0.3),
            'success': () => {
                this.playTone(523, 0.1, 'sine', 0.25);
                setTimeout(() => this.playTone(659, 0.15, 'sine', 0.25), 100);
            },
            'combat': () => this.playTone(220, 0.2, 'square', 0.3),
            'levelup': () => {
                this.playTone(523, 0.1, 'sine', 0.3);
                setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
                setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200);
            },
            'heal': () => {
                this.playTone(659, 0.1, 'sine', 0.2);
                setTimeout(() => this.playTone(784, 0.15, 'sine', 0.2), 80);
            }
        };

        if (sounds[soundName]) {
            sounds[soundName]();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    }
}

// ===========================
// Particle Effects Manager
// ===========================
class ParticleManager {
    createParticle(x, y, emoji, duration = 2000) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, duration);
    }

    showEffect(type) {
        const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
        const y = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.2;

        const effects = {
            'move': '👟',
            'pickup': '📦',
            'drop': '⬇️',
            'combat': '⚔️',
            'damage': '💥',
            'heal': '💚',
            'levelup': '⭐',
            'gold': '💰',
            'success': '✓',
            'error': '❌'
        };

        this.createParticle(x, y, effects[type] || '✨');
    }
}

// ===========================
// Enemy Class
// ===========================
class Enemy {
    constructor(name, level, hp, damage, xpReward, goldReward) {
        this.name = name;
        this.level = level;
        this.hp = hp;
        this.maxHp = hp;
        this.damage = damage;
        this.xpReward = xpReward;
        this.goldReward = goldReward;
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    }

    attack() {
        return Math.floor(this.damage * (0.8 + Math.random() * 0.4));
    }
}

// ===========================
// Combat Manager
// ===========================
class CombatManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentEnemy = null;
        this.inCombat = false;
    }

    startCombat(enemy) {
        this.currentEnemy = enemy;
        this.inCombat = true;
        return {
            type: 'combat',
            text: `⚔️ A ${enemy.name} (Level ${enemy.level}) appears!\n   HP: ${enemy.hp}/${enemy.maxHp}`,
            enemy: enemy
        };
    }

    playerAttack() {
        if (!this.inCombat || !this.currentEnemy) {
            return { type: 'error', text: 'You are not in combat!' };
        }

        const player = this.gameState.player;
        const damage = Math.floor((player.stats.str * 2 + player.level * 3) * (0.8 + Math.random() * 0.4));

        const enemyDead = this.currentEnemy.takeDamage(damage);

        let result = { type: 'combat', text: `You strike the ${this.currentEnemy.name} for ${damage} damage!` };

        if (enemyDead) {
            player.gainXp(this.currentEnemy.xpReward);
            player.gold += this.currentEnemy.goldReward;

            result.text += `\n\n💀 The ${this.currentEnemy.name} is defeated!`;
            result.text += `\n   +${this.currentEnemy.xpReward} XP, +${this.currentEnemy.goldReward} Gold`;

            this.inCombat = false;
            this.currentEnemy = null;
            result.victory = true;
        } else {
            // Enemy counter-attacks
            const enemyDamage = this.currentEnemy.attack();
            const playerDead = player.takeDamage(enemyDamage);

            result.text += `\n   ${this.currentEnemy.name} HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}`;
            result.text += `\n\nThe ${this.currentEnemy.name} attacks you for ${enemyDamage} damage!`;
            result.text += `\n   Your HP: ${player.hp}/${player.maxHp}`;

            if (playerDead) {
                result.text += `\n\n💀 You have been defeated! Respawning...`;
                player.hp = player.maxHp;
                player.mp = player.maxMp;
                this.inCombat = false;
                this.currentEnemy = null;
                this.gameState.currentRoom = this.gameState.world.getRoom('town_square');
                result.defeat = true;
            }
        }

        return result;
    }

    flee() {
        if (!this.inCombat) {
            return { type: 'error', text: 'You are not in combat!' };
        }

        this.inCombat = false;
        this.currentEnemy = null;
        return { type: 'success', text: 'You flee from combat!' };
    }
}

// ===========================
// Enhanced Command Parser with NLP
// ===========================
class NaturalLanguageParser {
    constructor() {
        this.synonyms = {
            'go': ['move', 'walk', 'travel', 'head', 'run'],
            'take': ['get', 'pick', 'grab', 'acquire', 'collect'],
            'look': ['examine', 'inspect', 'view', 'see', 'observe', 'check'],
            'use': ['consume', 'eat', 'drink', 'apply'],
            'attack': ['fight', 'hit', 'strike', 'kill', 'slay', 'battle'],
            'talk': ['speak', 'chat', 'say', 'tell', 'ask']
        };

        this.directionWords = {
            'n': 'north', 'north': 'north',
            's': 'south', 'south': 'south',
            'e': 'east', 'east': 'east',
            'w': 'west', 'west': 'west'
        };
    }

    normalize(input) {
        const words = input.toLowerCase().split(/\s+/);
        const normalized = [];

        for (const word of words) {
            // Check if it's a direction
            if (this.directionWords[word]) {
                normalized.push(this.directionWords[word]);
                continue;
            }

            // Check synonyms
            let found = false;
            for (const [base, syns] of Object.entries(this.synonyms)) {
                if (syns.includes(word) || word === base) {
                    normalized.push(base);
                    found = true;
                    break;
                }
            }

            if (!found) {
                normalized.push(word);
            }
        }

        return normalized.join(' ');
    }

    extractIntent(input) {
        const patterns = [
            { regex: /^(go|move|walk|travel|head)\s+(north|south|east|west|n|s|e|w)$/i, intent: 'move' },
            { regex: /^(take|get|pick|grab)\s+(.+)$/i, intent: 'take' },
            { regex: /^(attack|fight|hit)\s*(.*)$/i, intent: 'attack' },
            { regex: /^(use|consume|eat|drink)\s+(.+)$/i, intent: 'use' }
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern.regex);
            if (match) {
                return { intent: pattern.intent, params: match.slice(2) };
            }
        }

        return null;
    }
}

// ===========================
// Game Initialization
// ===========================
let gameState, parser, ui, soundManager, particleManager, combatManager, nlp, contentPackManager;
let eventListenersSetup = false; // Flag to track if event listeners are already set up

function initGame() {
    // Initialize content pack manager
    contentPackManager = new ContentPackManager();
    const currentPack = contentPackManager.getCurrentPack();

    gameState = new GameState();
    gameState.initialize(currentPack);

    soundManager = new SoundManager();
    particleManager = new ParticleManager();
    combatManager = new CombatManager(gameState);
    nlp = new NaturalLanguageParser();

    parser = new CommandParser(gameState);
    ui = new UIManager(gameState);

    // Update currency display
    updateCurrencyDisplay();

    // Try to load saved game
    if (gameState.load()) {
        ui.initialize();
        ui.addOutput('success', 'Saved game loaded!');
    } else {
        ui.initialize();
        ui.addOutput('', currentPack.data.welcomeMessage);
    }

    // Setup event listeners only once
    if (!eventListenersSetup) {
        setupEventListeners();
        eventListenersSetup = true;
    }
}

function updateCurrencyDisplay() {
    const currencyName = gameState.world.getCurrencyName();
    const goldDisplay = document.querySelector('.gold-display');
    if (goldDisplay) {
        goldDisplay.innerHTML = `${currencyName}: <span id="gold-amount">0</span>`;
    }
}

function restartGame() {
    // Clear the output
    if (ui) {
        ui.clearOutput();
    }

    // Reinitialize the game
    initGame();
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

    // Theme switcher
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');

    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        themeDropdown.classList.remove('active');
    });

    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = option.dataset.theme;

            // Update active state
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Apply theme
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('selectedTheme', theme);

            // Play sound
            soundManager.play('success');

            // Close dropdown
            themeDropdown.classList.remove('active');
        });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const savedOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
        if (savedOption) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            savedOption.classList.add('active');
        }
    }

    // Content Pack switcher
    const packToggle = document.getElementById('pack-toggle');
    const packDropdown = document.getElementById('pack-dropdown');

    packToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        packDropdown.classList.toggle('active');
        // Close theme dropdown if open
        themeDropdown.classList.remove('active');
    });

    // Pack selection
    document.querySelectorAll('.pack-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const packId = option.dataset.pack;

            // Update active state
            document.querySelectorAll('.pack-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Load the new content pack
            contentPackManager.loadPack(packId);

            // Optionally auto-apply matching visual theme
            const suggestedTheme = contentPackManager.getSuggestedVisualTheme(packId);
            document.body.setAttribute('data-theme', suggestedTheme);
            localStorage.setItem('selectedTheme', suggestedTheme);

            // Update theme selector UI
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            const matchingThemeOption = document.querySelector(`.theme-option[data-theme="${suggestedTheme}"]`);
            if (matchingThemeOption) {
                matchingThemeOption.classList.add('active');
            }

            // Play sound
            soundManager.play('success');

            // Close dropdown
            packDropdown.classList.remove('active');

            // Restart the game with new content
            restartGame();

            // Show notification
            ui.addOutput('success', `Switched to ${contentPackManager.getCurrentPack().name}!`);
        });
    });

    // Load saved pack selection in UI
    const savedPack = localStorage.getItem('selectedContentPack') || 'fantasy';
    const savedPackOption = document.querySelector(`.pack-option[data-pack="${savedPack}"]`);
    if (savedPackOption) {
        document.querySelectorAll('.pack-option').forEach(opt => opt.classList.remove('active'));
        savedPackOption.classList.add('active');
    }

    // Close pack dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pack-selector')) {
            packDropdown.classList.remove('active');
        }
    });

    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener('click', () => {
        const enabled = soundManager.toggle();
        soundToggle.textContent = enabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !enabled);

        if (enabled) {
            soundManager.play('success');
        }
    });

    // Set initial sound button state
    if (!soundManager.enabled) {
        soundToggle.textContent = '🔇';
        soundToggle.classList.add('muted');
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
