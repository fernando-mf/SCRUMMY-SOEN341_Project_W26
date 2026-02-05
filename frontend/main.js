const BASE_URL = "http://localhost:3000";
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

function showError(messageBox, text){
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
}

function clearError(messageBox){
  messageBox.textContent = "";
  messageBox.classList.add("hidden");
}

function isPasswordValid(password){
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/* ---------------- REGISTER (US.02) ---------------- */
async function registerRequest(firstName, lastName, email, password){
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password })
  });

  let data = null;
  try{
    data = await response.json();
  }catch{
    data = null;
  }

  if (!response.ok){
    return { success: false, status: response.status, data };
  }

  return { success: true, status: response.status, data };
}

if (registerForm){
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");
  const messageBox = document.getElementById("form-message");
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(messageBox);

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!firstName || !lastName) {
      showError(messageBox, "Validation error: first and last name are required.");
      return;
    }

    if (!isPasswordValid(password)){
      showError(messageBox, "Validation error: password must be at least 8 characters and include at least 1 letter and 1 number.");
      return;
    }

    if (password !== confirmPassword){
      showError(messageBox, "Validation error: passwords do not match.");
      return;
    }

    try{
      const result = await registerRequest(firstName, lastName, email, password);

      if (!result.success){
        if (result.status === 409) {
          showError(messageBox, "Existing Account error: this email is already registered.");
          return;
        }

        showError(messageBox, "Something went wrong");
        return;
      }

      alert("Account created.");
      registerForm.reset();

    }catch{
      showError(messageBox, "Something went wrong");
    }
  });
}

/* ---------------- LOGIN (US.03) Task 11 FE ---------------- */
async function loginRequest(email, password){
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  let data = null;
  try{
    data = await response.json();
  }catch{
    data = null;
  }

  if (!response.ok){
    return { success: false, status: response.status, data };
  }

  return { success: true, status: response.status, data };
}

if (loginForm){
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageBox = document.getElementById("form-message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(messageBox);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password){
      showError(messageBox, "Validation error: email and password are required.");
      return;
    }

    try{
      const result = await loginRequest(email, password);

      if (!result.success){
        if (result.status === 404 || result.status === 401){
          showError(messageBox, "Login Error: account not found.");
          return;
        }

        showError(messageBox, "Something went wrong");
        return;
      }

      window.location.href = "profile.html";

    }catch{
      showError(messageBox, "Something went wrong");
    }
  });
}
