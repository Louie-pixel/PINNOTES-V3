const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for users, notes, sessions, and archived notes
let users = [];
let notes = [];
let archivedNotes = [];
let sessions = {}; // Store active sessions by session ID

// Set up multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Function to check if a user is authenticated
const isAuthenticated = (req) => {
    const sessionId = req.body.sessionId || req.query.sessionId; // Get session ID from request body or query parameters
    return sessions[sessionId] !== undefined; // Check if session exists
};

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend (main pages)
app.get('/', (req, res) => {
    res.redirect('/signup'); // Redirect to signup page first
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the dashboard (Protected route)
app.get('/dashboard', (req, res) => {
    const sessionId = req.query.sessionId;
    if (!isAuthenticated(req)) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve the create new note page (Protected route)
app.get('/newnote', (req, res) => {
    const sessionId = req.query.sessionId;
    if (!isAuthenticated(req)) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'newnote.html'));
});

// Signup route
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.json({ success: false, message: 'User already exists' });
    }
    users.push({ name, email, password });
    res.json({ success: true, message: 'Signup successful!' });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        const sessionId = `${Date.now()}-${Math.random()}`;
        sessions[sessionId] = { userId: user.email };
        res.json({ success: true, message: 'Login successful', sessionId });
    } else {
        res.json({ success: false, message: 'Invalid email or password' });
    }
});

// Create new note route
app.post('/addnote', (req, res) => {
    const { title, desc, sessionId } = req.body;
    if (!isAuthenticated(req)) {
        return res.json({ success: false, message: 'Unauthorized' });
    }
    const user = sessions[sessionId].userId;
    notes.push({ title, desc, user });
    res.json({ success: true, message: 'Note added successfully!' });
});

// Fetch notes route
app.post('/getnotes', (req, res) => {
    const { sessionId } = req.body;
    if (!isAuthenticated(req)) {
        return res.json({ success: false, message: 'Unauthorized' });
    }
    const user = sessions[sessionId].userId;
    const userNotes = notes.filter(note => note.user === user);
    res.json({ success: true, notes: userNotes });
});

// Update profile route
app.post('/updateprofile', upload.single('profileImage'), (req, res) => {
    const { name, email, description, contact } = req.body;
    const sessionId = req.headers.sessionid;
    if (!isAuthenticated(req)) {
        return res.json({ success: false, message: 'Unauthorized' });
    }
    // Update user profile logic here
    res.json({ success: true, message: 'Profile updated successfully!' });
});

// Logout route
app.get('/logout', (req, res) => {
    const sessionId = req.query.sessionId;
    delete sessions[sessionId]; // Invalidate session
    res.redirect('/login');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
