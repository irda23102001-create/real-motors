const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'realmotors.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      version TEXT,
      year INTEGER NOT NULL,
      kilometers INTEGER DEFAULT 0,
      engine TEXT,
      horsepower INTEGER,
      fuel_type TEXT,
      transmission TEXT,
      color TEXT,
      condition TEXT DEFAULT 'used',
      doors INTEGER DEFAULT 4,
      body_type TEXT,
      interior TEXT,
      price REAL NOT NULL,
      status TEXT DEFAULT 'available',
      description TEXT,
      main_image TEXT,
      features TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      car_id INTEGER,
      car_name TEXT,
      appointment_date TEXT,
      appointment_time TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      car_id INTEGER,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin
  const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
  }

  // Seed cars
  const carCount = db.prepare('SELECT COUNT(*) as count FROM cars').get();
  if (carCount.count === 0) {
    seedCars(db);
  }

  console.log('✅ Database initialized successfully');
}

function seedCars(db) {
  const cars = [
    {
      brand: 'Audi', model: 'A6', version: '2.0 TDI S-Line', year: 2021,
      kilometers: 38000, engine: '2.0 TDI', horsepower: 204,
      fuel_type: 'Diesel', transmission: 'Automatic', color: 'Mythos Black',
      condition: 'used', doors: 4, body_type: 'Sedan', interior: 'Black Leather',
      price: 42500, status: 'available',
      description: 'The Audi A6 2.0 TDI S-Line in stunning Mythos Black is a masterpiece of German engineering. This executive sedan combines refined luxury with dynamic performance, featuring Audi\'s signature S-Line exterior package, full LED matrix headlights, and a sumptuous black leather interior. With only 38,000 km, this vehicle represents exceptional value for the discerning buyer seeking premium comfort and technology.',
      main_image: '/images/cars/audi-a6.jpg',
      features: JSON.stringify(['Air Conditioning', 'Navigation System', 'Bluetooth', 'Rear Camera', 'Parking Sensors', 'Heated Seats', 'LED Headlights', 'Sunroof', 'Lane Assist', 'Adaptive Cruise Control', 'Apple CarPlay', 'Android Auto', 'Virtual Cockpit', 'Bang & Olufsen Sound'])
    },
    {
      brand: 'BMW', model: 'X5', version: 'xDrive30d M Sport', year: 2022,
      kilometers: 24000, engine: '3.0 TDI', horsepower: 286,
      fuel_type: 'Diesel', transmission: 'Automatic', color: 'Alpine White',
      condition: 'used', doors: 5, body_type: 'SUV', interior: 'Cognac Leather',
      price: 72000, status: 'available',
      description: 'Experience the pinnacle of luxury SUV performance with this BMW X5 xDrive30d M Sport. Finished in pristine Alpine White with a stunning Cognac leather interior, this vehicle commands attention on every road. The M Sport package adds aggressive styling, sport-tuned suspension, and exclusive M Sport seats. With BMW\'s xDrive all-wheel drive system and a powerful 3.0-litre diesel engine producing 286 bhp, nothing stands between you and driving perfection.',
      main_image: '/images/cars/bmw-x5.jpg',
      features: JSON.stringify(['Air Conditioning', 'Navigation System', 'Bluetooth', 'Rear Camera', '360° Parking Sensors', 'Heated Seats', 'Ventilated Seats', 'Panoramic Sunroof', 'Head-Up Display', 'Adaptive Cruise Control', 'Harman Kardon Sound', 'Wireless Charging', 'Apple CarPlay', 'Ambient Lighting', 'Massage Seats'])
    },
    {
      brand: 'Mercedes-Benz', model: 'C-Class', version: 'C300 AMG Line', year: 2022,
      kilometers: 19500, engine: '2.0 Turbo', horsepower: 258,
      fuel_type: 'Petrol', transmission: 'Automatic', color: 'Obsidian Black',
      condition: 'used', doors: 4, body_type: 'Sedan', interior: 'Nappa Leather Cream',
      price: 54000, status: 'available',
      description: 'The new-generation Mercedes-Benz C300 AMG Line represents a quantum leap in luxury motoring. With its striking Obsidian Black exterior and exquisite cream Nappa leather interior, this vehicle radiates sophistication. The 2.0-litre turbocharged engine delivers effortless performance, while the MBUX infotainment system with dual widescreen displays provides an unrivalled technology experience. AMG Line specification adds sport aerodynamics and 19-inch AMG alloy wheels.',
      main_image: '/images/cars/mercedes-c.jpg',
      features: JSON.stringify(['Air Conditioning', 'MBUX Navigation', 'Bluetooth', 'Rear Camera', 'Parking Sensors', 'Heated Seats', 'Burmester Sound', 'Sunroof', 'AMG Sport Package', 'Adaptive Cruise Control', 'Apple CarPlay', 'Wireless Charging', 'Ambient Lighting', 'Digital Cockpit', 'Night Package'])
    },
    {
      brand: 'Volkswagen', model: 'Golf', version: 'GTI Performance', year: 2021,
      kilometers: 44000, engine: '2.0 TSI', horsepower: 245,
      fuel_type: 'Petrol', transmission: 'DSG Automatic', color: 'Tornado Red',
      condition: 'used', doors: 5, body_type: 'Hatchback', interior: 'Tartan Cloth',
      price: 32000, status: 'available',
      description: 'The iconic Volkswagen Golf GTI Performance Edition — the car that defined the hot hatch genre continues to set the benchmark. In vibrant Tornado Red, this Golf GTI Performance boasts 245 bhp from its 2.0 TSI engine, paired with VW\'s superb 7-speed DSG gearbox. Performance Pack specification adds a mechanical limited-slip differential for exceptional cornering ability. Practical, exciting, and utterly addictive to drive.',
      main_image: '/images/cars/vw-golf.jpg',
      features: JSON.stringify(['Air Conditioning', 'Navigation', 'Bluetooth', 'Rear Camera', 'Parking Sensors', 'Heated Seats', 'DSG Gearbox', 'Sport Suspension', 'LSD Differential', 'Adaptive Cruise Control', 'Apple CarPlay', 'Android Auto', 'LED Headlights', 'DCC Suspension'])
    },
    {
      brand: 'Porsche', model: 'Cayenne', version: 'S Platinum Edition', year: 2020,
      kilometers: 52000, engine: '2.9 V6 Biturbo', horsepower: 440,
      fuel_type: 'Petrol', transmission: 'Tiptronic Automatic', color: 'Carrara White',
      condition: 'used', doors: 5, body_type: 'SUV', interior: 'Black/Espresso Leather',
      price: 89000, status: 'available',
      description: 'The Porsche Cayenne S Platinum Edition — where sports car DNA meets SUV versatility. This exceptional machine in Carrara White Metallic features the Platinum Edition\'s exclusive trim levels, 21-inch RS Spyder Design wheels, and a panoramic roof system. The twin-turbocharged 2.9-litre V6 produces a thrilling 440 bhp and launches this 2-tonne SUV to 100 km/h in just 5.0 seconds. A true driver\'s SUV with zero compromises.',
      main_image: '/images/cars/porsche-cayenne.jpg',
      features: JSON.stringify(['Air Conditioning', 'PCM Navigation', 'Bluetooth', 'Surround Camera', '360° Parking', 'Heated Seats', 'Ventilated Seats', 'Panoramic Roof', 'Bose Sound', 'Sport Chrono Package', 'PASM Suspension', 'Air Suspension', 'Night Vision', 'Head-Up Display', 'Massage Seats'])
    },
    {
      brand: 'Toyota', model: 'Corolla', version: '1.8 Hybrid GR Sport', year: 2023,
      kilometers: 8500, engine: '1.8 Hybrid', horsepower: 122,
      fuel_type: 'Hybrid', transmission: 'e-CVT Automatic', color: 'Bi-tone Black Roof',
      condition: 'used', doors: 4, body_type: 'Sedan', interior: 'Black Fabric/Leather',
      price: 28500, status: 'available',
      description: 'Near-new 2023 Toyota Corolla GR Sport Hybrid in an exclusive bi-tone finish. This award-winning hybrid combines outstanding fuel efficiency with Toyota\'s legendary reliability. The GR Sport specification brings sporty aesthetics including a unique front bumper, 18-inch alloy wheels, and GR Sport interior with contrast stitching. With just 8,500 km, this is the ultimate nearly-new proposition — all of the value, none of the depreciation.',
      main_image: '/images/cars/toyota-corolla.jpg',
      features: JSON.stringify(['Air Conditioning', 'Toyota Touch Navigation', 'Bluetooth', 'Rear Camera', 'Parking Sensors', 'Heated Seats', 'Hybrid System', 'LED Headlights', 'Adaptive Cruise Control', 'Apple CarPlay', 'Android Auto', 'GR Sport Package', 'Lane Keep Assist', 'Safe Sense'])
    },
    {
      brand: 'Land Rover', model: 'Range Rover Evoque', version: 'R-Dynamic HSE', year: 2021,
      kilometers: 31000, engine: '2.0 D180', horsepower: 180,
      fuel_type: 'Diesel', transmission: 'Automatic', color: 'Santorini Black',
      condition: 'used', doors: 5, body_type: 'SUV', interior: 'Light Oyster Leather',
      price: 51000, status: 'available',
      description: 'The Range Rover Evoque R-Dynamic HSE is a design icon reimagined for the modern era. Finished in dramatic Santorini Black with a sumptuous Light Oyster leather interior, this Evoque is a statement of effortless style. The R-Dynamic specification adds exclusive exterior styling elements, while HSE specification ensures every luxury is catered for. Land Rover\'s Terrain Response 2 system makes this as capable off-road as it is beautiful in the city.',
      main_image: '/images/cars/range-rover-evoque.jpg',
      features: JSON.stringify(['Air Conditioning', 'Pivi Pro Navigation', 'Bluetooth', 'Rear Camera', 'Parking Sensors', 'Heated Seats', 'Meridian Sound', 'Panoramic Roof', 'Terrain Response 2', 'Adaptive Cruise Control', 'Apple CarPlay', 'Wireless Charging', 'Ambient Lighting', 'Wade Sensing', 'ClearSight Mirror'])
    }
  ];

  const insertCar = db.prepare(`
    INSERT INTO cars (brand, model, version, year, kilometers, engine, horsepower, fuel_type, transmission, color, condition, doors, body_type, interior, price, status, description, main_image, features)
    VALUES (@brand, @model, @version, @year, @kilometers, @engine, @horsepower, @fuel_type, @transmission, @color, @condition, @doors, @body_type, @interior, @price, @status, @description, @main_image, @features)
  `);

  cars.forEach(car => {
    insertCar.run(car);
  });

  console.log('✅ Demo cars seeded successfully');
}

module.exports = { getDb, initializeDatabase };
