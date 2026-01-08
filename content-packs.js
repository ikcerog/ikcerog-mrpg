// ===========================
// Content Pack System
// ===========================

class ContentPack {
    constructor(id, name, icon, description, data) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.data = data; // { rooms, startRoom, currencyName, welcomeMessage }
    }
}

// ===========================
// Content Pack Definitions
// ===========================

const CONTENT_PACKS = {
    // Default Fantasy Pack
    fantasy: new ContentPack(
        'fantasy',
        'Shadow Realms',
        '🌑',
        'Classic dark fantasy adventure',
        {
            currencyName: 'Gold',
            startRoom: 'town_square',
            welcomeMessage: 'Welcome to Shadow Realms! A dark fantasy world awaits...',
            rooms: [
                {
                    id: 'town_square',
                    name: 'Town Square',
                    description: 'A bustling town square with a fountain in the center. Merchants hawk their wares while townsfolk go about their business.',
                    exits: { north: 'market', south: 'tavern', east: 'temple', west: 'forest_edge' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'market',
                    name: 'Marketplace',
                    description: 'Colorful stalls line the cobblestone streets. The smell of fresh bread and exotic spices fills the air.',
                    exits: { south: 'town_square', east: 'blacksmith' },
                    items: [{ name: 'Apple', type: 'food', effect: 'heal', value: 5 }],
                    enemies: []
                },
                {
                    id: 'blacksmith',
                    name: 'Blacksmith Shop',
                    description: 'The rhythmic clanging of hammer on anvil echoes through the hot workshop. Weapons and armor line the walls.',
                    exits: { west: 'market' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'tavern',
                    name: 'The Rusty Dragon Tavern',
                    description: 'A warm, inviting tavern filled with laughter and the smell of roasted meat. Adventurers trade stories over mugs of ale.',
                    exits: { north: 'town_square' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'temple',
                    name: 'Temple of Light',
                    description: 'Sunlight streams through stained glass windows, illuminating an altar of white marble. A sense of peace pervades the sacred space.',
                    exits: { west: 'town_square' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'forest_edge',
                    name: 'Edge of the Dark Forest',
                    description: 'The welcoming lights of town give way to dark, ancient trees. Strange sounds echo from the depths of the forest.',
                    exits: { east: 'town_square', west: 'forest_path' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'forest_path',
                    name: 'Forest Path',
                    description: 'A narrow path winds between twisted trees. The canopy blocks most sunlight, creating an eerie twilight.',
                    exits: { east: 'forest_edge', west: 'forest_clearing' },
                    items: [],
                    enemies: [{ name: 'Wolf', level: 1, hp: 30, damage: 8, xpReward: 20, goldReward: 5 }]
                },
                {
                    id: 'forest_clearing',
                    name: 'Forest Clearing',
                    description: 'A small clearing where sunlight breaks through the trees. Wild flowers grow around a weathered stone circle.',
                    exits: { east: 'forest_path', north: 'cave_entrance' },
                    items: [{ name: 'Healing Herb', type: 'herb', effect: 'heal', value: 15 }],
                    enemies: [{ name: 'Giant Spider', level: 2, hp: 50, damage: 12, xpReward: 35, goldReward: 10 }]
                },
                {
                    id: 'cave_entrance',
                    name: 'Cave Entrance',
                    description: 'A dark cave mouth yawns before you, promising danger and treasure in equal measure. Cold air flows from within.',
                    exits: { south: 'forest_clearing' },
                    items: [{ name: 'Rusty Sword', type: 'weapon', damage: 5, value: 10 }],
                    enemies: [{ name: 'Cave Troll', level: 3, hp: 80, damage: 18, xpReward: 60, goldReward: 25 }]
                }
            ]
        }
    ),

    // Star Wars Pack
    starwars: new ContentPack(
        'starwars',
        'Star Wars',
        '⚔️',
        'A galaxy far, far away...',
        {
            currencyName: 'Credits',
            startRoom: 'cantina',
            welcomeMessage: 'A long time ago in a galaxy far, far away... Your adventure begins on Tatooine.',
            rooms: [
                {
                    id: 'cantina',
                    name: 'Mos Eisley Cantina',
                    description: 'The dimly lit cantina is filled with spacers, smugglers, and alien beings. Strange music plays as patrons conduct shady deals.',
                    exits: { north: 'spaceport', south: 'back_alley', east: 'market_district' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'spaceport',
                    name: 'Mos Eisley Spaceport',
                    description: 'Starships of all sizes rest on landing pads. Stormtroopers patrol the area, checking credentials of travelers.',
                    exits: { south: 'cantina', east: 'hangar_bay' },
                    items: [{ name: 'Ration Pack', type: 'food', effect: 'heal', value: 5 }],
                    enemies: []
                },
                {
                    id: 'hangar_bay',
                    name: 'Docking Bay 94',
                    description: 'A circular landing bay. The Millennium Falcon would look right at home here. Fuel canisters and repair equipment are scattered about.',
                    exits: { west: 'spaceport', north: 'imperial_checkpoint' },
                    items: [{ name: 'Medpac', type: 'herb', effect: 'heal', value: 15 }],
                    enemies: []
                },
                {
                    id: 'market_district',
                    name: 'Tatooine Market',
                    description: 'Jawas and merchants sell salvaged droids and equipment. Binary language and haggling fill the air.',
                    exits: { west: 'cantina', north: 'moisture_farm' },
                    items: [{ name: 'Power Cell', type: 'treasure', value: 20 }],
                    enemies: []
                },
                {
                    id: 'back_alley',
                    name: 'Dark Alley',
                    description: 'A shadowy alley behind the cantina. Not the safest place to wander alone.',
                    exits: { north: 'cantina', west: 'hideout' },
                    items: [],
                    enemies: [{ name: 'Thug', level: 1, hp: 25, damage: 7, xpReward: 15, goldReward: 10 }]
                },
                {
                    id: 'hideout',
                    name: 'Smuggler\'s Hideout',
                    description: 'A secret den used by smugglers and bounty hunters. Contraband fills hidden compartments.',
                    exits: { east: 'back_alley' },
                    items: [{ name: 'Blaster Pistol', type: 'weapon', damage: 8, value: 50 }],
                    enemies: [{ name: 'Bounty Hunter', level: 2, hp: 45, damage: 12, xpReward: 30, goldReward: 30 }]
                },
                {
                    id: 'moisture_farm',
                    name: 'Moisture Farm',
                    description: 'Rows of moisture vaporators dot the sandy landscape. Twin suns beat down mercilessly from above.',
                    exits: { south: 'market_district', west: 'dune_sea' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'dune_sea',
                    name: 'Dune Sea',
                    description: 'Endless rolling dunes of sand stretch in all directions. Danger lurks beneath the surface.',
                    exits: { east: 'moisture_farm' },
                    items: [],
                    enemies: [{ name: 'Tusken Raider', level: 2, hp: 40, damage: 10, xpReward: 25, goldReward: 15 }]
                },
                {
                    id: 'imperial_checkpoint',
                    name: 'Imperial Checkpoint',
                    description: 'A fortified checkpoint manned by Imperial Stormtroopers. "Move along, move along."',
                    exits: { south: 'hangar_bay' },
                    items: [],
                    enemies: [{ name: 'Stormtrooper', level: 3, hp: 50, damage: 15, xpReward: 40, goldReward: 25 }]
                }
            ]
        }
    ),

    // Stranger Things Pack
    strangerthings: new ContentPack(
        'strangerthings',
        'Stranger Things',
        '🔦',
        'Explore Hawkins and the Upside Down',
        {
            currencyName: 'Quarters',
            startRoom: 'mikes_basement',
            welcomeMessage: 'Welcome to Hawkins, Indiana, 1983. Something strange is happening...',
            rooms: [
                {
                    id: 'mikes_basement',
                    name: 'Mike\'s Basement',
                    description: 'The party\'s headquarters. A D&D campaign is set up on the table, and walkie-talkies crackle with static.',
                    exits: { north: 'neighborhood', east: 'garage' },
                    items: [{ name: 'Eggos', type: 'food', effect: 'heal', value: 5 }],
                    enemies: []
                },
                {
                    id: 'neighborhood',
                    name: 'Suburban Street',
                    description: 'Quiet suburban houses line the street. Jack-o-lanterns still sit on some porches. Christmas lights flicker.',
                    exits: { south: 'mikes_basement', north: 'school', west: 'woods' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'school',
                    name: 'Hawkins Middle School',
                    description: 'Lockers line the hallways. The AV Club room door is slightly ajar.',
                    exits: { south: 'neighborhood', east: 'av_club' },
                    items: [{ name: 'Walkie-Talkie', type: 'treasure', value: 10 }],
                    enemies: []
                },
                {
                    id: 'av_club',
                    name: 'AV Club Room',
                    description: 'Ham radios and electronic equipment fill the room. Strange interference keeps disrupting the signal.',
                    exits: { west: 'school' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'woods',
                    name: 'Hawkins Woods',
                    description: 'Dark woods where the kids ride their bikes. Something feels wrong here. The air is thick and strange.',
                    exits: { east: 'neighborhood', north: 'lab_fence' },
                    items: [{ name: 'Flashlight', type: 'treasure', value: 5 }],
                    enemies: [{ name: 'Demodogs', level: 2, hp: 35, damage: 10, xpReward: 25, goldReward: 5 }]
                },
                {
                    id: 'lab_fence',
                    name: 'Hawkins Lab Fence',
                    description: 'A high fence topped with barbed wire surrounds the mysterious Hawkins National Laboratory. Warning signs everywhere.',
                    exits: { south: 'woods', north: 'lab_entrance' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'lab_entrance',
                    name: 'Lab Entrance',
                    description: 'The entrance to Hawkins Lab. Sterile white corridors stretch beyond. Armed guards patrol the area.',
                    exits: { south: 'lab_fence', west: 'portal_room' },
                    items: [],
                    enemies: [{ name: 'Lab Guard', level: 2, hp: 40, damage: 12, xpReward: 30, goldReward: 10 }]
                },
                {
                    id: 'portal_room',
                    name: 'The Gate',
                    description: 'A pulsating portal tears through reality itself. Tendrils of organic matter spread from it. You can see the Upside Down through it.',
                    exits: { east: 'lab_entrance', west: 'upside_down' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'upside_down',
                    name: 'The Upside Down',
                    description: 'A dark mirror of Hawkins. Everything is decaying and covered in vines. Spores drift through the toxic air.',
                    exits: { east: 'portal_room' },
                    items: [{ name: 'Strange Artifact', type: 'treasure', value: 50 }],
                    enemies: [{ name: 'Demogorgon', level: 4, hp: 100, damage: 20, xpReward: 80, goldReward: 30 }]
                },
                {
                    id: 'garage',
                    name: 'Wheeler Garage',
                    description: 'Bikes and tools stored in the garage. A nail-studded baseball bat leans in the corner.',
                    exits: { west: 'mikes_basement' },
                    items: [{ name: 'Nail Bat', type: 'weapon', damage: 10, value: 15 }],
                    enemies: []
                }
            ]
        }
    ),

    // High Fantasy Pack
    highfantasy: new ContentPack(
        'highfantasy',
        'High Fantasy',
        '🐉',
        'Traditional D&D-style adventure',
        {
            currencyName: 'Gold Pieces',
            startRoom: 'tavern',
            welcomeMessage: 'Welcome, brave adventurer! Your epic quest begins at the Prancing Pony Tavern.',
            rooms: [
                {
                    id: 'tavern',
                    name: 'The Prancing Pony',
                    description: 'A cozy tavern with a roaring fireplace. Adventurers share tales of dragons and treasure over mugs of mead.',
                    exits: { north: 'village_square', east: 'inn_rooms' },
                    items: [{ name: 'Mead', type: 'food', effect: 'heal', value: 3 }],
                    enemies: []
                },
                {
                    id: 'village_square',
                    name: 'Village Square',
                    description: 'The heart of a peaceful village. A stone fountain burbles in the center, and shops line the cobblestone paths.',
                    exits: { south: 'tavern', north: 'north_gate', east: 'temple', west: 'market' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'market',
                    name: 'Village Market',
                    description: 'Merchants sell wares under colorful awnings. You can buy provisions, potions, and equipment here.',
                    exits: { east: 'village_square', north: 'blacksmith' },
                    items: [{ name: 'Health Potion', type: 'herb', effect: 'heal', value: 20 }],
                    enemies: []
                },
                {
                    id: 'blacksmith',
                    name: 'Dwarven Forge',
                    description: 'A stout dwarf hammers red-hot steel on an anvil. Masterwork weapons and armor hang on the walls.',
                    exits: { south: 'market' },
                    items: [{ name: 'Steel Longsword', type: 'weapon', damage: 12, value: 100 }],
                    enemies: []
                },
                {
                    id: 'temple',
                    name: 'Temple of the Divine',
                    description: 'A grand temple with soaring columns. Clerics offer blessings and healing to the faithful.',
                    exits: { west: 'village_square' },
                    items: [{ name: 'Blessed Amulet', type: 'treasure', value: 50 }],
                    enemies: []
                },
                {
                    id: 'north_gate',
                    name: 'Village North Gate',
                    description: 'A sturdy wooden gate marks the edge of civilization. Beyond lies the wilderness.',
                    exits: { south: 'village_square', north: 'dark_forest' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'dark_forest',
                    name: 'The Dark Forest',
                    description: 'Ancient trees block out the sun. Strange sounds echo through the shadows. Danger lurks everywhere.',
                    exits: { south: 'north_gate', north: 'goblin_camp' },
                    items: [],
                    enemies: [{ name: 'Dire Wolf', level: 2, hp: 45, damage: 11, xpReward: 30, goldReward: 8 }]
                },
                {
                    id: 'goblin_camp',
                    name: 'Goblin Encampment',
                    description: 'Crude tents and campfires mark a goblin camp. The stench is overwhelming.',
                    exits: { south: 'dark_forest', west: 'mountain_path' },
                    items: [{ name: 'Stolen Gems', type: 'treasure', value: 40 }],
                    enemies: [{ name: 'Goblin Raiders', level: 2, hp: 35, damage: 9, xpReward: 25, goldReward: 12 }]
                },
                {
                    id: 'mountain_path',
                    name: 'Mountain Path',
                    description: 'A treacherous path winds up the mountainside. The air grows thin and cold.',
                    exits: { east: 'goblin_camp', north: 'dragon_lair' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'dragon_lair',
                    name: 'Ancient Dragon\'s Lair',
                    description: 'A massive cavern filled with treasure. Gold coins and jewels form enormous mounds. A sleeping dragon rests atop the hoard.',
                    exits: { south: 'mountain_path' },
                    items: [{ name: 'Dragon Hoard', type: 'treasure', value: 500 }],
                    enemies: [{ name: 'Ancient Red Dragon', level: 10, hp: 300, damage: 40, xpReward: 500, goldReward: 1000 }]
                },
                {
                    id: 'inn_rooms',
                    name: 'Inn Rooms',
                    description: 'Simple but clean rooms for rent. A safe place to rest and recover.',
                    exits: { west: 'tavern' },
                    items: [],
                    enemies: []
                }
            ]
        }
    ),

    // Cyberpunk Pack
    cyberpunk: new ContentPack(
        'cyberpunk',
        'Cyberpunk 2077',
        '🤖',
        'High-tech, low-life future',
        {
            currencyName: 'Eddies',
            startRoom: 'apartment',
            welcomeMessage: 'Welcome to Night City, 2077. The future is now, choom.',
            rooms: [
                {
                    id: 'apartment',
                    name: 'Your Apartment',
                    description: 'A cramped megabuilding apartment. Neon lights from advertisements bleed through the window. Your deck sits on the table.',
                    exits: { north: 'hallway' },
                    items: [{ name: 'Synth-Food', type: 'food', effect: 'heal', value: 5 }],
                    enemies: []
                },
                {
                    id: 'hallway',
                    name: 'Megabuilding Hallway',
                    description: 'Flickering fluorescent lights barely illuminate the graffiti-covered walls. Music and shouting leak through thin doors.',
                    exits: { south: 'apartment', north: 'elevator', east: 'vendor' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'vendor',
                    name: 'Vending Machine Bay',
                    description: 'Ancient vending machines line the wall. Half are broken, the other half dispense dubious products.',
                    exits: { west: 'hallway' },
                    items: [{ name: 'Bounce-Back', type: 'herb', effect: 'heal', value: 15 }],
                    enemies: []
                },
                {
                    id: 'elevator',
                    name: 'Elevator Down',
                    description: 'A sketchy elevator covered in ads for cyberware and braindances. It creaks ominously.',
                    exits: { south: 'hallway', north: 'street' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'street',
                    name: 'Night City Streets',
                    description: 'Holographic advertisements tower overhead. Crowds of people with glowing cyberware push past. Autonomous vehicles zip by.',
                    exits: { south: 'elevator', north: 'market', east: 'ripperdoc', west: 'alley' },
                    items: [],
                    enemies: []
                },
                {
                    id: 'market',
                    name: 'Night Market',
                    description: 'Street vendors sell everything from synth-meat to stolen tech. The air smells like cooking oil and ozone.',
                    exits: { south: 'street' },
                    items: [{ name: 'Datachip', type: 'treasure', value: 30 }],
                    enemies: []
                },
                {
                    id: 'ripperdoc',
                    name: 'Ripperdoc Clinic',
                    description: 'A back-alley clinic where a ripperdoc installs cyberware. Surgical equipment and body parts fill shelves.',
                    exits: { west: 'street' },
                    items: [{ name: 'Cyberware Implant', type: 'treasure', value: 100 }],
                    enemies: []
                },
                {
                    id: 'alley',
                    name: 'Dark Alley',
                    description: 'Trash and junkies fill this narrow alley. Not the safest place after dark. Or during the day.',
                    exits: { east: 'street', west: 'gang_territory' },
                    items: [],
                    enemies: [{ name: 'Scav', level: 1, hp: 30, damage: 8, xpReward: 20, goldReward: 15 }]
                },
                {
                    id: 'gang_territory',
                    name: 'Gang Territory',
                    description: 'Graffiti marks this as Maelstrom turf. Chrome-covered gang members eye you suspiciously.',
                    exits: { east: 'alley', north: 'warehouse' },
                    items: [],
                    enemies: [{ name: 'Maelstrom Ganger', level: 2, hp: 45, damage: 12, xpReward: 30, goldReward: 25 }]
                },
                {
                    id: 'warehouse',
                    name: 'Abandoned Warehouse',
                    description: 'A warehouse filled with stolen corpo tech. Armed guards protect the valuable merchandise.',
                    exits: { south: 'gang_territory', north: 'netrunner_den' },
                    items: [{ name: 'Militech Weapon', type: 'weapon', damage: 15, value: 200 }],
                    enemies: [{ name: 'Armed Merc', level: 3, hp: 60, damage: 18, xpReward: 45, goldReward: 40 }]
                },
                {
                    id: 'netrunner_den',
                    name: 'Netrunner Den',
                    description: 'Dozens of netrunners jack into the Net. ICE breaker programs scroll across screens. The digital frontier awaits.',
                    exits: { south: 'warehouse' },
                    items: [{ name: 'Legendary Quickhack', type: 'treasure', value: 500 }],
                    enemies: [{ name: 'Rogue AI', level: 5, hp: 100, damage: 25, xpReward: 100, goldReward: 200 }]
                }
            ]
        }
    )
};

// ===========================
// Content Pack Manager
// ===========================
class ContentPackManager {
    constructor() {
        this.currentPack = null;
        this.packs = CONTENT_PACKS;
    }

    loadPack(packId) {
        if (this.packs[packId]) {
            this.currentPack = this.packs[packId];
            localStorage.setItem('selectedContentPack', packId);
            return this.currentPack;
        }
        return null;
    }

    getCurrentPack() {
        if (!this.currentPack) {
            const savedPack = localStorage.getItem('selectedContentPack') || 'fantasy';
            this.loadPack(savedPack);
        }
        return this.currentPack;
    }

    getAllPacks() {
        return Object.values(this.packs);
    }

    getSuggestedVisualTheme(packId) {
        const mapping = {
            'fantasy': 'default',
            'starwars': 'starwars',
            'strangerthings': 'strangerthings',
            'highfantasy': 'highfantasy',
            'cyberpunk': 'cyberpunk'
        };
        return mapping[packId] || 'default';
    }
}
