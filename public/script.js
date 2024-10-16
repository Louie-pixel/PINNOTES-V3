document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const profileForm = document.getElementById('profile-form');
    const newNoteBtn = document.getElementById('new-note-btn');
    const noteList = document.getElementById('note-list');
    const sessionId = sessionStorage.getItem('sessionId');

    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem('sessionId', result.sessionId);
                window.location.href = '/dashboard';
            } else {
                alert(result.message);
            }
        });
    }

    // Handle signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                window.location.href = '/login';
            }
        });
    }

    // Load notes
    const loadNotes = async () => {
        const response = await fetch('/getnotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });
        const result = await response.json();
        if (result.success) {
            noteList.innerHTML = result.notes.map(note => `<li>${note.title} <button onclick="deleteNote(${note.id})">Delete</button> <button onclick="archiveNote(${note.id})">Archive</button></li>`).join('');
        } else {
            alert(result.message);
        }
    };

    loadNotes();

    // Handle new note creation
    newNoteBtn.addEventListener('click', async () => {
        const title = prompt('Enter note title:');
        const desc = prompt('Enter note description:');
        if (title && desc) {
            const response = await fetch('/addnote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, desc, sessionId }),
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) loadNotes();
        }
    });

    // Delete note
    window.deleteNote = async (id) => {
        const response = await fetch('/deletenote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, sessionId }),
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) loadNotes();
    };

    // Archive note
    window.archiveNote = async (id) => {
        const response = await fetch('/archivenote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, sessionId }),
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) loadNotes();
    };
});
