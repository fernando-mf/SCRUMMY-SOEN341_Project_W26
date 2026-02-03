const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

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