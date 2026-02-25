# [META] Project Initialization
- Project Name: Emoji Vibe
- Type: Single-Page Web Application (Mobile-first PWA)
- Framework: React (Single File `App.jsx` preferred for speed)
- Styling: Tailwind CSS
- Physics Engine: Matter.js (Use CDN or npm)

---

# [GAME OVERVIEW & GAMEPLAY]
## Objective
A physics-based "Suika-style" (Watermelon) merge game. The player's goal is to drop emojis into a container, matching identical emojis to merge them into a larger, higher-tier emoji to score points. The ultimate goal is to create the final tier emoji before the container overflows.

## Rules & Mechanics
1. **Dropping:** Player taps/clicks the canvas. The current "Next Emoji" drops from the top of the screen at the pointer's X-coordinate.
2. **Physics:** Emojis are circular physical bodies. They fall, bounce, roll, and stack upon each other using gravity.
3. **Merging:** When two identical emojis collide, they merge into ONE emoji of the next tier at their collision midpoint.
4. **Game Over:** There is an invisible "Death Line" near the top of the container. If emojis stack up and rest above this line for more than 3 seconds, the game ends.
5. **Haptic Feedback (Juice):** Every successful merge MUST trigger a device vibration `window.navigator.vibrate(50)` to provide physical feedback to the player.

---

# [DATA] Theme Dictionaries (Data-Driven Difficulty)
We use different chain lengths to create natural difficulty tiers.

Theme 1: "Dev Vibe" (Hard - 9 Tiers)
- bgClass: "bg-slate-900"
- chain: 🐵(25px, 2pt) > 🦍(35px, 4pt) > 🤔(45px, 8pt) > 😑(55px, 16pt) > 😤(70px, 32pt) > 😡(85px, 64pt) > 🤬(100px, 128pt) > 💥(120px, 256pt) > 🌋(145px, 512pt)

Theme 2: "Aussie Vibe" (Normal - 8 Tiers)
- bgClass: "bg-sky-900"
- chain: 🕷️(25px, 2pt) > 🐍(35px, 4pt) > 🐨(45px, 8pt) > 🦘(55px, 16pt) > 🦈(70px, 32pt) > 🐊(85px, 64pt) > 🐋(100px, 128pt) > 🌏(145px, 256pt)

Theme 3: "Property Vibe" (Easy - 7 Tiers)
- bgClass: "bg-emerald-900"
- chain: ⛺(25px, 2pt) > 🛖(35px, 4pt) > 🏡(45px, 8pt) > 🏠(55px, 16pt) > 🏘️(70px, 32pt) > 🏢(90px, 64pt) > 🏙️(130px, 128pt)

---

# [STATE] React State Variables
- `currentTheme`: String (Key of THEMES).
- `score`: Integer.
- `nextEmojiIndex`: Integer (Randomly 0, 1, or 2 from the current theme).
- `isGameOver`: Boolean.

---

# [ENGINE] Matter.js Configuration
- Canvas Size: Responsive, max-width 400px, height approx 600px.
- Boundaries: Static rectangles for Ground, Left Wall, Right Wall. Top is OPEN.
- Body Properties (Emojis): shape = Circle, restitution = 0.5, friction = 0.1.

---

# [IMPLEMENTATION PHASES]
Please build the game strictly following these phases. Complete one phase before moving to the next.

## Phase 1: Basic Physics & Dropping
- Set up React state and the Matter.js engine/render inside a `useEffect`.
- Create the static walls and floor.
- Implement the click/tap handler to drop a basic circle (no text yet) from the top.

## Phase 2: Collision & Merge Logic (CRITICAL)
- Implement `Matter.Events.on('collisionStart')`.
- Add score calculation and `window.navigator.vibrate(50)` on merge.
- STRICT MERGE LOGIC to prevent the "1+1=4 double-merge" bug:
  - FOR EACH pair IN pairs:
    - Let A = pair.bodyA, B = pair.bodyB
    - IF A.label == B.label AND A.label != 'wall' THEN
      - IF A.isMerging OR B.isMerging THEN Continue (Skip to next pair)
      - SET A.isMerging = true, B.isMerging = true
      - Let currentTier = findIndex(A.label)
      - IF currentTier < currentTheme.chain.length - 1 THEN
        - Let nextTierData = currentTheme.chain[currentTier + 1]
        - ACTION: `Composite.remove(world, [A, B])`
        - ACTION: Spawn nextTierData at `((A.x + B.x)/2, (A.y + B.y)/2)`

## Phase 3: Custom Rendering
- Implement the `afterRender` hook to draw the actual Emojis (text) over the physics bodies based on the data provided in `[DATA]`.

# [RENDER] Canvas Text Override (CRITICAL)
Matter.js does NOT render emoji text natively. You MUST use the `afterRender` event.
- Hook: `Matter.Events.on(render, 'afterRender', function() { ... })`
- Loop through `Matter.Composite.allBodies(world)`.
- VISUAL SHAKE EFFECT (Juiciness):
  - Let currentTier = findIndex(body.label in currentTheme.chain)
  - Let shakeX = 0, shakeY = 0
  - IF currentTier >= 4 THEN (Apply stress shake for high-tier emojis)
    - Let intensity = (currentTier - 3) * 0.5
    - shakeX = (Math.random() - 0.5) * intensity
    - shakeY = (Math.random() - 0.5) * intensity
- Use `context.fillText(body.label, body.position.x + shakeX, body.position.y + shakeY)` 
- Font setting: `font = (body.circleRadius * 1.5) + "px Arial"`.


## Phase 4: Game Over Condition
- Add a sensor body or Y-coordinate check near the top.
- If bodies rest above this line for 3 seconds, set `isGameOver = true` and stop the engine.
- Build a simple "Game Over / Restart" UI overlay.

## Phase 5: Theme Switcher
- Add a UI button group to switch between Dev, Aussie, and Property themes.
- When clicked, clear the Matter.js world (`World.clear(world, false)`), reset score, and change the background color.