const createNoteBtn = document.getElementById('createNoteBtn');
const archiveNotesBtn = document.getElementById('archiveNotesBtn');
const pinNotesBtn = document.getElementById('pinNotesBtn');
const notesList = document.getElementById('notesList');

// Handle create new note
createNoteBtn.addEventListener('click', () => {
    window.open('newnote.html', '_blank');
});

// Get notes from the server
function getNotes() {
    // Use your session ID here
    const sessionId = localStorage.getItem('sessionId');

    fetch('/getnotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            notesList.innerHTML = data.notes.map(note => `
                <div class="note">
                    <h3>${note.title}</h3>
                    <p>${note.desc}</p>
                    <button onclick="deleteNote(${note.id})">Delete</button>
                    <button onclick="archiveNote(${note.id})">Archive</button>
                </div>
            `).join('');
        } else {
            alert(data.message);
        }
    });
}

// Call getNotes when the page loads
getNotes();

// Additional functions for delete and archive
function deleteNote(id) {
    // Use your session ID here
    const sessionId = localStorage.getItem('sessionId');
    
    fetch('/deletenote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sessionId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            getNotes(); // Refresh the notes
        } else {
            alert(data.message);
        }
    });
}

function archiveNote(id) {
    // Use your session ID here
    const sessionId = localStorage.getItem('sessionId');
    
    fetch('/archivenote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sessionId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            getNotes(); // Refresh the notes
        } else {
            alert(data.message);
        }
    });
}
