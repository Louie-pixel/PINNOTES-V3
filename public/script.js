document.addEventListener('DOMContentLoaded', () => {
    const sessionId = localStorage.getItem('sessionId');

    // Function to fetch notes
    const fetchNotes = () => {
        fetch('/getnotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayNotes(data.notes);
            }
        });
    };

    // Function to display notes
    const displayNotes = (notes) => {
        const noteList = document.getElementById('note-list');
        noteList.innerHTML = '';
        notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.desc}</p>
                <button onclick="deleteNote(${note.id})">Delete</button>
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="archiveNote(${note.id})">Archive</button>
            `;
            noteList.appendChild(noteItem);
        });
    };

    // Function to delete a note
    window.deleteNote = (id) => {
        fetch('/deletenote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, sessionId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchNotes();
            }
        });
    };

    // Function to create a new note
    document.getElementById('save-note').onclick = () => {
        const title = document.getElementById('note-title').value;
        const desc = document.getElementById('note-desc').value;

        fetch('/addnote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, desc, sessionId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/dashboard';
            }
        });
    };

    // Fetch notes on load
    fetchNotes();
});
