# Meeting Minutes - Scrummy Team
## Sprint 3 - Meeting 1

**Date:** [2026-03-19]  
**Location:** [IN-PERSON]  
**Meeting Type:** [Update]

---

## Attendees

- Azmi-Salah Bousedra (40316065) - Frontend
- Quoc Thien Minh Tran (40299089) - Frontend
- Tarek Al-Khen (40272705) - Frontend
- Gianluca Marino (40297326) - Backend/Database
- Fernando Mamani (40169982) - Backend/Database

---

## Meeting Agenda

1. Brainstorm unique Sprint 3 feature ideas  
2. Discuss technical stack and implementation feasibility  
3. Define backend route expectations and frontend UI direction  

---

## Discussion Summary

The team reviewed multiple ideas for a unique Sprint 3 feature and aligned on implementing **Fridge Mode**. We discussed how users would input available ingredients and receive either matching saved recipes or generated recipe ideas. The team also reviewed the current project stack and agreed to keep the static frontend + API backend approach for fast integration. Backend expectations were discussed around generation and recipe routes, while frontend discussion focused on a practical UI with ingredient tags, essentials selection, threshold controls, and generated results cards.

---

## Decisions Made

**Frontend / UI Choices**
- Adopt Fridge Mode as the sprint's unique feature entry point.
- Use a dedicated fridge page with ingredient chip input, essentials selector, match threshold, and two actions: find existing matches and generate ideas.
- Keep generated ideas clickable to prefill recipe creation rather than auto-saving immediately.

**Backend Logic / Routes**
- Reuse existing recipe APIs where possible and rely on `/api/recipes/generate` for AI suggestions.
- Ensure generated recipes are treated as drafts first, then persisted only when user confirms creation.
- Keep response validation strict and align route behavior with API docs.

**Stack / Integration**
- Continue with current stack (frontend HTML/CSS/JS + backend Node/TypeScript API) without introducing new framework migration in Sprint 3.
- Prioritize incremental integration to avoid regressions on existing recipe flows.

---

## Next Steps

- Finalize Fridge Mode frontend screens and interactions - Frontend team  
- Implement and verify backend generation route behavior for draft flow - Backend team  
- Integrate end-to-end flow (fridge input -> generation/matching -> create recipe prefill) and validate demo path - All members
