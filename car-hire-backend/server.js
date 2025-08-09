const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const multer = require('multer'); // For file uploads

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Database connection
require('dotenv').config();
const db = mysql.createConnection({
    host: 'db-mysql-fra1-06464-do-user-23578538-0.l.db.ondigitalocean.com',
    port: 25060,
    user: process.env.AIVEN_SERVICE_LOGIN,
    password: process.env.AIVEN_SERVICE_PASSWORD,
    database: 'SeventhCarHire',
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database!');
  });
//------------------------------------------------------------------------ROUTES-------------------------------------------------------
// 1) Home Page (root path)
app.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            // We can still serve the page. The user won't have a valid session anyway.
        }
        res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
    });
});

// 2) Login Page
app.get('/login', (req, res) => {
    // login.html is your login page
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});

// 3) Cars Page
app.get('/cars', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'cars.html'));
});

// 4) Reservations Page (Admin Side)
app.get('/reservations', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'reservations.html'));
});
// calendar
app.get('/calendar', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'calendar.html'));
});
// 4)Booking Page (client Side)
app.get('/bookingpage', (req, res) => {
    // index.html is your home page
    res.sendFile(path.join(__dirname, 'public', 'pages', 'bookingpage.html'));
});
app.get('/extras',isAuthenticated, (req, res) => {
    // index.html is your home page
    res.sendFile(path.join(__dirname, 'public', 'pages', 'extras.html'));
});



//---------------------------------------------------------------------------------------------------------------------------------------
function formatDate(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm   = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd   = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  
// Route: Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Server error' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                res.status(500).json({ success: false, message: 'Server error' });
                return;
            }

            if (isMatch) {
                req.session.userId = user.id;
                res.json({ success: true });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        });
    });
});

// Middleware: Auth Check
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).redirect('/');
    }
}



// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });


const carsRoutes = require("./routes/cars");         
const reservationsRoutes = require("./routes/reservations");
const extrasRoutes = require("./routes/extras");

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));

//-------------------------------------------------------------CALENDAR ---------------------------------------------------------------------------------------------
app.use("/api/cars", carsRoutes(db, upload));
app.use("/api/reservations", reservationsRoutes(db));
app.use("/api/extras", extrasRoutes(db));


app.get('/api/reservations/test', (req, res) => {
    res.json({success: true, message: "Test route working"});
  });
  

  // Helper: format a MySQL date => "YYYY-MM-DD"



//--------------------------------------------------------------------EXTRAS ------------------------------------------------------------------------------------------------------------


// Start the server
// module.exports = app;

// if (require.main === module) {
//     const port = 3000;
//     app.listen(port, () => {
//       console.log(`Server running on http://localhost:${port}`);
//     });
//   }

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
