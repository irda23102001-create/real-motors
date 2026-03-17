const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../models/database');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

// Redirect /admin to /admin/login
router.get('/', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.redirect('/admin/login');
});

// LOGIN
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Admin Login - Real Motors', error: req.flash('error') });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    req.flash('error', 'Invalid username or password.');
    return res.redirect('/admin/login');
  }
  req.session.isAdmin = true;
  req.session.adminUsername = admin.username;
  res.redirect('/admin/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// DASHBOARD
router.get('/dashboard', isAuthenticated, (req, res) => {
  const db = getDb();
  const stats = {
    totalCars: db.prepare('SELECT COUNT(*) as c FROM cars').get().c,
    availableCars: db.prepare("SELECT COUNT(*) as c FROM cars WHERE status='available'").get().c,
    soldCars: db.prepare("SELECT COUNT(*) as c FROM cars WHERE status='sold'").get().c,
    reservedCars: db.prepare("SELECT COUNT(*) as c FROM cars WHERE status='reserved'").get().c,
    totalAppointments: db.prepare('SELECT COUNT(*) as c FROM appointments').get().c,
    pendingAppointments: db.prepare("SELECT COUNT(*) as c FROM appointments WHERE status='pending'").get().c,
    totalContacts: db.prepare('SELECT COUNT(*) as c FROM contacts').get().c,
    newContacts: db.prepare("SELECT COUNT(*) as c FROM contacts WHERE status='new'").get().c
  };
  const recentAppointments = db.prepare('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5').all();
  const recentContacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5').all();
  res.render('admin/dashboard', { title: 'Dashboard - Admin', stats, recentAppointments, recentContacts });
});

// CARS LIST
router.get('/cars', isAuthenticated, (req, res) => {
  const db = getDb();
  const cars = db.prepare('SELECT * FROM cars ORDER BY created_at DESC').all();
  res.render('admin/cars', { title: 'Manage Cars - Admin', cars });
});

// ADD CAR
router.get('/cars/add', isAuthenticated, (req, res) => {
  res.render('admin/car-form', { title: 'Add Car - Admin', car: null, action: '/admin/cars/add', method: 'POST' });
});

router.post('/cars/add', isAuthenticated, upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), (req, res) => {
  const db = getDb();
  const { brand, model, version, year, kilometers, engine, horsepower, fuel_type, transmission, color, condition, doors, body_type, interior, price, status, description } = req.body;
  const features = req.body.features ? (Array.isArray(req.body.features) ? JSON.stringify(req.body.features) : JSON.stringify([req.body.features])) : '[]';
  const mainImage = req.files?.main_image ? `/uploads/${req.files.main_image[0].filename}` : null;

  const result = db.prepare(`
    INSERT INTO cars (brand, model, version, year, kilometers, engine, horsepower, fuel_type, transmission, color, condition, doors, body_type, interior, price, status, description, main_image, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(brand, model, version, parseInt(year), parseInt(kilometers) || 0, engine, parseInt(horsepower) || null, fuel_type, transmission, color, condition, parseInt(doors) || 4, body_type, interior, parseFloat(price), status, description, mainImage, features);

  if (req.files?.gallery) {
    req.files.gallery.forEach((file, i) => {
      db.prepare('INSERT INTO car_images (car_id, image_path, sort_order) VALUES (?, ?, ?)').run(result.lastInsertRowid, `/uploads/${file.filename}`, i);
    });
  }

  req.flash('success', 'Car added successfully!');
  res.redirect('/admin/cars');
});

// EDIT CAR
router.get('/cars/edit/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.redirect('/admin/cars');
  car.features = car.features ? JSON.parse(car.features) : [];
  const gallery = db.prepare('SELECT * FROM car_images WHERE car_id = ? ORDER BY sort_order').all(car.id);
  res.render('admin/car-form', { title: 'Edit Car - Admin', car, gallery, action: `/admin/cars/edit/${car.id}`, method: 'POST' });
});

router.post('/cars/edit/:id', isAuthenticated, upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), (req, res) => {
  const db = getDb();
  const { brand, model, version, year, kilometers, engine, horsepower, fuel_type, transmission, color, condition, doors, body_type, interior, price, status, description } = req.body;
  const features = req.body.features ? (Array.isArray(req.body.features) ? JSON.stringify(req.body.features) : JSON.stringify([req.body.features])) : '[]';

  const existing = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  const mainImage = req.files?.main_image ? `/uploads/${req.files.main_image[0].filename}` : existing.main_image;

  db.prepare(`UPDATE cars SET brand=?, model=?, version=?, year=?, kilometers=?, engine=?, horsepower=?, fuel_type=?, transmission=?, color=?, condition=?, doors=?, body_type=?, interior=?, price=?, status=?, description=?, main_image=?, features=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(brand, model, version, parseInt(year), parseInt(kilometers) || 0, engine, parseInt(horsepower) || null, fuel_type, transmission, color, condition, parseInt(doors) || 4, body_type, interior, parseFloat(price), status, description, mainImage, features, req.params.id);

  if (req.files?.gallery) {
    req.files.gallery.forEach((file, i) => {
      db.prepare('INSERT INTO car_images (car_id, image_path, sort_order) VALUES (?, ?, ?)').run(req.params.id, `/uploads/${file.filename}`, i + 100);
    });
  }

  req.flash('success', 'Car updated successfully!');
  res.redirect('/admin/cars');
});

// DELETE CAR
router.post('/cars/delete/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  req.flash('success', 'Car deleted successfully.');
  res.redirect('/admin/cars');
});

// DELETE GALLERY IMAGE
router.post('/cars/gallery/delete/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  const img = db.prepare('SELECT * FROM car_images WHERE id = ?').get(req.params.id);
  if (img) {
    const filePath = path.join(__dirname, '..', 'public', img.image_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM car_images WHERE id = ?').run(req.params.id);
  }
  req.flash('success', 'Image deleted.');
  res.redirect('back');
});

// APPOINTMENTS
router.get('/appointments', isAuthenticated, (req, res) => {
  const db = getDb();
  const appointments = db.prepare('SELECT * FROM appointments ORDER BY created_at DESC').all();
  res.render('admin/appointments', { title: 'Appointments - Admin', appointments });
});

router.post('/appointments/status/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  req.flash('success', 'Appointment status updated.');
  res.redirect('/admin/appointments');
});

router.post('/appointments/delete/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  req.flash('success', 'Appointment deleted.');
  res.redirect('/admin/appointments');
});

// CONTACTS
router.get('/contacts', isAuthenticated, (req, res) => {
  const db = getDb();
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.render('admin/contacts', { title: 'Messages - Admin', contacts });
});

router.post('/contacts/status/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE contacts SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.redirect('/admin/contacts');
});

router.post('/contacts/delete/:id', isAuthenticated, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  req.flash('success', 'Message deleted.');
  res.redirect('/admin/contacts');
});

module.exports = router;
