# Party-Hub: AI Assistant Guidelines (GEMINI.md)

Welcome! If you are an AI model working on this project, please adhere to the following guidelines and project overview to ensure a consistent, high-quality development process.

## 🎯 Project Overview
**Party-Hub** is a web application built with:
- **Frontend Framework:** React + TypeScript + Vite
- **Routing:** React Router DOM
- **UI/UX & Animations:** Vanilla CSS, Framer Motion, Lucide React (Icons)
- **Database / Backend:** Firebase (Firestore / Realtime Database)
- **Features:** The project includes functionality related to party games (see `src/games/`), data processing/scraping scripts for footballers (e.g., `scrape_all_footballers.cjs`), and QR code integration (`qrcode.react`), likely for local multi-device party interactions.

## 📐 Core Development Principles

1. **Clear Scope per Implementation:** 
   The main scope of the web application must remain clear for every feature request. Always understand the end goal and context before writing code.

2. **Simplicity and Scalability:**
   Keep the codebase simple and scalable. Avoid over-engineering solutions.

3. **Code Reusability:**
   Favor code reuse across all parts of the web app. Extract recurring logic into custom hooks (e.g., in `src/hooks/`) and reusable UI elements into shared components (e.g., in `src/components/`).

4. **UI/UX Excellence:**
   The graphics, UI, and UX must ALWAYS be coherent and visually beautiful. **It must not look like a cheap "toy" app put together for fun.** It must be well-curated, polished, premium, and professional. Make good use of modern design principles, consistent color palettes, and smooth animations.

5. **Database Optimization (Firestore):**
   The Firestore / Realtime Database architecture must be strictly optimized to avoid wasting space. Consider data size, efficient data structures, and storage limits for every single backend implementation.

6. **Deployment & Version Control:**
   All changes must be pushed to GitHub. The repository is/will be connected to Vercel for continuous deployment.
   - **GitHub Repository:** [Insert GitHub Repository Link Here]

---
*Remember: Always refer back to these principles when proposing architectural changes, UI modifications, or adding new features.*
