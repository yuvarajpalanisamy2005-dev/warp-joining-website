// ================================================================
// API BASE URL
// ================================================================
const API_BASE_URL = 'https://warp-joining-website.vercel.app';

// ================================================================
// 1. CHECK USER EXISTS
// ================================================================
export const checkUser = async (contact) => {
    const res = await fetch(`${API_URL}/users/${contact}`);
    return res.json();
};

// ================================================================
// 2. CREATE USER (Sign Up)
// ================================================================
export const createUser = async (userData) => {
    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return res.json();
};

// ================================================================
// 3. SEND OTP (SMS / Email)
// ================================================================
export const sendOTPviaSMS = async (phone, otp) => {
    const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: phone })
    });
    return res.json();
};

// ================================================================
// 4. VERIFY OTP (Backend-side)
// ================================================================
export const verifyOTP = async (contact, otp) => {
    const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, otp })
    });
    return res.json();
};

// ================================================================
// 5. CREATE BOOKING
// ================================================================
export const createBooking = async (bookingData) => {
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    });
    return res.json();
};

// ================================================================
// 6. GET CUSTOMER BOOKINGS
// ================================================================
export const getCustomerBookings = async (phone) => {
    const res = await fetch(`${API_URL}/bookings/customer/${phone}`);
    return res.json();
};

// ================================================================
// 7. GET WORKER BOOKINGS
// ================================================================
export const getWorkerBookings = async (workerId) => {
    const res = await fetch(`${API_URL}/bookings/worker/${workerId}`);
    return res.json();
};

// ================================================================
// 8. UPDATE BOOKING STATUS
// ================================================================
export const updateBookingStatus = async (id, status, workerId = null) => {
    const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, workerId })
    });
    return res.json();
};

// ================================================================
// 9. GET ALL WORKERS
// ================================================================
export const getWorkers = async () => {
    const res = await fetch(`${API_URL}/workers`);
    return res.json();
};

// ================================================================
// 10. ADD RATING (NEW)
// ================================================================
export const addRating = async (bookingId, rating) => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
    });
    return res.json();
};