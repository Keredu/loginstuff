document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('formHeading').innerText = 'Login to your account';
    // Hide register form and show login form
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    // Reset the input fields
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';    
    // Hide both buttons
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('registerButton').style.display = 'none';
});

document.getElementById('registerButton').addEventListener('click', function() {
    document.getElementById('formHeading').innerText = 'Register a new account';
    // Hide login form and show register form
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    // Reset the input fields
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    // Hide both buttons
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('registerButton').style.display = 'none';
});

// For registration
document.getElementById('submitRegister').addEventListener('click', function() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        resetView();  // Call resetView without Promise
        setTimeout(() => {
            alert(data.message);
        }, 100); // Adjust the delay as needed to ensure UI renders
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// For login
document.getElementById('submitLogin').addEventListener('click', function() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        resetView();  // Call resetView without Promise
        setTimeout(() => {
            alert(data.message);
        }, 100); // Adjust the delay as needed to ensure UI renders
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Listen for Enter key press on input fields in both forms
document.getElementById('loginUsername').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click();
    }
});

document.getElementById('loginPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click();
    }
});

document.getElementById('registerUsername').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitRegister').click();
    }
});

document.getElementById('registerPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitRegister').click();
    }
});

function resetView() {
    document.getElementById('formHeading').innerText = '';
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('registerButton').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
}