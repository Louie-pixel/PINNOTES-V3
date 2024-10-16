// script.js

const baseUrl = ''; // Define your base URL if using a different path

// Function to handle user registration
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        window.location.href = '/login';
    }
});

// Function to handle user login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameEmail = document.getElementById('usernameEmail').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usernameEmail, password })
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        window.location.href = `/dashboard?sessionId=${data.sessionId}`;
    }
});

// Function to handle note addition
document.getElementById('newNoteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    const sessionId = new URLSearchParams(window.location.search).get('sessionId');

    const response = await fetch('/addnote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, desc, sessionId })
    });

    const data = await response.json();
    alert(data.message);
    if (data.success) {
        window.location.href = '/dashboard?sessionId=' + sessionId;
    }
});

// Function to load notes in the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    const sessionId = new URLSearchParams(window.location.search).get('sessionId');
    const response = await fetch('/getnotes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
    });

    const data = await response.json();
    if (data.success) {
        const notesContainer = document.getElementById('notesContainer');
        data.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.innerHTML = `<h3>${note.title}</h3><p>${note.desc}</p>`;
            notesContainer.appendChild(noteElement);
        });
    } else {
        alert(data.message);
    }
});
