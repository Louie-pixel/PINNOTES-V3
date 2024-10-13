const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer'); // For handling file uploads
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for users, notes, sessions, and profiles
let users = [];
let notes = [];
let sessions = {};  // Store active sessions by username
let profiles = {};  // Store user profiles

// Configure storage for profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.username}-${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve profile pictures

// Helper function to check if a user is authenticated
const isAuthenticated = (req) => {
    const { sessionId } = req.body;
    return sessions[sessionId];
};

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// API: Register a user
app.post('/register', (req, res) => {
    const { email, username, password } = req.body;
    if (users.find(user => user.email === email || user.username === username)) {
        return res.json({ success: false, message: 'User already exists' });
    }
    users.push({ email, username, password });
    return res.json({ success: true, message: 'User registered' });
});

// API: Login a user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Create a session for the user
    const sessionId = Date.now().toString();
    sessions[sessionId] = { email: user.email, username: user.username };

    return res.json({ success: true, message: 'Login successful', sessionId });
});

// API: Update User Profile
app.post('/updateProfile', upload.single('profilePicture'), (req, res) => {
    const { sessionId, name, description, contactDetails } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    profiles[user.username] = {
        name,
        description,
        contactDetails,
        profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
    };

    return res.json({ success: true, message: 'Profile updated', profile: profiles[user.username] });
});

// API: Get User Profile
app.post('/getProfile', (req, res) => {
    const { sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const profile = profiles[user.username] || {};
    return res.json({ success: true, profile });
});

// ... (rest of the existing API routes remain unchanged)

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
