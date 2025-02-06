const bcrypt = require('bcrypt');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: '34.35.30.206',
    user: 'admin',
    password: 'admin',
    database: 'SeventhCarHire'
});

const username = 'admin';
const plainPassword = 'admin_password';

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
        } else {
            console.log('User inserted successfully.');
        }

        db.end();
    });
});
