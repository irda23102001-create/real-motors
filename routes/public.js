const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');

// HOME
router.get('/', (req, res) => {
  const db = getDb();
  const featuredCars = db.prepare(`SELECT * FROM cars WHERE status = 'available' ORDER BY created_at DESC LIMIT 6`).all();
  const stats = {
    totalCars: db.prepare('SELECT COUNT(*) as count FROM cars').get().count,
    soldCars: db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'sold'").get().count,
    availableCars: db.prepare("SELECT COUNT(*) as count FROM cars WHERE status = 'available'").get().count
  };
  res.render('index', { title: 'Real Motors - Car & Motorbike Rental', featuredCars, stats });
});

// INVENTORY
router.get('/inventory', (req, res) => {
  const db = getDb();
  const { brand, fuel_type, transmission, min_price, max_price, min_year, max_year, sort, search, page } = req.query;

  let query = 'SELECT * FROM cars WHERE 1=1';
  const params = [];

  if (brand) { query += ' AND brand = ?'; params.push(brand); }
  if (fuel_type) { query += ' AND fuel_type = ?'; params.push(fuel_type); }
  if (transmission) { query += ' AND transmission = ?'; params.push(transmission); }
  if (min_price) { query += ' AND price >= ?'; params.push(parseFloat(min_price)); }
  if (max_price) { query += ' AND price <= ?'; params.push(parseFloat(max_price)); }
  if (min_year) { query += ' AND year >= ?'; params.push(parseInt(min_year)); }
  if (max_year) { query += ' AND year <= ?'; params.push(parseInt(max_year)); }
  if (search) {
    query += ' AND (brand LIKE ? OR model LIKE ? OR version LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sortMap = {
    'price_asc': 'price ASC', 'price_desc': 'price DESC',
    'year_desc': 'year DESC', 'year_asc': 'year ASC',
    'km_asc': 'kilometers ASC', 'newest': 'created_at DESC'
  };
  query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

  const perPage = 9;
  const currentPage = parseInt(page) || 1;
  const total = db.prepare(`SELECT COUNT(*) as count FROM cars WHERE 1=1 ${query.split('WHERE 1=1')[1].split('ORDER BY')[0]}`).get(...params).count;
  const totalPages = Math.ceil(total / perPage);

  query += ` LIMIT ${perPage} OFFSET ${(currentPage - 1) * perPage}`;
  const cars = db.prepare(query).all(...params);

  const brands = db.prepare('SELECT DISTINCT brand FROM cars ORDER BY brand').all();
  const filters = { brand, fuel_type, transmission, min_price, max_price, min_year, max_year, sort, search };

  res.render('inventory', {
    title: 'Inventory - Real Motors',
    cars, brands, filters, currentPage, totalPages, total
  });
});

// SINGLE CAR
router.get('/car/:id', (req, res) => {
  const db = getDb();
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.redirect('/inventory');

  car.features = car.features ? JSON.parse(car.features) : [];
  const gallery = db.prepare('SELECT * FROM car_images WHERE car_id = ? ORDER BY sort_order').all(car.id);
  const similar = db.prepare(`SELECT * FROM cars WHERE brand = ? AND id != ? AND status = 'available' LIMIT 3`).all(car.brand, car.id);

  res.render('car', { title: `${car.brand} ${car.model} - Real Motors`, car, gallery, similar });
});

// ABOUT
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us - Real Motors' });
});

// CONTACT
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact - Real Motors' });
});

router.post('/contact', (req, res) => {
  const { name, phone, email, message, car_id } = req.body;
  if (!name || !phone || !email || !message) {
    req.flash('error', 'Please fill in all required fields.');
    return res.redirect('/contact');
  }
  const db = getDb();
  db.prepare('INSERT INTO contacts (name, phone, email, message, car_id) VALUES (?, ?, ?, ?, ?)').run(name, phone, email, message, car_id || null);
  req.flash('success', 'Your message has been sent! We will contact you shortly.');
  res.redirect('/contact');
});

// APPOINTMENT
router.get('/appointment', (req, res) => {
  const db = getDb();
  const cars = db.prepare("SELECT * FROM cars WHERE status = 'available' ORDER BY brand, model").all();
  const selectedCarId = req.query.car || null;
  res.render('appointment', { title: 'Book Appointment - Real Motors', cars, selectedCarId });
});

router.post('/appointment', (req, res) => {
  const { name, phone, email, car_id, appointment_date, appointment_time, message } = req.body;
  if (!name || !phone || !email) {
    req.flash('error', 'Please fill in all required fields.');
    return res.redirect('/appointment');
  }
  const db = getDb();
  let carName = null;
  if (car_id) {
    const car = db.prepare('SELECT brand, model FROM cars WHERE id = ?').get(car_id);
    if (car) carName = `${car.brand} ${car.model}`;
  }
  db.prepare(`INSERT INTO appointments (name, phone, email, car_id, car_name, appointment_date, appointment_time, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(name, phone, email, car_id || null, carName, appointment_date, appointment_time, message);
  req.flash('success', 'Appointment request submitted! We will confirm your booking within 24 hours.');
  res.redirect('/appointment?success=1');
});

// FAQ
router.get('/faq', (req, res) => {
  res.render('faq', { title: 'FAQ - Real Motors' });
});

module.exports = router;
