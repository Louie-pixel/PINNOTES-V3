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
let sessions = {}; // Store active sessions by username

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

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to check if a user is authenticated
const isAuthenticated = (req) => {
  const { sessionId } = req.body;
  return sessions[sessionId];
};

// Serve frontend (main pages)
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

// Serve the profile page
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// API: Register a user
app.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  if (users.find(user => user.email === email || user.username === username)) {
    return res.json({ success: false, message: 'User already exists' });
  }
  users.push({ email, username, password, profileImage: 'default-profile.png' });
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

  notes.push({ id: Date.now(), email: user.email, title, desc, pinned: false });
  return res.json({ success: true, message: 'Note added' });
});

// API: Get notes for a user (Authenticated route)
app.post('/getnotes', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { sessionId } = req.body;
  const user = sessions[sessionId];
  const userNotes = notes.filter(note => note.email === user.email && !archivedNotes.includes(note.id));

  return res.json({ success: true, notes: userNotes });
});

// API: Delete a note (Authenticated route)
app.post('/deletenote', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { id, sessionId } = req.body;
  const user = sessions[sessionId];

  notes = notes.filter(note => note.id !== parseInt(id) || note.email !== user.email);
  return res.json({ success: true, message: 'Note deleted' });
});

// API: Archive a note (Authenticated route)
app.post('/archivenote', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { id, sessionId } = req.body;
  const user = sessions[sessionId];

  if (!notes.find(note => note.id === parseInt(id) && note.email === user.email)) {
    return res.json({ success: false, message: 'Note not found' });
  }

  archivedNotes.push(parseInt(id));
  return res.json({ success: true, message: 'Note archived' });
});

// API: Pin a note (Authenticated route)
app.post('/pinnote', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const { id, sessionId } = req.body;
  const user = sessions[sessionId];

  const note = notes.find(note => note.id === parseInt(id) && note.email === user.email);
  if (note) {
    note.pinned = !note.pinned;
    return res.json({ success: true, message: 'Note pinned/unpinned' });
  } else {
    return res.json({ success: false, message: 'Note not found' });
  }
});

// API: Update Profile (Authenticated route)
app.post('/updateprofile', upload.single('profileImage'), (req, res) => {
  const { name, email, description, contact, sessionId } = req.body;
  const user = sessions[sessionId];

  if (!user) {
    return res.json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  const updatedUser = users.find(u => u.email === user.email);
  if (updatedUser) {
    updatedUser.name = name;
    updatedUser.email = email;
    updatedUser.description = description;
    updatedUser.contact = contact;
    updatedUser.profileImage = req.file ? req.file.filename : updatedUser.profileImage;
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    profileImage: updatedUser.profileImage
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://192.168.0.106:${PORT}`);
});
