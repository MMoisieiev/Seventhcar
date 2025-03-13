// routes/reservations.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET /api/reservations
  router.get("/", (req, res) => {
    const { status } = req.query;
    let query = "SELECT * FROM reservations";
    const queryParams = [];

    if (status) {
      query += " WHERE status = ?";
      queryParams.push(status);
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      results.forEach((row) => {
        if (row.start_date) {
          row.start_date = row.start_date.toISOString().split("T")[0];
        }
        if (row.end_date) {
          row.end_date = row.end_date.toISOString().split("T")[0];
        }
      });
      res.json(results);
    });
  });

  // GET /api/reservations/:id
  router.get("/:id", (req, res) => {
    const reservationId = req.params.id;
    db.query("SELECT * FROM reservations WHERE id = ?", [reservationId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (!results.length) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      const reservation = results[0];
      reservation.start_date = reservation.start_date.toISOString().split("T")[0];
      reservation.end_date = reservation.end_date.toISOString().split("T")[0];
      res.json(reservation);
    });
  });

  // POST /api/reservations
  router.post("/", (req, res) => {
    const {
      customer_name,
      customer_email,
      customer_phone,
      plate_number,
      start_date,
      start_time,
      end_date,
      end_time,
      total_price,
      status,
    } = req.body;
    db.query(
      `INSERT INTO reservations 
      (customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Server error" });
        }
        res.json({ success: true, message: "Reservation added successfully" });
      }
    );
  });

  // PUT /api/reservations/:id
  router.put("/:id", (req, res) => {
    const reservationId = req.params.id;
    const {
      customer_name,
      customer_email,
      customer_phone,
      plate_number,
      start_date,
      start_time,
      end_date,
      end_time,
      total_price,
      status,
    } = req.body;
    db.query(
      `UPDATE reservations 
       SET customer_name = ?, customer_email = ?, customer_phone = ?, plate_number = ?, 
           start_date = ?, start_time = ?, end_date = ?, end_time = ?, total_price = ?, status = ? 
       WHERE id = ?`,
      [customer_name, customer_email, customer_phone, plate_number, start_date, start_time, end_date, end_time, total_price, status, reservationId],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Server error" });
        }
        if (!result.affectedRows) {
          return res.status(404).json({ error: "Reservation not found" });
        }
        res.json({ success: true, message: "Reservation updated successfully" });
      }
    );
  });

  // Another PUT route for status changes? Or combine them. Up to you.
  // DELETE /api/reservations/:id
  router.delete("/:id", (req, res) => {
    const reservationId = req.params.id;
    db.query("DELETE FROM reservations WHERE id = ?", [reservationId], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (!result.affectedRows) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.json({ success: true, message: "Reservation deleted successfully" });
    });
  });

  return router;
};
