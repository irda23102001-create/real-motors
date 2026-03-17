# 🚗 Real Motors — Car & Motorbike Dealership Website

A complete, production-ready dealership website built with Node.js, Express, EJS, and SQLite.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```

Open your browser: **http://localhost:3000**

---

## 🔑 Admin Panel

| URL      | http://localhost:3000/admin |
|----------|-----------------------------|
| Username | `admin`                     |
| Password | `admin123`                  |

> ⚠️ Change these credentials in `.env` before deploying!

---

## 📁 Project Structure

```
realmotors/
├── server.js                  ← Express app entry point
├── package.json               ← npm dependencies
├── .env                       ← Environment variables (edit this!)
│
├── database/
│   └── realmotors.db          ← SQLite database (auto-created on first run)
│
├── models/
│   └── database.js            ← DB init, schema, and demo data seeding
│
├── routes/
│   ├── public.js              ← Public-facing pages
│   └── admin.js               ← Admin panel routes + file upload handling
│
├── views/
│   ├── partials/
│   │   ├── header.ejs         ← Navbar
│   │   └── footer.ejs         ← Footer
│   ├── index.ejs              ← Home page
│   ├── inventory.ejs          ← Car listing with search & filters
│   ├── car.ejs                ← Single car detail page with gallery
│   ├── about.ejs              ← About page
│   ├── contact.ejs            ← Contact form
│   ├── appointment.ejs        ← Booking form
│   ├── faq.ejs                ← FAQ accordion
│   ├── 404.ejs                ← Custom 404 page
│   └── admin/
│       ├── login.ejs          ← Admin login
│       ├── dashboard.ejs      ← Stats overview
│       ├── cars.ejs           ← Inventory management table
│       ├── car-form.ejs       ← Add / Edit car form
│       ├── appointments.ejs   ← Appointment requests
│       ├── contacts.ejs       ← Contact messages
│       └── partials/
│           ├── header.ejs     ← Admin sidebar + header
│           └── footer.ejs     ← Admin scripts
│
└── public/
    ├── css/
    │   ├── style.css          ← Main site styles (premium luxury theme)
    │   └── admin.css          ← Admin panel styles
    ├── js/
    │   ├── main.js            ← Navbar, counters, scroll animations
    │   └── admin.js           ← Admin sidebar toggle, alerts
    ├── images/
    │   ├── logo.png           ← Real Motors logo
    │   ├── car-placeholder.svg ← Fallback car image
    │   └── cars/              ← (place car photos here)
    └── uploads/               ← Admin-uploaded images (auto-created)
```

---

## 🌐 Pages

| Page | URL |
|------|-----|
| Home | `/` |
| Inventory | `/inventory` |
| Car Detail | `/car/:id` |
| About | `/about` |
| Contact | `/contact` |
| Book Appointment | `/appointment` |
| FAQ | `/faq` |

### Admin Pages

| Page | URL |
|------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin/dashboard` |
| Cars | `/admin/cars` |
| Add Car | `/admin/cars/add` |
| Edit Car | `/admin/cars/edit/:id` |
| Appointments | `/admin/appointments` |
| Messages | `/admin/contacts` |

---

## 🚗 Adding Real Car Photos

1. Go to `/admin/cars/edit/:id` for any car
2. Upload a main image and gallery images
3. Supported formats: JPG, PNG, WEBP (max 10MB each)

Or, place car images directly in `public/images/cars/` and update the `main_image` field in the database.

---

## ⚙️ Environment Variables (`.env`)

```env
SESSION_SECRET=your_secret_key_here
PORT=3000
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `ejs` | Template engine |
| `better-sqlite3` | SQLite database |
| `express-session` | Session management |
| `connect-flash` | Flash messages |
| `multer` | Image file uploads |
| `bcryptjs` | Password hashing |
| `method-override` | PUT/DELETE form support |
| `dotenv` | Environment variables |

---

## 🎨 Design

- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Colors**: Deep Navy `#1F3B6A`, Gold `#C9A84C`, Light `#F6F7F9`
- **Icons**: Font Awesome 6
- Fully responsive, mobile-first layout
- Smooth animations and scroll-triggered effects

---

## 🔒 Security Notes

- Admin routes are protected by session authentication
- All form inputs should be sanitized (consider adding `express-validator` for production)
- Change the admin password before going live
- Use HTTPS in production
- Set a strong `SESSION_SECRET` in `.env`

---

## 🛠 Development

```bash
# Install nodemon for auto-restart on file changes
npm install -g nodemon

# Run in development mode
npm run dev
```

---

## 📞 Demo Data

The database is automatically seeded with 7 demo cars on first run:

1. **Audi A6** 2.0 TDI S-Line — €42,500
2. **BMW X5** xDrive30d M Sport — €72,000
3. **Mercedes-Benz C300** AMG Line — €54,000
4. **Volkswagen Golf GTI** Performance — €32,000
5. **Porsche Cayenne** S Platinum — €89,000
6. **Toyota Corolla** Hybrid GR Sport — €28,500
7. **Range Rover Evoque** R-Dynamic HSE — €51,000

To reset the database and re-seed: delete `database/realmotors.db` and restart the server.

---

*Built for Real Motors — Car & Motorbike Rental, Tiranë, Albania*
