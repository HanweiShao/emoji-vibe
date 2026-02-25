# Emoji Vibe 🎮🍉

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Matter.js](https://img.shields.io/badge/Matter.js-000000?style=for-the-badge)

Emoji Vibe is a fast, physics-based "Suika-style" (Watermelon game) merge puzzle built entirely as a **Vibe Coding** experiment! It was scoped, designed, and interactively built within a conversational AI pairing session. 

Check out the deployed game here:  
👉 **[Play Emoji Vibe Now!](https://hshaoda.github.io/emoji-vibe/)**

---

## 🕹️ How to Play

1. **Drop Emojis:** Click or tap anywhere on the game board to drop the "Next" emoji from the top of the screen.
2. **Merge & Grow:** When two identical emojis collide, they physically merge into the **next tier** emoji, earning you points! 
3. **Survive:** Be careful! Emojis have physical properties and will stack up, bounce, and roll. If the pile reaches the red dotted **Death Line** at the top and rests there for more than 3 seconds, it's Game Over!
4. **Change Your Vibe:** Use the Theme Switcher at the top of the screen to change the active dictionary (e.g. "Dev Vibe", "Aussie Vibe", "Property Vibe"). *Note: Switching themes will reset your current board and score!*

---

## 🛠️ Vibe Coding Project

This project acts as an iterative demonstration of agentic AI capabilities. It was developed exclusively through prompting, following a strict [Implementation Log](implementation_log.md) based on an initial `SPEC.md`. 

### Technical Highlights
- **Single Component Architecture:** The entire meta-game React state and physics engine reside in a highly optimized `App.jsx`.
- **Matter.js Engine:** Real-time 2D rigid body physics (Gravity, Restitution, Friction) handling dynamic circle collisions.
- **Custom Canvas Rendering:** A specialized `afterRender` hook overrides the default Matter.js wireframes, utilizing Canvas API translation and rotation to accurately draw floating emoji text strings perfectly aligned to sliding physical bodies.
- **Haptic Feedback:** Native `window.navigator.vibrate` integration for "juicy", tactile merges.

*(For a deeper dive into the specific codebase, please see the [Technical Documentation](tech_doc.md)).*

---

## 💻 Local Development

If you want to spin the project up locally:

```bash
# Clone the repository
git clone https://github.com/hshaoda/emoji-vibe.git
cd emoji-vibe

# Install dependencies
npm install

# Run the local Vite dev server
npm run dev
```

Then open `http://localhost:5173/` in your browser.
