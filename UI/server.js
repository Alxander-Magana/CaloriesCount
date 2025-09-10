import express from 'express';
import path from 'path';
import mysql from 'mysql2';
import cors from 'cors';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5173;
const saltRounds = 10;

// OTP storage and configuration
const otpStore = new Map(); // Store OTPs with username as key
const OTP_VALID_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware - log all incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', JSON.stringify(req.body));
    }
    next();
});

// 🔐 Use environment variables or replace with your values
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'caloriescount',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        console.error('Details:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        });
    } else {
        console.log('Connected to MySQL database');

        // Test query to verify connection and database state
        db.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error('Failed to query tables:', err);
            } else {
                console.log('Available tables:', results.map(row => Object.values(row)[0]).join(', '));
            }
        });
    }
});

// Function to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Serve files from the 'src/assets' folder directly
app.use('/src/assets', express.static(path.join(__dirname, 'src/assets')));

// For registration - hash password before storing
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const checkQuery = 'SELECT * FROM user WHERE username = ? OR email = ?';
        db.query(checkQuery, [username, email], (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Store the hashed password instead of plain text
            const insertQuery = 'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)';
            console.log(insertQuery);
            db.query(insertQuery, [username, email, hashedPassword, 'USER'], (err, result) => {
                if (err) return res.status(500).json({ error: 'Error registering user' });

                res.json({ message: 'Registration successful!', userId: result.insertId });
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Modified login endpoint to handle both credential verification and OTP verification
app.post('/login', async (req, res) => {
    const { username, password, otp } = req.body;

    // Step 2: OTP verification
    if (otp) {
        // Check if we have an OTP for this user
        const otpData = otpStore.get(username);
        
        if (!otpData) {
            return res.status(401).json({ error: 'No active verification code found. Please login again.' });
        }
        
        if (Date.now() > otpData.expiryTime) {
            otpStore.delete(username);
            return res.status(401).json({ error: 'Verification code expired. Please login again.' });
        }
        
        if (otp !== otpData.otp) {
            return res.status(401).json({ error: 'Invalid verification code. Please try again.' });
        }
        
        // OTP is valid, complete the login process
        otpStore.delete(username); // Remove used OTP
        
        // Return the user data stored during the first step
        res.json({
            message: 'Login successful!',
            user: otpData.userData,
            role: otpData.userData.role,
        });
        
        return;
    }

    // Step 1: Initial credential verification
    const loginQuery = 'SELECT userid, username, email, role, password FROM user WHERE username = ?';
    db.query(loginQuery, [username], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        try {
            // Compare submitted password with stored hash
            const match = await bcrypt.compare(password, results[0].password);

            if (match) {
                // Don't send the password hash back to the client
                const { password, ...userWithoutPassword } = results[0];

                // Generate OTP for this user
                const otp = generateOTP();
                const expiryTime = Date.now() + OTP_VALID_DURATION;
                
                // Store OTP and user data for verification step
                otpStore.set(username, {
                    otp,
                    expiryTime,
                    userData: userWithoutPassword
                });
                
                // Print OTP to console
                console.log(`\n====================================`);
                console.log(`🔐 VERIFICATION CODE for ${username}: ${otp}`);
                console.log(`Valid for 5 minutes`);
                console.log(`====================================\n`);
                
                // Tell client to ask for OTP
                res.json({
                    message: 'Please enter the verification code',
                    requireOTP: true,
                    username: username
                });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    });
});

app.put('/api/users/:userId/password', async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    console.log('Password update attempt for user:', userId);

    try {
        // First, get the user's current password hash
        const userQuery = 'SELECT password FROM user WHERE userid = ?';
        db.query(userQuery, [userId], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                console.log('User not found:', userId);
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify old password
            const match = await bcrypt.compare(oldPassword, results[0].password);
            console.log('Old Pass ', oldPassword);
            console.log('Password match result:', match);

            if (!match) {
                console.log('Password mismatch for user:', userId);
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            const updateQuery = 'UPDATE user SET password = ? WHERE userid = ?';
            db.query(updateQuery, [hashedNewPassword, userId], (updateErr) => {
                if (updateErr) {
                    console.error('Update error:', updateErr);
                    return res.status(500).json({ error: 'Failed to update password' });
                }

                console.log('Password successfully updated for user:', userId);
                res.json({ message: 'Password updated successfully' });
            });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Server error during password update' });
    }
});

// Handle all routes and send index.html from React dist folder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Database connection: host=${db.config.host}, user=${db.config.user}, database=${db.config.database}`);
});