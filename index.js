const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for users, notes, and sessions
let users = [];
let notes = [];
let archivedNotes = [];
let sessions = {};  // Store active sessions by session ID

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder
app.use(express.urlencoded({ extended: true }));

// Redirect to signup page by default
app.get('/', (req, res) => {
    res.redirect('/signup.html');
});

// Serve HTML pages
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve newnote.html
app.get('/newnote.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'newnote.html'));
});

// API: Register a user
app.post('/register', (req, res) => {
    const { email, username, password } = req.body;
    if (users.find(user => user.email === email || user.username === username)) {
        return res.json({ success: false, message: 'User already exists' });
    }
    users.push({
        email,
        username,
        password,
        profilePicture: 'default-profile.png',
        description: '',
        contact: '',
    });
    console.log('Current users:', users);  // Log users after registration
    return res.json({ success: true, message: 'User registered' });
});

// API: Login a user
app.post('/login', (req, res) => {
    const { identifier, password } = req.body; // Use identifier to accept both username and email
    console.log('Login attempt:', { identifier, password });  // Log the login attempt

    // Check if user exists based on email or username and validate password
    const user = users.find(user => 
        (user.username === identifier || user.email === identifier) && user.password === password
    );
    
    if (!user) {
        console.log('Invalid credentials:', identifier);  // Log when credentials are invalid
        return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Create a session for the user
    const sessionId = Date.now().toString();
    sessions[sessionId] = { email: user.email, username: user.username };
    console.log('Login successful, session created:', { sessionId, user });

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

    notes.push({ id: Date.now(), email: user.email, title, desc, pinned: false });
    return res.json({ success: true, message: 'Note added' });
});

// API: Get notes for a user (Authenticated route)
app.post('/getnotes', (req, res) => {
    const { sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const userNotes = notes.filter(note => note.email === user.email);
    return res.json({ success: true, notes: userNotes });
});

// API: Pin a note
app.post('/pinnote', (req, res) => {
    const { id, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const noteToPin = notes.find(note => note.id === id && note.email === user.email);
    if (!noteToPin) {
        return res.json({ success: false, message: 'Note not found' });
    }

    // Toggle pin status
    noteToPin.pinned = !noteToPin.pinned;
    return res.json({ success: true, message: noteToPin.pinned ? 'Note pinned' : 'Note unpinned' });
});

// API: Archive a note
app.post('/archivenote', (req, res) => {
    const { id, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const noteToArchive = notes.find(note => note.id === id && note.email === user.email);
    if (!noteToArchive) {
        return res.json({ success: false, message: 'Note not found' });
    }

    archivedNotes.push(noteToArchive);
    notes = notes.filter(note => note.id !== id);
    return res.json({ success: true, message: 'Note archived' });
});

// API: Delete a note
app.post('/deletenote', (req, res) => {
    const { id, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    notes = notes.filter(note => note.id !== id || note.email !== user.email);
    return res.json({ success: true, message: 'Note deleted' });
});

// API: Get archived notes
app.post('/getarchivednotes', (req, res) => {
    const { sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    const userArchivedNotes = archivedNotes.filter(note => note.email === user.email);
    return res.json({ success: true, notes: userArchivedNotes });
});

// API: Update user profile
app.post('/updateprofile', (req, res) => {
    const { username, email, description, contact, sessionId } = req.body;
    const user = sessions[sessionId];

    if (!user) {
        return res.json({ success: false, message: 'Unauthorized. Please log in.' });
    }

    // Update user profile information
    const foundUser = users.find(u => u.email === user.email);
    if (foundUser) {
        foundUser.username = username || foundUser.username;
        foundUser.email = email || foundUser.email;
        foundUser.description = description || foundUser.description;
        foundUser.contact = contact || foundUser.contact;

        return res.json({ success: true, message: 'Profile updated', profile: foundUser });
    }

    return res.json({ success: false, message: 'User not found' });
});

// API: Get user profile
app.post('/profile', (req, res) => {
    const { sessionId } = req.body;
    const userId = sessions[sessionId];
    const user = users.find(u => u.email === userId.email); // Assuming user is stored by email
    if (user) {
        return res.json({
            success: true,
            profile: {
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                description: user.description,
                contact: user.contact,
            }
        });
    }
    res.json({ success: false, message: 'User not found.' });
});

// API: Save a profile picture
app.post('/saveProfilePicture', (req, res) => {
    const { sessionId, pictureUrl } = req.body;
    const userId = sessions[sessionId];
    const user = users.find(u => u.email === userId.email); // Assuming user is stored by email
    if (user) {
        user.profilePicture = pictureUrl; // Update profile picture
        return res.json({ success: true, message: 'Profile picture updated successfully.' });
    }
    res.json({ success: false, message: 'User not found.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://192.168.0.106:${PORT}`);
});
