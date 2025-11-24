document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    let isValid = true;
// Reset errors
    document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');
    document.querySelectorAll('.form-control').forEach(input => input.classList.remove('error'));
// Validate name
    if (name.value.trim().length < 2) {
        document.getElementById('nameError').style.display = 'block';
        name.classList.add('error');
        isValid = false;
    }

// Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        document.getElementById('emailError').style.display = 'block';
        email.classList.add('error');
        isValid = false;
    }
// Validate password
    if (password.value.length < 8) {
        document.getElementById('passwordError').style.display = 'block';
        password.classList.add('error');
        isValid = false;
    }
// Validate confirm password
    if (password.value !== confirmPassword.value) {
        document.getElementById('confirmError').style.display = 'block';
        confirmPassword.classList.add('error');
        isValid = false;
    }
// Validate terms
    if (!terms.checked) {
        alert('Please accept the Terms of Service and Privacy Policy');
        isValid = false;
    }
    if (isValid) {
// Simulate registration success
        alert('Registration successful! Welcome to our community.');
        this.reset();
        document.getElementById('passwordStrength').style.width = '0%';
    }
});
// Password toggle functionality
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
});
// Password strength indicator
document.getElementById('password').addEventListener('input', function () {
    const password = this.value;

    const strengthBar = document.getElementById('passwordStrength');
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    strengthBar.style.width = strength + '%';
    if (strength < 50) {
        strengthBar.className = 'password-strength-bar';
    } else if (strength < 75) {
        strengthBar.className = 'password-strength-bar medium';
    } else {
        strengthBar.className = 'password-strength-bar strong';
    }
});