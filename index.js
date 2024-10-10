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

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// API: Register a user (username, email, and password)
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (users.find(user => user.email === email || user.username === username)) {
    return res.json({ success: false, message: 'User already exists' });
  }

  users.push({ username, email, password });
  return res.json({ success: true, message: 'User registered' });
});

// API: Login a user (using either username or email)
app.post('/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const user = users.find(
    user => (user.username === usernameOrEmail || user.email === usernameOrEmail) && user.password === password
  );

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

// API: Delete a note
app.post('/deletenote', (req, res) => {
  const { id, email } = req.body;
  notes = notes.filter(note => note.id !== parseInt(id) || note.email !== email);
  return res.json({ success: true, message: 'Note deleted' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});