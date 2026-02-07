const BASE_URL = "http://localhost:3000/api";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const profileForm = document.getElementById("profile-form");

// Diet preferences and allergies options
const DIET_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Gluten-free",
  "Dairy-free",
  "Low-carb",
  "Mediterranean",
  "Halal",
  "Kosher",
];

const ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Eggs",
  "Soy",
  "Wheat",
  "Gluten",
  "Shellfish",
  "Fish",
  "Sesame",
  "Sulfites",
];

function setMessage(target, text, type) {
  if (!target) return;

  target.textContent = text || "";
  target.className = "message" + (type ? ` ${type}` : "");

  // If your CSS uses .hidden, this makes it work with both styles
  if (!text) target.classList.add("hidden");
  else target.classList.remove("hidden");
}

function isPasswordValid(password) {
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

function createTags(container, options, selectedValues = []) {
  if (!container) return;

  container.innerHTML = "";

  options.forEach((option) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = option;
    tag.dataset.value = option;

    if (selectedValues.includes(option)) {
      tag.classList.add("selected");
    }

    tag.addEventListener("click", () => {
      tag.classList.toggle("selected");
    });

    container.appendChild(tag);
  });
}

function getSelectedTags(container) {
  if (!container) return [];
  const selectedTags = container.querySelectorAll(".tag.selected");
  return Array.from(selectedTags).map((tag) => tag.dataset.value);
}

/* ---------------- REGISTER ---------------- */
async function registerRequest(firstName, lastName, email, password) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return { success: false, status: response.status, data };
  }

  return { success: true, status: response.status, data };
}

if (registerForm) {
  const messageBox = document.getElementById("form-message");

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm-password");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(messageBox, "", "");

    const firstName = firstNameInput ? firstNameInput.value.trim() : "";
    const lastName = lastNameInput ? lastNameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmInput ? confirmInput.value : "";

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setMessage(messageBox, "Please fill in all fields.", "error");
      return;
    }

    if (!isPasswordValid(password)) {
      setMessage(
        messageBox,
        "Password must be at least 8 characters and include at least 1 letter and 1 number.",
        "error",
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(messageBox, "Passwords do not match.", "error");
      return;
    }

    try {
      const result = await registerRequest(
        firstName,
        lastName,
        email,
        password,
      );

      if (!result.success) {
        if (result.status === 409) {
          setMessage(messageBox, "This email is already registered.", "error");
          return;
        }
        setMessage(messageBox, "Something went wrong.", "error");
        return;
      }

      setMessage(messageBox, "Account created successfully.", "ok");
      registerForm.reset();
    } catch {
      setMessage(messageBox, "Something went wrong.", "error");
    }
  });
}

/* ---------------- LOGIN ---------------- */
async function loginRequest(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return { success: false, status: response.status, data };
  }

  return { success: true, status: response.status, data };
}

if (loginForm) {
  const messageBox = document.getElementById("form-message");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(messageBox, "", "");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      setMessage(messageBox, "Please enter your email and password.", "error");
      return;
    }

    try {
      const result = await loginRequest(email, password);

      if (!result.success) {
        if (result.status === 404 || result.status === 401) {
          setMessage(
            messageBox,
            "Account not found or wrong password.",
            "error",
          );
          return;
        }
        setMessage(messageBox, "Something went wrong.", "error");
        return;
      }

      if (result.data && result.data.token) {
        localStorage.setItem("token", result.data.token);
      }
      window.location.href = "profile.html";
    } catch {
      setMessage(messageBox, "Something went wrong.", "error");
    }
  });
}

/* ---------------- PROFILE ---------------- */
if (profileForm) {
  const messageBox = document.getElementById("form-message");
  const dietTagsContainer = document.getElementById("diet-tags");
  const allergyTagsContainer = document.getElementById("allergy-tags");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  } else {
    const emailInput = document.getElementById("email");
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    async function loadProfile() {
      try {
        const response = await fetch(`${BASE_URL}/users`, {
          headers: authHeaders,
        });

        if (!response.ok) {
          setMessage(messageBox, "Failed to load profile.", "error");
          return;
        }

        const user = await response.json();

        if (emailInput) emailInput.value = user.email || "";
        if (firstNameInput) firstNameInput.value = user.firstName || "";
        if (lastNameInput) lastNameInput.value = user.lastName || "";

        createTags(dietTagsContainer, DIET_PREFERENCES, user.dietPreferences || []);
        createTags(allergyTagsContainer, ALLERGIES, user.allergies || []);
      } catch {
        setMessage(messageBox, "Failed to load profile.", "error");
      }
    }

    loadProfile();

    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMessage(messageBox, "", "");

      const firstName = firstNameInput ? firstNameInput.value.trim() : "";
      const lastName = lastNameInput ? lastNameInput.value.trim() : "";
      const selectedDietPreferences = getSelectedTags(dietTagsContainer);
      const selectedAllergies = getSelectedTags(allergyTagsContainer);

      if (!firstName || !lastName) {
        setMessage(messageBox, "First name and last name are required.", "error");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/users`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            firstName,
            lastName,
            dietPreferences: selectedDietPreferences,
            allergies: selectedAllergies,
          }),
        });

        if (!response.ok) {
          setMessage(messageBox, "Failed to update profile.", "error");
          return;
        }

        setMessage(messageBox, "Profile updated successfully.", "ok");
      } catch {
        setMessage(messageBox, "Failed to update profile.", "error");
      }
    });
  }
}
