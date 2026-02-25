# Emoji Vibe Technical Documentation

## Architecture & Tech Stack
- **Framework:** React 18 (via Vite)
- **Styling:** Tailwind CSS v3
- **Physics Engine:** Matter.js
- **Pattern:** Single-Component Architecture (`App.jsx`)

## State Management
React's `useState` manages the meta-game loop, ensuring the UI layer strictly follows the physical layer.
- `currentThemeKey`: The active dictionary dictating the falling object arrays.
- `score`: Accumulated integer tracked during merge events.
- `nextEmojiIndex`: Pre-calculated integer determining the tier of the next dropped entity.
- `isGameOver`: Boolean regulating the Game Over overlay and pausing click interactions.
- `runId`: An incrementing integer used to cleanly force a full unmount/remount cycle of the `useEffect` physics engine during a restart.

## Physics Simulation (Matter.js)
The core physical layer runs entirely inside a tracked `useEffect` utilizing `sceneRef` (the DOM container) and `engineRef` (the engine instance memory).

### World Configuration
- `Engine`, `Render`, `Runner`, `Bodies`, `Composite`, and `Events` are imported and initialized on mount.
- **Boundaries:** Static rectangles border the Left, Right, and Bottom.
- **Bodies:** Falling objects are defined as `Bodies.circle` with low friction (`0.1`) and moderate bounciness (`restitution: 0.5`).
- The `Render` module's default wireframes are disabled. Its background is set to transparent to allow React/Tailwind base stylings to show through.

### Merge Engine (`collisionStart`)
When bodies collide, the event loops over all active pairs.
1. Checks if `bodyA.label === bodyB.label` (meaning they are the same tier emoji).
2. **Preventing Double Merges:** It checks and sets a custom `isMerging` flag on both bodies immediately. This prevents a secondary collision tick from accidentally processing the same bodies, resolving standard physics engine multi-merge bugs.
3. If criteria pass, it removes both `bodyA` and `bodyB` via `Composite.remove`. 
4. **Tier Lookup:** If the merged pair is *not* max tier, it looks up the next tier data, calculates the midpoint, and instantly spawns a new upgraded body via `Composite.add`.
5. **Max Tier Clear:** If the merged pair *is* the dictionary's maximum possible tier, it does NOT spawn a new body. Instead, it awards a 2x point bonus and spawns 30 pseudo-physical particle objects for a confetti explosion.

### The Death Line (`beforeUpdate`)
Game Over is tracked functionally every engine tick rather than via fixed sensors.
1. Iterates over all `Matter.Composite.allBodies(world)`.
2. Checks all bodies not labeled 'wall' or flagged as merging.
3. If `body.position.y < 120` **AND** `body.speed < 0.5` (Object is at rest at the top of the container).
4. A Javascript `setTimeout` is booted. If 3 seconds elapse and the condition remains true, the `Runner` is stopped and `setIsGameOver(true)` fires to React. If the object falls back below the threshold, the timeout is cleared.

## Custom Rendering 
Matter.js does not natively render typography, so a highly customized `afterRender` event pipeline was engineered to draw text onto the Canvas API over the invisible physical bodies.

- **Loop:** Triggers after every physics tick, looping every current body.
- **Font Sizing:** Scales dynamically utilizing `context.font = ${body.circleRadius * 2.1}px sans-serif`. The 2.1 modifier creates a visually satisfying squish effect where Emojis appear tightly packed without creating physical engine spacing gaps.
- **Rotational Context:** Utilizes `context.save()`, `context.translate()`, and `context.rotate(body.angle)` to exactly map the text alignment to the invisible physical body's tumbling state before calling `fillText(emoji, 0, yOffset)`.
- **Shake Modifier:** High-tier emojis (index >= 4) calculate an `intensity` variable to create subtle chaotic visual shaking `Math.random() - 0.5` on the X/Y axes, artificially enhancing late-game tension without impacting physical collision geometry.
- **Explosion Particles (`particlesRef`):** In the same pipeline `afterRender` loop, generic Javascript objects representing confetti are extracted from the React `useRef`. They are drawn natively onto the canvas via `context.arc` and sequentially manually calculate their own simulated gravity vectors (`vy += 0.2`) independent of the overarching Matter.js simulation. Once particle alpha fades out, they are garbage collected from the array.
