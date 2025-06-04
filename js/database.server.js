const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            school TEXT,
            class TEXT,
            shift TEXT
        )`);

        // Progress table
        db.run(`CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subject TEXT NOT NULL,
            level TEXT NOT NULL,
            score REAL NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    });
}

// Database operations
const dbOperations = {
    // Register new user
    registerUser: (userData) => {
        return new Promise((resolve, reject) => {
            const { name, email, password, age, gender, school, class: className, shift } = userData;
            
            db.run(
                `INSERT INTO users (name, email, password, age, gender, school, class, shift)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, password, age, gender, school, className, shift],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    },

    // Login user
    loginUser: (email, password) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE email = ? AND password = ?',
                [email, password],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    },

    // Save progress
    saveProgress: (userId, subject, level, score) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO progress (user_id, subject, level, score)
                 VALUES (?, ?, ?, ?)`,
                [userId, subject, level, score],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    },

    // Get user progress
    getProgress: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM progress WHERE user_id = ? ORDER BY completed_at DESC',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
};

module.exports = dbOperations;
