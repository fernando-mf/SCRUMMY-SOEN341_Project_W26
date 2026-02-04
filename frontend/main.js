const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const profileForm = document.getElementById("profile-form");

function setMessage(target, text, type) {
  if (!target) {
    return;
  }

  target.textContent = text;
  target.className = "message " + (type || "");
}

if (registerForm) {
  const registerMessage = document.getElementById("message");

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (!email || !password || !confirm) {
      setMessage(registerMessage, "Please fill in all fields.", "error");
      return;
    }

    if (password !== confirm) {
      setMessage(registerMessage, "Passwords do not match.", "error");
      return;
    }

    setMessage(registerMessage, "UI ready. Registration logic will be added in Task 5.", "ok");
  });
}

if (loginForm) {
  const loginMessage = document.getElementById("message");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      setMessage(loginMessage, "Please enter your email and password.", "error");
      return;
    }

    setMessage(loginMessage, "UI ready. Login logic will be added in Task 5.", "ok");
  });
}

if (profileForm) {
  const profileMessage = document.getElementById("message");

  // Load mock user data
  const mockUserData = {
    email: "user@example.com",
    username: "JohnDoe",
    dietPreferences: "Vegetarian, Gluten-free",
    allergies: "Peanuts, Shellfish"
  };

  // Populate form with existing data
  document.getElementById("email").value = mockUserData.email;
  document.getElementById("username").value = mockUserData.username;
  document.getElementById("diet-preferences").value = mockUserData.dietPreferences;
  document.getElementById("allergies").value = mockUserData.allergies;

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const dietPreferences = document.getElementById("diet-preferences").value.trim();
    const allergies = document.getElementById("allergies").value.trim();

    if (!username) {
      setMessage(profileMessage, "Username is required.", "error");
      return;
    }

    if (username.length < 3) {
      setMessage(profileMessage, "Username must be at least 3 characters long.", "error");
      return;
    }

    setMessage(profileMessage, "Profile updated successfully! Backend integration coming soon.", "ok");
  });
}