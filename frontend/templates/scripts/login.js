// login form

const form = document.querySelector(".login-form"),
  emailField = form.querySelector(".email-field"),
  emailInput = emailField.querySelector(".email"),
  passwordField = form.querySelector(".password-field"),
  passwordInput = passwordField.querySelector(".password");

// for the email validation
function checkEmail() {
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  const emailError = document.getElementById("emailError");

  if (!emailInput.value.match(emailPattern)) {
    emailError.textContent = "Please enter a valid email,";
    emailField.classList.add("invalid");
  } else {
    emailError.textContent = "";
    emailField.classList.remove("invalid");
  }
}

// for the password validation
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
    passwordError.classList.remove("invalid");
  }
}

//hide and show function for password

const eyeIcon = document.getElementById("togglePassword");
eyeIcon.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.replace("bx-hide", "bx-show");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.replace("bx-show", "bx-hide");
  }
});

// form handler submission

form.addEventListener("submit", (e) => {
  console.log("he");
  e.preventDefault();

  checkEmail();
  checkPassword();

  // valiation while Typing in the field
  emailInput.addEventListener("keyup", checkEmail);
  passwordInput.addEventListener("keyup", checkPassword);

  if (
    !emailField.classList.contains("invalid") &&
    !passwordField.classList.contains("invalid")
  ) {
    alert("Login Successfully");
    form.reset();
    passwordInput.type = "password";
    eyeIcon.classList.replace("bx-show", "bx-hide");
  }
});
