const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory store for notes (use a database in production)
let notes = [];
let sessionIds = {};

// Function to generate session IDs
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15);
}

// Endpoint to create a new session
app.post('/login', (req, res) => {
    const sessionId = generateSessionId();
    sessionIds[sessionId] = req.body.username; // Store the username with session ID
    res.json({ success: true, sessionId });
});

// Endpoint to add a new note
app.post('/addnote', (req, res) => {
    const { title, desc, sessionId } = req.body;
    if (!title || !desc || !sessionIds[sessionId]) {
        return res.status(400).json({ success: false, message: 'Invalid data or session expired.' });
    }

    const note = { id: notes.length + 1, title, desc, pinned: false, archived: false };
    notes.push(note);
    res.json({ success: true });
});

// Endpoint to get notes for a user
app.post('/getnotes', (req, res) => {
    const { sessionId } = req.body;
    if (!sessionIds[sessionId]) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const userNotes = notes.filter(note => !note.archived); // Get only active notes
    res.json({ success: true, notes: userNotes });
});

// Endpoint to update a note
app.post('/updatenote', (req, res) => {
    const { id, title, desc, sessionId } = req.body;
    if (!title || !desc || !sessionIds[sessionId]) {
        return res.status(400).json({ success: false, message: 'Invalid data or session expired.' });
    }

    const note = notes.find(n => n.id === id);
    if (note) {
        note.title = title;
        note.desc = desc;
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Note not found.' });
    }
});

// Endpoint to archive a note
app.post('/archivenote', (req, res) => {
    const { id, sessionId } = req.body;
    if (!sessionIds[sessionId]) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const note = notes.find(n => n.id === id);
    if (note) {
        note.archived = true;
        res.json({ success: true, message: 'Note archived.' });
    } else {
        res.status(404).json({ success: false, message: 'Note not found.' });
    }
});

// Endpoint to pin a note
app.post('/pinnote', (req, res) => {
    const { id, sessionId } = req.body;
    if (!sessionIds[sessionId]) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const note = notes.find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned; // Toggle pinned status
        res.json({ success: true, message: note.pinned ? 'Note pinned.' : 'Note unpinned.' });
    } else {
        res.status(404).json({ success: false, message: 'Note not found.' });
    }
});

// Endpoint to delete a note
app.post('/deletenote', (req, res) => {
    const { id, sessionId } = req.body;
    if (!sessionIds[sessionId]) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    notes = notes.filter(n => n.id !== id);
    res.json({ success: true, message: 'Note deleted.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
