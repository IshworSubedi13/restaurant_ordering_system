document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    let isValid = true;
    document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');
    document.querySelectorAll('.form-control').forEach(input => input.classList.remove('error'));
    if (name.value.trim().length < 2) {
        document.getElementById('nameError').style.display = 'block';
        name.classList.add('error');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        document.getElementById('emailError').style.display = 'block';
        email.classList.add('error');
        isValid = false;
    }
    if (password.value.length < 8) {
        document.getElementById('passwordError').style.display = 'block';
        password.classList.add('error');
        isValid = false;
    }
    if (password.value !== confirmPassword.value) {
        document.getElementById('confirmError').style.display = 'block';
        confirmPassword.classList.add('error');
        isValid = false;
    }
    if (!terms.checked) {
        alert('Please accept the Terms of Service and Privacy Policy');
        isValid = false;
    }
    if (isValid) {
        const payload = {
            name: name.value.trim(),
            email: email.value.trim(),
            password: password.value,
            role: "user"
        };

        try {
            const response = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.status === 201) {
                alert("Registration successful! You can now log in.");
                this.reset();
                document.getElementById('passwordStrength').style.width = '0%';
                window.location.href = "/admin/login";
            } else {
                alert(result.error || "Registration failed.");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please try again.");
        }
    }
});
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
});

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