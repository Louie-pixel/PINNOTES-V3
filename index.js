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

// Serve frontend
app.get('/', (req, res) => {
    res.redirect('/login');  // Redirect to login page
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

// Add the route for new note creation
app.get('/newnote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'newnote.html'));
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
    const { title, desc, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    if (!title || !desc) {
        return res.json({ success: false, message: 'Title and description required' });
    }

    notes.push({ id: Date.now(), email: user.email, title, desc });
    return res.json({ success: true, message: 'Note added successfully' });
});

// API: Edit a note (Authenticated route)
app.post('/editnote', (req, res) => {
    const { id, title, desc, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const note = notes.find(note => note.id === id && note.email === user.email);
    if (!note) {
        return res.json({ success: false, message: 'Note not found' });
    }

    note.title = title;
    note.desc = desc;

    return res.json({ success: true, message: 'Note edited successfully' });
});

// API: Archive a note (Authenticated route)
app.post('/archivenote', (req, res) => {
    const { id, password, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    // Placeholder password check; implement your own password verification logic
    if (password !== 'yourActualPassword') {
        return res.json({ success: false, message: 'Invalid password' });
    }

    const noteIndex = notes.findIndex(note => note.id === id && note.email === user.email);
    if (noteIndex !== -1) {
        const archivedNote = notes[noteIndex];
        notes.splice(noteIndex, 1); // Remove from active notes
        // Optionally store in an archived notes array or object
        // archivedNotes.push(archivedNote);
        return res.json({ success: true, message: 'Note archived successfully' });
    } else {
        return res.json({ success: false, message: 'Note not found' });
    }
});

// API: Pin a note (Authenticated route)
app.post('/pinnote', (req, res) => {
    const { id, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const note = notes.find(note => note.id === id && note.email === user.email);
    if (note) {
        note.pinned = true; // Add a pinned property to the note
        return res.json({ success: true, message: 'Note pinned successfully' });
    } else {
        return res.json({ success: false, message: 'Note not found' });
    }
});

// API: Delete a note (Authenticated route)
app.post('/deletenote', (req, res) => {
    const { id, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    notes = notes.filter(note => note.id !== parseInt(id) || note.email !== user.email);
    return res.json({ success: true, message: 'Note deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
