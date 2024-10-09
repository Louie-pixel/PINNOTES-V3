async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const submitBtn = document.getElementById('submit');
  const notesContainer = document.getElementById('notesContainer');
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.email) {
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    fetchNotes();
  }

  loginBtn.addEventListener('click', async () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    const response = await postData('/login', { email, password });
    if (response.success) {
      alert('Login successful!');
      localStorage.setItem('user', JSON.stringify({ email }));
      location.reload();
    } else {
      alert(response.message);
    }
  });

  signupBtn.addEventListener('click', async () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    const response = await postData('/register', { email, password });
    alert(response.message);
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    location.reload();
  });

  submitBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    const email = JSON.parse(localStorage.getItem('user'))?.email;
    if (!email) {
      alert('Please log in first!');
      return;
    }
    const response = await postData('/addnote', { title, desc, email });
    if (response.success) {
      alert('Note added!');
      fetchNotes();
    }
  });

  async function fetchNotes() {
    const email = JSON.parse(localStorage.getItem('user'))?.email;
    const response = await postData('/getnotes', { email });
    notesContainer.innerHTML = '';
    response.notes.forEach(note => {
      notesContainer.innerHTML += `
        <div class="col-md-4">
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">${note.title}</h5>
              <p class="card-text">${note.desc}</p>
              <button class="btn btn-danger" onclick="deleteNote(${note.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  window.deleteNote = async function(id) {
    const email = JSON.parse(localStorage.getItem('user'))?.email;
    await postData('/deletenote', { id, email });
    fetchNotes();
  }
});
