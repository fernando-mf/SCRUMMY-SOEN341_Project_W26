const BASE_URL = "http://localhost:3000/api";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const profileForm = document.getElementById("profile-form");
const searchForm = document.getElementById("search-form");

/* ---------------- OPTIONS ---------------- */

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

/* ---------------- UTILITIES ---------------- */

function setMessage(target, text, type) {
  if (!target) return;

  target.textContent = text || "";
  target.className = "message" + (type ? ` ${type}` : "");

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
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(messageBox, "Passwords do not match.", "error");
      return;
    }

    try {
      const result = await registerRequest(firstName, lastName, email, password);

      if (!result.success) {
        if (result.status === 409) {
          setMessage(messageBox, "This email is already registered.", "error");
          return;
        }
        setMessage(messageBox, "Something went wrong.", "error");
        return;
      }

      setMessage(messageBox, "Account created successfully. Redirecting...", "ok");
      localStorage.setItem("token", result.data.token);

      Array.from(registerForm.elements).forEach((el) => {
        el.disabled = true;
      });

      setTimeout(() => {
        window.location.href = "recipe.html";
      }, 3000);
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

    if (!email) {
      setMessage(messageBox, "Email is required.", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage(messageBox, "Please enter a valid email address.", "error");
      return;
    }

    if (!password) {
      setMessage(messageBox, "Password is required.", "error");
      return;
    }

    try {
      const result = await loginRequest(email, password);

      if (!result.success) {
        if (result.status === 404 || result.status === 401) {
          setMessage(messageBox, "Account not found or wrong password.", "error");
          return;
        }
        setMessage(messageBox, "Something went wrong.", "error");
        return;
      }

      if (result.data && result.data.token) {
        localStorage.setItem("token", result.data.token);
      }
      
      window.location.href = "recipe.html";
    } catch {
      setMessage(messageBox, "Something went wrong.", "error");
    }
  });
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/* ---------------- RECIPES ---------------- */
const recipesPage = document.getElementById("recipes-page");
if (recipesPage) {
  const recipesMessage = document.getElementById("recipes-message");
  const recipesList = document.getElementById("recipes-list");
  const filtersPanel = document.getElementById("recipe-filters");
  const filtersToggle = document.getElementById("filters-toggle");
  const filterMaxTime = document.getElementById("filter-max-time");
  const filterDifficulty = document.getElementById("filter-difficulty");
  const filterMaxCost = document.getElementById("filter-max-cost");
  const filterTag = document.getElementById("filter-tag");
  const filterApplyBtn = document.getElementById("filters-apply");
  const filterResetBtn = document.getElementById("filters-reset");
  const filterInputs = [filterMaxTime, filterDifficulty, filterMaxCost, filterTag].filter(Boolean);

  if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener("click", () => {
      filtersPanel.classList.toggle("hidden");
    });
  }

  if (filterTag && DIET_PREFERENCES && DIET_PREFERENCES.length) {
    DIET_PREFERENCES.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      filterTag.appendChild(option);
    });
  }

  let allRecipes = [];
  let baseMessage = { text: "", type: "" };

  function setBaseMessage(text, type) {
    baseMessage = { text, type };
    setMessage(recipesMessage, text, type);
  }

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  } else {
    const url = new URL(window.location.href);
    const mine = url.searchParams.get("mine") === "1";
    const myRecipesBtn = document.getElementById("my-recipes-btn");
    if (mine && myRecipesBtn) {
      myRecipesBtn.textContent = "All Recipes";
      myRecipesBtn.href = "recipe.html";
    }
    const payload = decodeJwtPayload(token);
    const userId = payload && payload.sub ? Number(payload.sub) : null;

    const ICONS = {
      time: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M12 7v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      `,
      difficulty: `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 20l7-16 7 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M8.5 14h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      `,
    };

    const SAMPLE_RECIPE = {
      id: "sample",
      name: "Roasted Tomato Pasta",
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: "medium",
        cost: 15,
      dietaryTags: ["Vegetarian"],
      ingredients: [
        { name: "Cherry tomatoes", amount: 500, unit: "g" },
        { name: "Pasta", amount: 400, unit: "g" },
        { name: "Garlic", amount: 3, unit: "cloves" },
        { name: "Olive oil", amount: 3, unit: "tbsp" },
      ],
      prepSteps: "Roast tomatoes with garlic and olive oil at 200°C for 15 min.\nCook pasta until al dente, reserve pasta water.\nToss pasta with roasted tomatoes and sauce.\nFinish with basil, parmesan, and lemon zest.",
      imageAlt: "Roasted tomato pasta",
      isSample: true,
    };

    function normalizePrepSteps(prepSteps) {
      if (!prepSteps) return [];
      const lines = prepSteps
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length > 1) return lines;
      if (!lines.length) return [];

      const sentenceParts = lines[0].split(". ").map((part) => part.trim()).filter(Boolean);
      return sentenceParts.length > 1
        ? sentenceParts.map((part) => (part.endsWith(".") ? part : `${part}.`))
        : lines;
    }

    function buildTagPills(tags) {
      if (!tags || !tags.length) {
        return '<span class="tag-pill muted">None</span>';
      }

      return tags
        .map((tag) => `<span class="tag-pill">${tag}</span>`)
        .join("");
    }

    function renderRecipeCard(recipe) {
      const card = document.createElement("article");
      card.className = "recipe-card";
      if (recipe.isSample) {
        card.classList.add("sample");
      }

      const steps = normalizePrepSteps(recipe.prepSteps);
      const stepsMarkup = steps.length
        ? steps.map((step) => `<li>${step}</li>`).join("")
        : "<li>Prep steps coming soon.</li>";

      const ingredientsMarkup = (recipe.ingredients || [])
        .slice(0, 3)
        .map((ing) => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`)
        .join("");
      const moreIngredients = recipe.ingredients && recipe.ingredients.length > 3
        ? `<li class="text-muted">+${recipe.ingredients.length - 3} more</li>`
        : "";

      const costLabel = recipe.cost
        ? `<span class="cost-badge cost-${recipe.cost}">${recipe.cost}</span>`
        : "";

      const difficultyEmoji = {
        easy: "🟢",
        medium: "🟡",
        hard: "🔴",
      }[recipe.difficulty] || "🟡";

      card.innerHTML = `
        <div class="recipe-media">
          <div class="recipe-image" role="img" aria-label="${recipe.imageAlt || recipe.name}">
            Image placeholder
          </div>
          ${recipe.isSample ? '<span class="recipe-badge">Sample</span>' : ""}
        </div>
        <div class="recipe-body">
          <div class="recipe-header">
            <h3>${recipe.name}</h3>
          </div>
          <div class="recipe-meta-row">
            <span class="recipe-meta-item">
              <span>🕒</span>
              <span>${recipe.prepTimeMinutes} min prep</span>
            </span>
            ${recipe.cookTimeMinutes ? `
            <span class="recipe-meta-item">
              <span>🍳</span>
              <span>${recipe.cookTimeMinutes} min cook</span>
            </span>
            ` : ""}
            <span class="recipe-meta-item">
              <span>${difficultyEmoji}</span>
              <span class="text-capitalize">${recipe.difficulty}</span>
            </span>
            ${recipe.servings ? `<span class="recipe-meta-item"><span>${recipe.servings} servings</span></span>` : ""}
            ${costLabel}
          </div>
          <div class="recipe-tags">
            ${buildTagPills(recipe.dietaryTags)}
          </div>
          <p class="recipe-hint">Click to expand</p>
          <div class="recipe-details">
            ${ingredientsMarkup || moreIngredients ? `
            <div class="recipe-section">
              <p class="recipe-section-title"><strong>Ingredients</strong></p>
              <ul class="recipe-list">
                ${ingredientsMarkup}
                ${moreIngredients}
              </ul>
            </div>
            ` : ""}
            <div class="recipe-section">
              <p class="recipe-section-title"><strong>Prep Steps</strong></p>
              <ol class="recipe-steps">
                ${stepsMarkup}
              </ol>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        card.classList.toggle("expanded");
      });

      return card;
    }

    function renderRecipesList(list) {
      if (!recipesList) return;

      recipesList.innerHTML = "";
      list.forEach((recipe) => {
        recipesList.appendChild(renderRecipeCard(recipe));
      });
    }

    function renderRecipes(recipes, includeSample) {
      const list = includeSample ? [SAMPLE_RECIPE, ...recipes] : recipes;
      renderRecipesList(list);
    }

    function applyFilters() {
      let filtered = [...allRecipes];

      const maxTimeValue = filterMaxTime && filterMaxTime.value !== ""
        ? Number(filterMaxTime.value)
        : null;
      const maxCostValue = filterMaxCost && filterMaxCost.value !== ""
        ? Number(filterMaxCost.value)
        : null;
      const difficultyValue = filterDifficulty ? filterDifficulty.value.trim().toLowerCase() : "";
      const tagValue = filterTag ? filterTag.value.trim().toLowerCase() : "";

      if (maxTimeValue !== null && !Number.isNaN(maxTimeValue)) {
        filtered = filtered.filter((recipe) => {
          const prepMinutes = Number(recipe.prepTimeMinutes);
          return !Number.isNaN(prepMinutes) && prepMinutes <= maxTimeValue;
        });
      }

      if (maxCostValue !== null && !Number.isNaN(maxCostValue)) {
        filtered = filtered.filter((recipe) => {
          const costValue = Number(recipe.cost);
          return !Number.isNaN(costValue) && costValue <= maxCostValue;
        });
      }

      if (difficultyValue) {
        filtered = filtered.filter((recipe) => {
          return String(recipe.difficulty || "").toLowerCase() === difficultyValue;
        });
      }

      if (tagValue) {
        filtered = filtered.filter((recipe) => {
          const tags = recipe.dietaryTags || [];
          return tags.some((tag) => String(tag).toLowerCase() === tagValue);
        });
      }

      const filtersActive =
        (filterMaxTime && filterMaxTime.value !== "") ||
        (filterMaxCost && filterMaxCost.value !== "") ||
        (filterDifficulty && filterDifficulty.value !== "") ||
        (filterTag && filterTag.value !== "");

      if (filtersActive) {
        setMessage(
          recipesMessage,
          filtered.length ? "" : "No recipes match your filters.",
          "",
        );
      } else {
        setMessage(recipesMessage, baseMessage.text, baseMessage.type);
      }

      renderRecipesList(filtered);
    }

    if (filterApplyBtn) {
      filterApplyBtn.addEventListener("click", applyFilters);
    }

    if (filterResetBtn) {
      filterResetBtn.addEventListener("click", () => {
        if (filterMaxTime) filterMaxTime.value = "";
        if (filterMaxCost) filterMaxCost.value = "";
        if (filterDifficulty) filterDifficulty.value = "";
        if (filterTag) filterTag.value = "";
        applyFilters();
      });
    }

    filterInputs.forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          applyFilters();
        }
      });
    });

    async function loadRecipes() {
      if (!recipesList) return;

      recipesList.innerHTML = "";
      setMessage(recipesMessage, "Loading recipes...", "");

      const requestUrl = new URL(`${BASE_URL}/recipes`);
      if (mine && userId) {
        requestUrl.searchParams.set("authors", String(userId));
      }

      try {
        const response = await fetch(requestUrl.toString(), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          allRecipes = [];
          if (mine) {
            setBaseMessage("Failed to load recipes.", "error");
            renderRecipesList([]);
          } else {
            allRecipes = [SAMPLE_RECIPE];
            setBaseMessage("Showing a sample recipe.", "");
            renderRecipesList(allRecipes);
          }
          return;
        }

        const data = await response.json();
        const recipes = data && data.data ? data.data : [];
        const includeSample = !mine;

        allRecipes = includeSample ? [SAMPLE_RECIPE, ...recipes] : recipes;

        if (!recipes.length && !includeSample) {
          setBaseMessage(
            "You have not created any recipes yet.",
            "",
          );
          renderRecipesList([]);
          return;
        }

        setBaseMessage(recipes.length ? "" : "Showing a sample recipe.", "");
        applyFilters();
      } catch {
        allRecipes = [];
        if (mine) {
          setBaseMessage("Failed to load recipes.", "error");
          renderRecipesList([]);
        } else {
          allRecipes = [SAMPLE_RECIPE];
          setBaseMessage("Showing a sample recipe.", "");
          renderRecipesList(allRecipes);
        }
      }
    }

    loadRecipes();
  }
}

/* ---------------- CREATE RECIPE ---------------- */
const createRecipeForm = document.getElementById("create-recipe-form");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const cancelBtn = document.getElementById("cancel-btn");

if (createRecipeForm) {
  const formMessage = document.getElementById("form-message");
  const ingredientsList = document.getElementById("ingredients-list");
  const stepsList = document.getElementById("steps-list");
  const dietaryTagsOptions = document.getElementById("dietary-tags-options");
  const addIngredientBtn = document.getElementById("add-ingredient-btn");
  const addStepBtn = document.getElementById("add-step-btn");

  let ingredients = [];
  let steps = [];

  // Populate dietary tags
  DIET_PREFERENCES.forEach((preference) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = preference;
    tag.dataset.value = preference;
    tag.addEventListener("click", () => {
      tag.classList.toggle("selected");
    });
    dietaryTagsOptions.appendChild(tag);
  });

  // Add ingredient
  function addIngredient() {
    const nameInput = document.getElementById("ingredient-name");
    const amountInput = document.getElementById("ingredient-amount");
    const unitSelect = document.getElementById("ingredient-unit");

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const unit = unitSelect.value;

    if (!name) {
      setMessage(formMessage, "Please enter ingredient name.", "error");
      nameInput.focus();
      return;
    }

    ingredients.push({ name, amount, unit });
    renderIngredients();

    nameInput.value = "";
    amountInput.value = "";
    unitSelect.value = "g";
    nameInput.focus();
  }

  function renderIngredients() {
    ingredientsList.innerHTML = ingredients
      .map(
        (ing, idx) => `
      <div class="ingredient-item">
        <p class="ingredient-item-text">${ing.amount} ${ing.unit} ${ing.name}</p>
        <button type="button" class="ingredient-remove" data-index="${idx}">Remove</button>
      </div>
    `,
      )
      .join("");

    ingredientsList.querySelectorAll(".ingredient-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = parseInt(btn.dataset.index);
        ingredients.splice(idx, 1);
        renderIngredients();
      });
    });
  }

  // Add step
  function addStep() {
    steps.push("");
    renderSteps();
  }

  function renderSteps() {
    stepsList.innerHTML = steps
      .map(
        (step, idx) => `
      <div class="step-item" draggable="true" data-step-index="${idx}">
        <div class="step-number">${idx + 1}</div>
        <textarea class="step-input" data-index="${idx}" placeholder="Step ${idx + 1}">${step}</textarea>
        <button type="button" class="step-delete" data-index="${idx}">Delete</button>
      </div>
    `,
      )
      .join("");

    // Text input updates
    stepsList.querySelectorAll(".step-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index);
        steps[idx] = e.target.value;
      });
    });

    // Delete buttons
    stepsList.querySelectorAll(".step-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = parseInt(btn.dataset.index);
        steps.splice(idx, 1);
        renderSteps();
      });
    });

    // Drag and drop
    let draggedElement = null;
    stepsList.querySelectorAll(".step-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        draggedElement = item;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      item.addEventListener("dragend", () => {
        draggedElement = null;
        item.classList.remove("dragging");
        stepsList.querySelectorAll(".step-item").forEach((i) => {
          i.classList.remove("drag-over");
        });
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (item !== draggedElement) {
          item.classList.add("drag-over");
        }
      });

      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over");
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedElement && draggedElement !== item) {
          const draggedIndex = parseInt(draggedElement.dataset.stepIndex);
          const targetIndex = parseInt(item.dataset.stepIndex);
          
          // Reorder steps array
          const draggedStep = steps[draggedIndex];
          steps.splice(draggedIndex, 1);
          steps.splice(targetIndex, 0, draggedStep);
          
          renderSteps();
        }
      });
    });
  }

  addIngredientBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addIngredient();
  });

  document.getElementById("ingredient-name").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  });

  addStepBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addStep();
  });

  createRecipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(formMessage, "", "");

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const name = document.getElementById("recipe-name").value.trim();
    const prepTimeMinutes = parseInt(document.getElementById("prep-time").value) || 0;
    const cookTimeMinutes = parseInt(document.getElementById("cook-time").value) || 0;
    const servings = parseInt(document.getElementById("servings").value) || 1;
    const difficulty = document.getElementById("difficulty").value;
    const cost = document.querySelector('input[name="cost"]:checked').value;
    const dietaryTags = Array.from(
      document.querySelectorAll("#dietary-tags-options .tag.selected"),
    ).map((tag) => tag.dataset.value);

    if (!name) {
      setMessage(formMessage, "Please enter recipe name.", "error");
      return;
    }

    if (ingredients.length === 0) {
      setMessage(formMessage, "Please add at least one ingredient.", "error");
      return;
    }

    if (steps.length === 0) {
      setMessage(formMessage, "Please add at least one preparation step.", "error");
      return;
    }

    const prepSteps = steps.join("\n");

    const request = {
      name,
      prepTimeMinutes,
      prepSteps,
      cost: parseInt(
        { budget: 5, moderate: 15, expensive: 25 }[cost],
      ),
      difficulty,
      dietaryTags,
      allergens: [],
      servings,
      ingredients,
    };

    try {
      const response = await fetch(`${BASE_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        setMessage(formMessage, "Failed to create recipe.", "error");
        return;
      }

      setMessage(formMessage, "Recipe created successfully! Redirecting...", "ok");
      setTimeout(() => {
        window.location.href = "recipe.html";
      }, 2000);
    } catch (error) {
      setMessage(formMessage, "Failed to create recipe.", "error");
    }
  });

  // Modal controls
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.style.display = "none";
    }
  }

  function openModal() {
    if (modalOverlay) {
      modalOverlay.style.display = "flex";
    }
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }
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

      if (!firstName) {
        setMessage(messageBox, "First name is required.", "error");
        return;
      }

      if (!lastName) {
        setMessage(messageBox, "Last name is required.", "error");
        return;
      }

      if (selectedDietPreferences.length === 0) {
        setMessage(
          messageBox,
          "Please select at least one diet preference or allergy.",
          "error"
        );
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

/* ---------------- SEARCH ---------------- */

if (searchForm) {
  const messageBox = document.getElementById("search-message");
  const queryInput = document.getElementById("search-query");
  const resultsContainer = document.getElementById("search-results");

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMessage(messageBox, "", "");
    resultsContainer.innerHTML = "";

    const query = queryInput ? queryInput.value.trim() : "";

    if (!query) {
      setMessage(messageBox, "Please enter a recipe name.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/recipes?search=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        setMessage(messageBox, "Failed to search recipes.", "error");
        return;
      }

      const recipes = await response.json();

      if (!recipes || recipes.length === 0) {
        resultsContainer.innerHTML = "<p class='hint'>No recipes found.</p>";
        return;
      }

      recipes.forEach((recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.style.marginBottom = "10px";
        recipeDiv.innerHTML = `<strong>${recipe.name}</strong>`;
        resultsContainer.appendChild(recipeDiv);
      });

    } catch {
      setMessage(messageBox, "Something went wrong.", "error");
    }
  });
}
