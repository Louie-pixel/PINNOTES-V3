document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // Ensure this matches the ID in login.html

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                // Store session ID in local storage
                localStorage.setItem('sessionId', result.sessionId);
                // Redirect to dashboard
                window.location.href = `/dashboard?sessionId=${result.sessionId}`;
            } else {
                alert(result.message); // Show error message
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
