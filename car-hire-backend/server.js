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
// 1) Home Page (root path)
app.get('/', (req, res) => {
    // index.html is your home page
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
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
// 4)Booking Page (client Side)
app.get('/bookingpage', (req, res) => {
    // index.html is your home page
    res.sendFile(path.join(__dirname, 'public', 'pages', 'bookingpage.html'));
});
app.get('/extras', (req, res) => {
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

app.get('/api/cars/available', (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const sql = `
        SELECT * FROM cars 
        WHERE plate_number NOT IN (
            SELECT plate_number FROM reservations
            WHERE (start_date <= ? AND end_date >= ?)
            AND status IN ('Pending', 'Approved')
        )
    `;

    db.query(sql, [endDate, startDate], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        res.json(results);
    });
});


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



//-------------------------------------------------------------CALENDAR ---------------------------------------------------------------------------------------------





app.get('/api/availability', (req, res) => {
    const yearParam = parseInt(req.query.year, 10);
    const monthParam = parseInt(req.query.month, 10);

    if (!yearParam || !monthParam || monthParam < 1 || monthParam > 12) {
        return res.status(400).json({ error: "Please provide valid 'year' and 'month' (1..12)." });
    }

    const startDate = new Date(yearParam, monthParam - 1, 1); // JS months are 0-based
    const endDate = new Date(yearParam, monthParam, 0);     // day=0 => last day of that month
    const startStr = formatDate(startDate); // 'YYYY-MM-DD'
    const endStr = formatDate(endDate);


    const sql = `
      WITH RECURSIVE allDays (day) AS (
         SELECT ? AS day
         UNION ALL
         SELECT DATE_ADD(day, INTERVAL 1 DAY)
         FROM allDays
         WHERE day < ?
      ),
      totalCars AS (
         SELECT COUNT(*) AS total FROM cars
      )
      SELECT 
         allDays.day AS date,
         totalCars.total - COUNT(r.id) AS freeCars
      FROM allDays
      CROSS JOIN totalCars
      LEFT JOIN reservations r
             ON r.status IN ('Pending','Approved')
            AND r.start_date <= allDays.day
            AND r.end_date   >= allDays.day
      GROUP BY allDays.day, totalCars.total
      ORDER BY allDays.day
    `;

    db.query(sql, [startStr, endStr], (err, results) => {
        if (err) {
            console.error("Error in availability query:", err);
            return res.status(500).json({ error: 'Database error in availability query.' });
        }

        
        res.json(results);
    });
});

// GET /api/caravailability/:plateNumber
// Returns an array of objects, each with { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
// for all 'Pending' or 'Approved' reservations on this car.

  

app.get("/api/caravailability/:plateNumber", (req, res) => {
    const plateNumber = req.params.plateNumber;
  
    const sql = `
      SELECT start_date, end_date
        FROM reservations
       WHERE plate_number = ?
         AND status IN ('Pending','Approved')
    `;
  
    db.query(sql, [plateNumber], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }
  
      
      const bookedRanges = results.map(row => {
        return {
          start: formatDate(row.start_date),
          end:   formatDate(row.end_date)
        };
      });
  
      // Return them
      res.json(bookedRanges);
    });
  });
  
  // Helper: format a MySQL date => "YYYY-MM-DD"



//--------------------------------------------------------------------EXTRAS ------------------------------------------------------------------------------------------------------------


// GET ALL EXTRAS
app.get('/api/extras', (req, res) => {
    db.query('SELECT * FROM extras', (err, results) => {
        if (err) {
            console.error('Database error (fetching extras):', err);
            return res.status(500).json({ error: 'Server error' });
        }
        // Return array of extras
        res.json(results);
    });
});

// GET ONE EXTRA BY ID
app.get('/api/extras/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM extras WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error (fetching extra by id):', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Extra not found' });
        }
        res.json(results[0]);
    });
});

// CREATE A NEW EXTRA
app.post('/api/extras', (req, res) => {
    const { name, price, description } = req.body;

    // Validate required fields
    if (!name || price == null) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    db.query(
        'INSERT INTO extras (name, price, description) VALUES (?, ?, ?)',
        [name, price, description || null],
        (err, result) => {
            if (err) {
                console.error('Database error (creating extra):', err);
                return res.status(500).json({ error: 'Server error' });
            }
            // Return the newly created row's ID
            res.status(201).json({
                id: result.insertId,
                name,
                price,
                description
            });
        }
    );
});

// UPDATE AN EXISTING EXTRA
app.put('/api/extras/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || price == null) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    db.query(
        'UPDATE extras SET name = ?, price = ?, description = ? WHERE id = ?',
        [name, price, description || null, id],
        (err, result) => {
            if (err) {
                console.error('Database error (updating extra):', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Extra not found' });
            }
            res.json({ id, name, price, description });
        }
    );
});

// DELETE AN EXTRA
app.delete('/api/extras/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM extras WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Database error (deleting extra):', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Extra not found' });
        }
        res.json({ message: 'Extra deleted successfully' });
    });
});




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
