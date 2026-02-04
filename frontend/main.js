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
  "Kosher"
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
  "Sulfites"
];

function setMessage(target, text, type) {
  if (!target) {
    return;
  }

  target.textContent = text;
  target.className = "message " + (type || "");
}

function createTags(container, options, selectedValues = []) {
  container.innerHTML = "";
  
  options.forEach(option => {
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
  const selectedTags = container.querySelectorAll(".tag.selected");
  return Array.from(selectedTags).map(tag => tag.dataset.value);
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
  const dietTagsContainer = document.getElementById("diet-tags");
  const allergyTagsContainer = document.getElementById("allergy-tags");

  // Mock user data with selected preferences
  const mockUserData = {
    email: "user@example.com",
    username: "JohnDoe",
    dietPreferences: ["Vegetarian", "Gluten-free"],
    allergies: ["Peanuts", "Shellfish"]
  };

  // Initialize tags
  createTags(dietTagsContainer, DIET_PREFERENCES, mockUserData.dietPreferences);
  createTags(allergyTagsContainer, ALLERGIES, mockUserData.allergies);

  // Populate form with existing data
  document.getElementById("email").value = mockUserData.email;
  document.getElementById("username").value = mockUserData.username;

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const selectedDietPreferences = getSelectedTags(dietTagsContainer);
    const selectedAllergies = getSelectedTags(allergyTagsContainer);

    if (!username) {
      setMessage(profileMessage, "Username is required.", "error");
      return;
    }

    if (username.length < 3) {
      setMessage(profileMessage, "Username must be at least 3 characters long.", "error");
      return;
    }

    // Log the data that would be sent to backend
    console.log({
      username,
      dietPreferences: selectedDietPreferences,
      allergies: selectedAllergies
    });

    setMessage(profileMessage, "Profile updated successfully! Backend integration coming soon.", "ok");
  });
}