// Backend routes for registering and logging in with session management
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let users = [];
let notes = [];
let sessions = {}; // Store session IDs

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  if (users.find(user => user.email === email)) {
    return res.json({ success: false, message: 'User already exists' });
  }
  const newUser = { email, username, password };
  users.push(newUser);

  const sessionId = `${username}-${Date.now()}`; // Generate session ID
  sessions[sessionId] = username; // Store session
  return res.json({ success: true, message: 'User registered', sessionId });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  const sessionId = `${username}-${Date.now()}`; // Generate session ID
  sessions[sessionId] = username; // Store session
  return res.json({ success: true, message: 'Login successful', sessionId });
});

// Ensure you're using session ID for note-related actions
app.post('/addnote', (req, res) => {
  const { sessionId, title, desc } = req.body;
  const username = sessions[sessionId]; // Validate session
  if (!username) {
    return res.json({ success: false, message: 'Unauthorized' });
  }

  if (!title || !desc) {
    return res.json({ success: false, message: 'Title and description required' });
  }

  notes.push({ id: Date.now(), username, title, desc });
  return res.json({ success: true, message: 'Note added' });
});

app.post('/getnotes', (req, res) => {
  const { sessionId } = req.body;
  const username = sessions[sessionId]; // Validate session
  if (!username) {
    return res.json({ success: false, message: 'Unauthorized' });
  }

  const userNotes = notes.filter(note => note.username === username);
  return res.json({ success: true, notes: userNotes });
});

app.listen(PORT, () => {
  console.log(`Server running on http://192.168.0.106:${PORT}`);
});
