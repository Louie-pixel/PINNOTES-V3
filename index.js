const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for users, notes, and sessions
let users = [];
let notes = [];
let sessions = {};  // Store active sessions by username

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/newnote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'newnote.html'));
});

app.get('/editnote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'editnote.html'));
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

// API: Add a note (Authenticated route)
app.post('/addnote', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const { title, desc, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!title || !desc) {
        return res.json({ success: false, message: 'Title and description required' });
    }

    notes.push({ id: Date.now(), email: user.email, title, desc, archived: false });
    return res.json({ success: true, message: 'Note added' });
});

// API: Get notes for a user (Authenticated route)
app.post('/getnotes', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const { sessionId } = req.body;
    const user = sessions[sessionId];
    const userNotes = notes.filter(note => note.email === user.email && !note.archived);

    return res.json({ success: true, notes: userNotes });
});

// API: Archive a note
app.post('/archivenote', (req, res) => {
    const { sessionId, noteId } = req.body;
    const user = sessions[sessionId];
    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const note = notes.find(n => n.id === parseInt(noteId) && n.email === user.email);
    if (note) {
        note.archived = true; // Archive the note
        return res.json({ success: true, message: 'Note archived' });
    } else {
        return res.json({ success: false, message: 'Note not found' });
    }
});

// API: Delete a note (Authenticated route)
app.post('/deletenote', (req, res) => {
    const { sessionId, id } = req.body;
    const user = sessions[sessionId];
    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    notes = notes.filter(note => note.id !== parseInt(id) || note.email !== user.email);
    return res.json({ success: true, message: 'Note deleted' });
});

// API: Archive notes (Prompt for password)
app.post('/archivenotes', (req, res) => {
    const { sessionId, password } = req.body;
    const user = sessions[sessionId];
    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    // Simulate password check
    if (password === user.password) {
        const archivedNotes = notes.filter(note => note.email === user.email && note.archived);
        return res.json({ success: true, archivedNotes });
    } else {
        return res.json({ success: false, message: 'Invalid password' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
