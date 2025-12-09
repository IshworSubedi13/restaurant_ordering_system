// register.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".register-form");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const nameField = nameInput.parentElement;
  const emailField = emailInput.parentElement;
  const passwordField = passwordInput.closest(".password-field");
  const confirmPasswordField = confirmPasswordInput.closest(".password-field");

  // Validating the functions

  function checkName() {
    const nameError = document.getElementById("nameError");
    const value = nameInput.value.trim();

    if (!value) {
      nameError.textContent = "Full name is required.";
      nameField.classList.add("invalid");
    } else {
      nameError.textContent = "";
      nameField.classList.remove("invalid");
    }
  }

  function checkEmail() {
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/i;
    const emailError = document.getElementById("emailError");

    if (!emailInput.value.match(emailPattern)) {
      emailError.textContent = "Please enter a valid email.";
      emailField.classList.add("invalid");
    } else {
      emailError.textContent = "";
      emailField.classList.remove("invalid");
    }
  }

  function checkPassword() {
    const passwordError = document.getElementById("passwordError");
    const passPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordInput.value.match(passPattern)) {
      passwordError.textContent =
        "Password must have 8+ chars, uppercase, lowercase, number & symbol.";
      passwordField.classList.add("invalid");
    } else {
      passwordError.textContent = "";
      passwordField.classList.remove("invalid");
    }
  }

  function checkConfirmPassword() {
    const passwordErrors = document.getElementById("passwordErrors");

    if (!confirmPasswordInput.value) {
      passwordErrors.textContent = "Please confirm your password.";
      confirmPasswordField.classList.add("invalid");
    } else if (confirmPasswordInput.value !== passwordInput.value) {
      passwordErrors.textContent = "Passwords do not match.";
      confirmPasswordField.classList.add("invalid");
    } else {
      passwordErrors.textContent = "";
      confirmPasswordField.classList.remove("invalid");
    }
  }

  // Show and hide

  const eyeIcon = document.getElementById("togglePassword");
  const eyeIcon2 = document.getElementById("togglePasswords");

  if (eyeIcon) {
    eyeIcon.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.replace("bx-hide", "bx-show");
      } else {
        passwordInput.type = "password";
        eyeIcon.classList.replace("bx-show", "bx-hide");
      }
    });
  }

  if (eyeIcon2) {
    eyeIcon2.addEventListener("click", () => {
      if (confirmPasswordInput.type === "password") {
        confirmPasswordInput.type = "text";
        eyeIcon2.classList.replace("bx-hide", "bx-show");
      } else {
        confirmPasswordInput.type = "password";
        eyeIcon2.classList.replace("bx-show", "bx-hide");
      }
    });
  }

  nameInput.addEventListener("keyup", checkName);
  emailInput.addEventListener("keyup", checkEmail);
  passwordInput.addEventListener("keyup", () => {
    checkPassword();
    checkConfirmPassword();
  });
  confirmPasswordInput.addEventListener("keyup", checkConfirmPassword);

  //submit handler

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    checkName();
    checkEmail();
    checkPassword();
    checkConfirmPassword();

    const isValid =
      !nameField.classList.contains("invalid") &&
      !emailField.classList.contains("invalid") &&
      !passwordField.classList.contains("invalid") &&
      !confirmPasswordField.classList.contains("invalid");

    if (isValid) {
      alert("Registered successfully!");

      form.reset();

      // reset password
      passwordInput.type = "password";
      confirmPasswordInput.type = "password";

      if (eyeIcon) eyeIcon.classList.replace("bx-show", "bx-hide");
      if (eyeIcon2) eyeIcon2.classList.replace("bx-show", "bx-hide");
    }
  });
});
