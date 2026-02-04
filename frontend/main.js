const form = document.getElementById("register-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const messageBox = document.getElementById("form-message");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");

function showError(text){
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
}

function clearError(){
  messageBox.textContent = "";
  messageBox.classList.add("hidden");
}

function isPasswordValid(password){
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

async function registerRequest(firstName, lastName, email, password){
  const response = await fetch("http://localhost:3000/api/register", {
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!firstName || !lastName) {
    showError("Validation error: first and last name are required.");
    return;
  }

  if (!isPasswordValid(password)){
    showError("Validation error: password must be at least 8 characters and include at least 1 letter and 1 number.");
    return;
  }

  if (password !== confirmPassword){
    showError("Validation error: passwords do not match.");
    return;
  }

  try{
    const result = await registerRequest(firstName, lastName, email, password);

    if (!result.success){
      if (result.status === 409 || (result.data && result.data.error === "EXISTS")){
        showError("Existing Account error: this email is already registered.");
        return;
      }

      showError("Something went wrong");
      return;
    }

    alert("Account created.");
    form.reset();

  }catch{
    showError("Something went wrong");
  }
});