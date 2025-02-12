const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const multer = require('multer'); // For file uploads

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use 'secure: true' in production with HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Database connection
const db = mysql.createConnection({
    host: '34.35.30.206',
    user: 'admin',
    password: 'admin',
    database: 'SeventhCarHire'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});
//------------------------------------------------------------------------ROUTES-------------------------------------------------------
// Route: Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html'));
});
// Route: Cars Page
app.get('/cars', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'cars.html'));
});

// Route: Reservations Page (Admin Side)
app.get('/reservations', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'reservations.html'));
});

//---------------------------------------------------------------------------------------------------------------------------------------

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

// -------------------------------------------
// Updated RESTful Routes
// -------------------------------------------


//-------------------------------------RESERVATION----------------------------------------------------------------------------------------------------------------------------------------------------------
//  Fetch all reservations
app.get('/api/reservations', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM reservations';
    const queryParams = [];

    if (status) {
        query += ' WHERE status = ?';
        queryParams.push(status);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        // Manually transform each row's date fields
        results.forEach(row => {
            if (row.start_date) {
                row.start_date = row.start_date.toISOString().split('T')[0];
            }
            if (row.end_date) {
                row.end_date = row.end_date.toISOString().split('T')[0];
            }
        });

        res.json(results);
    });
});


// Fetch a single reservation by ID
app.get('/api/reservations/:id', (req, res) => {
    const reservationId = req.params.id;

    db.query('SELECT * FROM reservations WHERE id = ?', [reservationId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const reservation = results[0];

        // Convert the date to YYYY-MM-DD format
        reservation.start_date = reservation.start_date.toISOString().split('T')[0];
        reservation.end_date = reservation.end_date.toISOString().split('T')[0];

        res.json(reservation);
    });
});


// Edit a reservation 
app.put('/api/reservations/:id', (req, res) => {
    const reservationId = req.params.id;
    const { customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status } = req.body;

    db.query(
        'UPDATE reservations SET customer_name = ?, customer_email = ?, customer_phone = ?, plate_number = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, total_price = ?, status = ? WHERE id = ?',
        [customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status, reservationId],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reservation not found' });
            }

            res.json({ success: true, message: 'Reservation updated successfully' });
        }
    );
});

// Update reservation status (Approve / Cancel)
app.put('/api/reservations/:id', (req, res) => {
    const reservationId = req.params.id;
    const { status } = req.body;

    console.log(`Received update request: Reservation ${reservationId} -> Status: ${status}`); // Debugging Log

    if (!['Pending', 'Approved', 'Cancelled', 'Completed'].includes(status)) {
        console.error(`Invalid status received: ${status}`);
        return res.status(400).json({ error: 'Invalid status value' });
    }

    db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, reservationId], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Log database errors
            return res.status(500).json({ error: 'Server error', details: err });
        }

        if (result.affectedRows === 0) {
            console.error(`Reservation ${reservationId} not found in database`);
            return res.status(404).json({ error: 'Reservation not found' });
        }

        console.log(`Reservation ${reservationId} updated successfully to ${status}`);
        res.json({ success: true, message: `Reservation updated to ${status}` });
    });
});



//  Delete a reservation
app.delete('/api/reservations/:id', (req, res) => {
    const reservationId = req.params.id;

    db.query('DELETE FROM reservations WHERE id = ?', [reservationId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.json({ success: true, message: 'Reservation deleted successfully' });
    });
});

// Add a new reservation (Admin Manual Input)
app.post('/api/reservations', (req, res) => {
    const { customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status } = req.body;

    db.query(
        'INSERT INTO reservations (customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json({ success: true, message: 'Reservation added successfully' });
        }
    );
});


//-----------------------------------------------------CARS-----------------------------------------------------------------------------------------------------------------------------



// Route: Add Car (POST /api/cars)
app.post('/api/cars', upload.single('carImage'), (req, res) => {
    const { carName, plateNumber, transmission, fuelType, doorCount, storageSpace, price } = req.body;
    const carImage = req.file ? req.file.filename : null;

    db.query(
        'INSERT INTO cars (plate_number, car_name, transmission, fuel_type, door_count, storage_space, car_image_url, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [plateNumber, carName, transmission, fuelType, doorCount, storageSpace, carImage, price],
        (err) => {
            if (err) {
                console.error('Error adding car:', err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            res.json({ success: true, message: 'Car added successfully' });
        }
    );
});


// Route: Edit Car (PUT /api/cars/:plateNumber)
app.put('/api/cars/:plateNumber', upload.single('carImage'), (req, res) => {
    const { plateNumber } = req.params;
    const { carName, transmission, fuelType, doorCount, storageSpace, price } = req.body;
    const newCarImage = req.file ? req.file.filename : null;

    // Retrieve existing image to preserve if none uploaded
    db.query('SELECT car_image_url FROM cars WHERE plate_number = ?', [plateNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        const existingImage = results[0].car_image_url;
        const finalImage = newCarImage || existingImage;

        db.query(
            'UPDATE cars SET car_name = ?, transmission = ?, fuel_type = ?, door_count = ?, storage_space = ?, price = ?, car_image_url = ? WHERE plate_number = ?',
            [carName, transmission, fuelType, doorCount, storageSpace, price, finalImage, plateNumber],
            (err) => {
                if (err) {
                    console.error('Error updating car:', err);
                    return res.status(500).json({ success: false, message: 'Server error' });
                }
                res.json({ success: true, message: 'Car updated successfully' });
            }
        );
    });
});

// -------------------------------------------
// Existing Routes
// -------------------------------------------

// Route: Fetch All Cars
app.get('/api/cars', (req, res) => {
    db.query('SELECT * FROM cars', (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// Route: Fetch Car Details by Plate Number
app.get('/api/cars/:plateNumber', (req, res) => {
    const plateNumber = req.params.plateNumber;

    db.query('SELECT * FROM cars WHERE plate_number = ?', [plateNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json(results[0]);
    });
});

app.get('/assets/placeholder.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets', 'placeholder.jpg'));
});

// Route: DELETE cars 
app.delete('/api/cars/:plateNumber', (req, res) => {
    const plateNumber = req.params.plateNumber;
    db.query('DELETE FROM cars WHERE plate_number = ?', [plateNumber], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Car not found' });
      }
      res.json({ success: true, message: 'Car removed successfully' });
    });
  });
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
