const form = document.getElementById("register-form");
const message = document.getElementById("message");

function setMessage(text, type) {
  message.textContent = text;
  message.className = "message " + (type || "");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;

  if (!email || !password || !confirm) {
    setMessage("Please fill in all fields.", "error");
    return;
  }

  if (password !== confirm) {
    setMessage("Passwords do not match.", "error");
    return;
  }

  setMessage("UI ready. Registration logic will be added in Task 5.", "ok");
});