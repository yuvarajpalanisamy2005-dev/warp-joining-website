const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ========== SETUP ==========
const twilioClient = twilio(
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) console.error('❌ DB Error:', err);
    else console.log('✅ Connected to MySQL Database!');
});

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// ========== 1. CHECK USER ==========
app.get('/api/users/:contact', (req, res) => {
    db.query('SELECT * FROM users WHERE contact = ?', [req.params.contact], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json({ exists: false });
        res.json({ exists: true, user: results[0] });
    });
});

// ========== 2. SEND OTP ==========
app.post('/api/send-otp', async (req, res) => {
    const { contact } = req.body;
    const trimmed = contact.trim();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
       /* await db.promise().query('DELETE FROM otp_verifications WHERE contact = ?', [trimmed]);
        await db.promise().query(
            'INSERT INTO otp_verifications (contact, otp, expires_at) VALUES (?, ?, ?)',
            [trimmed, otp, expiresAt]
        );*/

        if (/^\d{10}$/.test(trimmed)) {
            await twilioClient.messages.create({
                body: `Your Warp Joining OTP is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+91${trimmed}`
            });
        } else {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: trimmed,
                subject: 'Your Warp Joining OTP',
                html: `<h2>🔐 Your OTP: ${otp}</h2>`
            });
        }
        res.json({ success: true, message: 'OTP sent!' });
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false, error: 'Failed to send OTP.' });
    }
}); // <--- இந்த }); தான் விடுபட்டிருந்தது!

// ========== 3. VERIFY OTP ==========
app.post('/api/verify-otp', (req, res) => {
    const { contact, otp } = req.body;
    db.query(
        'SELECT * FROM otp_verifications WHERE contact = ? ORDER BY created_at DESC LIMIT 1',
        [contact.trim()],
        (err, results) => {
            if (err || results.length === 0) return res.json({ success: false, error: 'No OTP' });
            const record = results[0];
            if (new Date() > new Date(record.expires_at)) return res.json({ success: false, error: 'Expired' });
            if (record.otp !== otp.trim()) return res.json({ success: false, error: 'Incorrect' });
            
            db.query('UPDATE otp_verifications SET verified = TRUE WHERE id = ?', [record.id]);
            res.json({ success: true, message: 'Verified!' });
        }
    );
});

// ========== 4. CREATE USER ==========
app.post('/api/users', (req, res) => {
    const { name, contact, userType, address, location, skills, experience } = req.body;
    db.query(
        `INSERT INTO users (name, contact, user_type, address, location_lat, location_lng, skills, experience) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, contact, userType, address, location?.lat, location?.lng, skills ? JSON.stringify(skills) : null, experience],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

// ========== 5. GET WORKERS ==========
app.get('/api/workers', (req, res) => {
    db.query('SELECT * FROM users WHERE user_type = "worker"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ========== 6. CREATE BOOKING ==========
app.post('/api/bookings', (req, res) => {
    const { customerName, customerPhone, yarn, size, price, address, location, workerId } = req.body;
    const query = `
        INSERT INTO bookings 
        (customer_name, customer_phone, yarn, size, price, address, location_lat, location_lng, worker_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    const values = [
        customerName, customerPhone, yarn, size, price, address, 
        location?.lat || null, location?.lng || null, 
        workerId || null 
    ];

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// ========== 7. GET CUSTOMER BOOKINGS ==========
app.get('/api/bookings/customer/:phone', (req, res) => {
    db.query(
        'SELECT * FROM bookings WHERE customer_phone = ? ORDER BY created_at DESC',
        [req.params.phone],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// ========== 8. GET WORKER BOOKINGS ==========
app.get('/api/bookings/worker/:workerId', (req, res) => {
    const { workerId } = req.params;
    db.query(
        'SELECT * FROM bookings WHERE worker_id = ? OR status = "pending" ORDER BY created_at DESC',
        [workerId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// ========== 9. UPDATE BOOKING STATUS ==========
app.put('/api/bookings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, workerId } = req.body;
    
    let query = 'UPDATE bookings SET status = ?';
    const values = [status];

    if (workerId) {
        query += ', worker_id = ?';
        values.push(workerId);
    }

    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ========== 10. ADD RATING ==========
app.put('/api/bookings/:id/rating', (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    db.query(
        'UPDATE bookings SET rating = ? WHERE id = ?',
        [rating, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Rating saved!' });
        }
    );
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});