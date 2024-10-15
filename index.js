const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

let users = [];
let notes = [];
let archivedNotes = [];
let sessions = {};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const isAuthenticated = (req) => {
  const sessionId = req.query.sessionId || req.body.sessionId;
  return sessions[sessionId];
};

app.get('/', (req, res) => {
  res.redirect('/signup'); // First page is signup
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessions[sessionId]) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  if (users.find(user => user.email === email || user.username === username)) {
    return res.json({ success: false, message: 'User already exists' });
  }
  users.push({ email, username, password, profileImage: 'default-profile.png' });
  return res.json({ success: true, message: 'User registered' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }
  const sessionId = Date.now().toString();
  sessions[sessionId] = { email: user.email, username: user.username };
  return res.json({ success: true, message: 'Login successful', sessionId });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://192.168.0.106:${PORT}`);
});
