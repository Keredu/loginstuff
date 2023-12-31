document.getElementById('loginButton').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
});

document.getElementById('registerButton').addEventListener('click', function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

// For registration
document.getElementById('submitRegister').addEventListener('click', function() {
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;

    document.getElementById('registerForm').style.display = 'none';
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// For login
document.getElementById('submitLogin').addEventListener('click', function() {
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginForm').style.display = 'none';
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        })
    .catch(error => {
        console.error('Error:', error);
    });
});


// Listen for Enter key press on input fields in both forms
document.getElementById('loginName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click();
    }
});

document.getElementById('loginPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click();
    }
});

document.getElementById('registerName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitRegister').click();
    }
});

document.getElementById('registerPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitRegister').click();
    }
});




