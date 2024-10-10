const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for users and notes
let users = [];
let notes = [];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Register a user
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(user => user.email === email)) {
    return res.json({ success: false, message: 'User already exists' });
  }
  users.push({ username, email, password });
  return res.json({ success: true, message: 'User registered' });
});

// API: Login a user
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }
  return res.json({ success: true, message: 'Login successful', email: user.email });
});

// API: Add a note
app.post('/addnote', (req, res) => {
  const { email, title, desc } = req.body;
  if (!title || !desc) {
    return res.json({ success: false, message: 'Title and description required' });
  }
  notes.push({ id: Date.now(), email, title, desc });
  return res.json({ success: true, message: 'Note added' });
});

// API: Get notes for a user
app.post('/getnotes', (req, res) => {
  const { email } = req.body;
  const userNotes = notes.filter(note => note.email === email);
  return res.json({ success: true, notes: userNotes });
});

// API: Edit a note
app.post('/editnote', (req, res) => {
  const { id, email, title, desc } = req.body;
  const noteIndex = notes.findIndex(note => note.id === parseInt(id) && note.email === email);
  
  if (noteIndex === -1) {
    return res.json({ success: false, message: 'Note not found' });
  }

  notes[noteIndex].title = title;
  notes[noteIndex].desc = desc;
  
  return res.json({ success: true, message: 'Note updated' });
});

// API: Delete a note
app.post('/deletenote', (req, res) => {
  const { id, email } = req.body;
  notes = notes.filter(note => note.id !== parseInt(id) || note.email !== email);
  return res.json({ success: true, message: 'Note deleted' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://192.168.0.106:${PORT}`);
});
