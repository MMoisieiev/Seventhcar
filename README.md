Car Hire Booking Platform
A web-based platform designed to simplify the car rental process in Seychelles. This project addresses the challenges of outdated booking methods, hidden pricing, and lack of real-time availability by providing a minimal, user-friendly platform for both renters and small car rental businesses.

Table of Contents:

Project Overview
Key Features
Technology Stack
Installation & Setup
Usage
File Structure
Testing
Known Issues
Future Improvements
License


Project Overview
The Car Hire Booking Platform helps local rental businesses:

Automate car availability and reservation management.
Provide an admin panel for quick edits without specialized staff training.
Originally built to replace WhatsApp-based manual bookings, the system accommodates a small fleet (5–7 cars), yet has scope to expand if needed.

Key Features
Car Listings & Availability

Ability to view live availability for chosen dates.
Real-time updates prevent double bookings.
Booking & Manual Entry
Fleet management

Instant web-based bookings for customers.
Admins can manually add/edit reservations.


Cost breakdown for extra hours or drop-off locations.
Eliminates hidden fees commonly found with competitors.


Straightforward UI to update car listings and reservations.
Preserves existing car images if new ones are not uploaded.
Future-Ready Architecture

Adaptable for local bank payment gateway.
Potential to add user authentication if client demands it later.


Technology Stack
Frontend: HTML, CSS, Vanilla JavaScript
Backend: Node.js, Express.js
Database: MySQL (Google Cloud SQL)
File Uploads: Multer (Node.js middleware)
Session Management: express-session (no advanced auth by client request)


Installation & Setup
Prerequisites
Node.js (version 14+ recommended)
MySQL or Google Cloud SQL
npm or yarn

git clone https://github.com/MMoisieiev/Seventhcar.git

cd car-hire-backend


Install dependencies:
npm install


Configure Database:

Create a MySQL database named SeventhCarHire (or update the name in server.js).
In server.js or in an .env file, update host, user, password, and database as needed.
Run database migrations (optional, if you have a migration script) or manually create tables using the provided schema.


npm start 



Usage
Access the website in your browser at:
http://localhost:3000


Testing
Manual Testing
Prototypes: Each prototype iteration was tested by adding dummy reservations, verifying price breakdowns, or editing a car records.
UI Checks: Verified that minimal fields in the admin panel are enough to prevent confusion or missed data.


Automated Testing
Jest & supertest used for back-end tests.
server.test.js covers:
Cars: Create, read, update, delete.
Reservations: Create, read, update, delete, get availability.
Availability: Month-based freeCars logic and single-car date ranges.
Sample results:
bash
Copy
Edit
PASS  ./test/server.test.js
 ✓ POST /api/reservations adds a new reservation
 ✓ GET /api/cars retrieves all cars
 ...


 Known Issues
Basic UI: Developer’s limited JS experience led to simpler front-end code. This can be refined for better UX and reliability.
Client Side booking: Even though the backend is fully functional and ready to use the UI for a complete client side booking is still in the works (about 65% complete).
Deferred Payment Integration: Payment gateways are not implemented; future expansions require SSL, more advanced security, and user login flows.
Future Improvements
User Authentication & Roles: Adding a simple login form and roles (e.g., Admin, Staff) would reduce potential misuse.
Online Payment Integration: Potential collaboration with local banks or third-party services (Stripe, PayPal) to enable direct credit card transactions.
Refined Front-End UI: Transitioning to a framework (React, Vue) could significantly improve maintainability and user experience, especially for admin tasks.
Localization & Multi-Language: Expand accessibility for non-English-speaking tourists.
Advanced Reporting: Summaries of total sales per month, popular car categories, or average rental durations.


Permission is hereby granted, free of charge, to any person obtaining a copy...



Final Note
The Car Hire Booking Platform provides a foundation that meets the immediate needs of a small rental operation in Seychelles. While back-end systems are robust, front-end development was an ongoing learning process. With potential team expansion or improved front-end familiarity, the platform will evolve further to offer enhanced usability , UI design and integrated payment workflows