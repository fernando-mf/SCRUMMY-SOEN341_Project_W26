const form = document.getElementById("register-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const messageBox = document.getElementById("form-message");

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

async function mockRegister(email){
  const existingEmails = [
    "test@test.com",
    "existing@mealmajor.com"
  ];

  if (existingEmails.includes(email.toLowerCase())){
    return { success: false, error: "EXISTS" };
  }

  return { success: true };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!isPasswordValid(password)){
    showError("Validation error: password must be at least 8 characters and include at least 1 letter and 1 number.");
    return;
  }

  if (password !== confirmPassword){
    showError("Validation error: passwords do not match.");
    return;
  }

  try{
    const result = await mockRegister(email);

    if (!result.success && result.error === "EXISTS"){
      showError("Existing Account error: this email is already registered.");
      return;
    }

    if (!result.success){
      showError("Generic error: something went wrong.");
      return;
    }

    alert("Account created (mock).");
    form.reset();

  }catch{
    showError("Something went wrong");
  }
});