<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Pinnotes</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .sidebar {
            height: 100%;
            width: 250px;
            position: fixed;
            z-index: 1;
            top: 0;
            left: 0;
            background-color: #111;
            padding-top: 20px;
        }
        .sidebar a {
            padding: 10px 15px;
            text-decoration: none;
            font-size: 18px;
            color: white;
            display: block;
        }
        .sidebar a:hover {
            background-color: #575757;
        }
        .content {
            margin-left: 260px;
            padding: 20px;
        }
        .dropdown-btn {
            cursor: pointer;
            font-size: 18px;
            border: none;
            outline: none;
            color: white;
            background-color: #111;
            padding: 10px 15px;
            width: 100%;
            text-align: left;
        }
        .dropdown-container {
            display: none;
            background-color: #262626;
            padding-left: 8px;
        }
        .dropdown-container a {
            font-size: 16px;
        }
        .note-card {
            border: 1px solid #ccc;
            padding: 15px;
            margin: 10px 0;
            background-color: #fff;
        }
        .note-card h4 {
            margin: 0;
            font-size: 18px;
        }
        .note-card p {
            margin: 5px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="sidebar">
        <a href="#" class="dropdown-btn">Notes Options</a>
        <div class="dropdown-container">
            <a href="#" id="pinNotesBtn">Pin Notes</a>
            <a href="#" id="archiveNotesBtn">Archive Notes</a>
            <a href="#" id="createNewNoteBtn">Create New Note</a>
        </div>
    </div>

    <div class="content">
        <h2>Welcome to Your Dashboard</h2>
        <p>Manage your notes with ease.</p>
        <div id="notesList">
            <!-- Notes will be loaded here -->
        </div>
    </div>

    <!-- Archive password modal -->
    <div id="archiveModal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Enter Password to View Archived Notes</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <input type="password" id="archivePassword" class="form-control" placeholder="Password">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="submitArchivePassword">Submit</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Toggle sidebar dropdown
        document.querySelector('.dropdown-btn').addEventListener('click', function () {
            var dropdownContent = this.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        // Create new note button
        document.getElementById('createNewNoteBtn').addEventListener('click', function() {
            window.location.href = '/newnote';  // Redirect to new note page
        });

        // Archive notes button
        document.getElementById('archiveNotesBtn').addEventListener('click', function() {
            $('#archiveModal').modal('show');  // Show password modal
        });

        // Handle archive password submission
        document.getElementById('submitArchivePassword').addEventListener('click', function() {
            const password = document.getElementById('archivePassword').value;
            const sessionId = localStorage.getItem('sessionId');
            if (password) {
                fetch('/archivenotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Archived notes: ' + JSON.stringify(data.archivedNotes));
                        $('#archiveModal').modal('hide');
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            } else {
                alert('Please enter your password');
            }
        });

        // Fetch non-archived notes and display them
        function fetchNotes() {
            const sessionId = localStorage.getItem('sessionId');
            fetch('/getnotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const notesList = document.getElementById('notesList');
                    notesList.innerHTML = '';  // Clear the list
                    data.notes.forEach(note => {
                        const noteCard = document.createElement('div');
                        noteCard.classList.add('note-card');
                        noteCard.innerHTML = `
                            <h4>${note.title}</h4>
                            <p>${note.desc}</p>
                        `;
                        notesList.appendChild(noteCard);
                    });
                } else {
                    alert('Error fetching notes');
                }
            })
            .catch(error => console.error('Error:', error));
        }

        // Load notes on page load
        fetchNotes();
    </script>

    <!-- Bootstrap JS -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
</body>
</html>
