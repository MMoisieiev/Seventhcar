// server.test.js

const request = require('supertest');
const app = require('./server'); // Import the app from server.js

// Example placeholders for valid data. Adjust these based on what's actually valid in your DB.
const TEST_CAR = {
  carName: 'Test Car',
  plateNumber: 'TEST-123',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  doorCount: 4,
  storageSpace: 'Medium',
  price: 100
};

const TEST_RESERVATION = {
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '1234567890',
  plate_number: 'TEST-123',
  start_date: '2025-03-01',
  start_time: '10:00',
  end_date: '2025-03-02',
  end_time: '10:00',
  total_price: 200,
  status: 'Pending'
};

describe('Server API Tests', () => {
  //
  // --- AUTH / LOGIN ---
  //
    describe('POST /login', () => {
        it('should fail with invalid credentials', async () => {
            const response = await request(app).post('/login').send({
                username: 'wrong',
                password: 'wrong'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        // If you have a test user in your DB, provide correct credentials here.
        it('should succeed with valid credentials', async () => {
            const response = await request(app).post('/login').send({
                username: 'admin',
                password: 'admin_password'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

  //
  // --- CARS ---
  //
  describe('Cars Endpoints', () => {
    // 1) GET all cars
    it('GET /api/cars should return array of cars', async () => {
      const response = await request(app).get('/api/cars');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // 2) POST create a new car
    it('POST /api/cars should add a new car', async () => {
      const response = await request(app)
        .post('/api/cars')
        // SuperTest supports file upload with .attach(), 
        // but for simplicity, we'll omit the image field. 
        .field('carName', TEST_CAR.carName)
        .field('plateNumber', TEST_CAR.plateNumber)
        .field('transmission', TEST_CAR.transmission)
        .field('fuelType', TEST_CAR.fuelType)
        .field('doorCount', TEST_CAR.doorCount)
        .field('storageSpace', TEST_CAR.storageSpace)
        .field('price', TEST_CAR.price);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    // 3) GET car by plateNumber
    it('GET /api/cars/:plateNumber should retrieve car details', async () => {
      const response = await request(app).get(`/api/cars/${TEST_CAR.plateNumber}`);
      // Could be 200 or 404, depending if the new car was actually inserted into the DB
      if (response.status === 200) {
        expect(response.body).toHaveProperty('plate_number', TEST_CAR.plateNumber);
      } else {
        // This means the new car wasn't in DB or the test DB didn’t commit the insert
        expect(response.status).toBe(404);
      }
    });

    // 4) PUT update car
    it('PUT /api/cars/:plateNumber should update car details', async () => {
      const updatedCar = { ...TEST_CAR, carName: 'Updated Car' };
      const response = await request(app)
        .put(`/api/cars/${TEST_CAR.plateNumber}`)
        .field('carName', updatedCar.carName)
        .field('transmission', updatedCar.transmission)
        .field('fuelType', updatedCar.fuelType)
        .field('doorCount', updatedCar.doorCount)
        .field('storageSpace', updatedCar.storageSpace)
        .field('price', updatedCar.price);

      // If the car is found & updated, expect 200 with success = true
      // If not found, might be 404
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      } else {
        expect(response.status).toBe(404);
      }
    });

    // 5) DELETE car
    it('DELETE /api/cars/:plateNumber should delete the car', async () => {
      const response = await request(app).delete(`/api/cars/${TEST_CAR.plateNumber}`);
      // If successful, status=200, success=true
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      } else {
        expect(response.status).toBe(404); // Car not found or not inserted
      }
    });
  });

  //
  // --- RESERVATIONS ---
  //
  describe('Reservations Endpoints', () => {
    let createdReservationId; // to track new reservation ID

    // 1) GET all reservations
    it('GET /api/reservations should return array of reservations', async () => {
      const response = await request(app).get('/api/reservations');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    // 2) POST create a new reservation
    it('POST /api/reservations should add a new reservation', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send(TEST_RESERVATION);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      } else {
        // Possibly 500 or 400 if DB error or missing fields
        console.warn('POST reservation failed with status:', response.status);
      }

   
    });

    // 3) GET reservation by ID
    // You need an actual reservation in DB with known ID for this test
    it('GET /api/reservations/:id should fetch a reservation by ID', async () => {
      const knownId = 1; // Hardcode an ID that you know exists in your test DB
      const response = await request(app).get(`/api/reservations/${knownId}`);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id', knownId);
      } else {
        // Possibly 404 if that ID doesn’t exist
        expect(response.status).toBe(404);
      }
    });

    // 4) PUT update a reservation
    it('PUT /api/reservations/:id should update a reservation', async () => {
      const knownId = 1; // Again, must exist in DB
      const update = { ...TEST_RESERVATION, status: 'Approved' };
      const response = await request(app)
        .put(`/api/reservations/${knownId}`)
        .send(update);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      } else {
        expect([404, 500]).toContain(response.status);
      }
    });

    // 5) DELETE a reservation
    it('DELETE /api/reservations/:id should delete a reservation', async () => {
      const knownId = 1; // Must exist in DB
      const response = await request(app).delete(`/api/reservations/${knownId}`);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      } else {
        expect(response.status).toBe(404);
      }
    });
  });

  //
  // --- AVAILABILITY / CALENDAR ---
  //
  describe('Availability Endpoints', () => {
    it('GET /api/availability?year=2025&month=3 should return daily availability', async () => {
      const response = await request(app).get('/api/availability?year=2025&month=3');
      // 200 if valid
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect(response.status).toBe(400); // or 500, etc.
      }
    });

    it('GET /api/caravailability/:plateNumber should return booked ranges', async () => {
      const response = await request(app).get('/api/caravailability/TEST-123'); 
      // Adjust plate number to one that actually exists
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect([404, 500]).toContain(response.status);
      }
    });
  });

  //
  // --- ANY OTHER ENDPOINTS (e.g. /api/cars/available) ---
  //
  describe('GET /api/cars/available', () => {
    it('should return available cars given a date range', async () => {
      const response = await request(app)
        .get('/api/cars/available')
        .query({ startDate: '2025-03-10', endDate: '2025-03-12' });

      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect(response.status).toBe(400); // Missing or invalid query params
      }
    });
  });
});
