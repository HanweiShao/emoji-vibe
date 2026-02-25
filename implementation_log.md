# Emoji Vibe Implementation Log

This document records the iterative development process for the **Emoji Vibe** project, a physics-based "Suika-style" merge game built with React, Tailwind CSS, and Matter.js.

## Overview
The application was built following a strict phase-based approach to ensure stability and core mechanical correctness before adding visual polish and advanced features.

## Phases Executed

### Phase 1: Basic Physics & Dropping
- Scaffolded a single-page React app using Vite.
- Configured a Matter.js physical simulation restricted to a 400x600 responsive canvas.
- Created static, invisible boundaries (Ground, Left Wall, Right Wall) with an open ceiling.
- Implemented a click/touch handler that constraints dropping within the canvas bounds and spawns physical circular bodies dropping from the top.

### Phase 2: Collision & Merge Logic
- Intercepted the `collisionStart` event within Matter.js to handle object combining.
- Implemented strict logic to merge two identical tier emojis.
- Added a `.isMerging` flag on objects inside the callback to prevent the common "double-merge" engine bug where multiple collision pairs process the same bodies simultaneously.
- Hooked device haptic feedback (`window.navigator.vibrate`) to trigger on successful merging.
- Removed collided bodies and dynamically spawned the next-tiered emoji at the collision midpoint.

### Phase 3: Custom Rendering
- Created a custom `afterRender` event hook in Matter.js to override default canvas drawing.
- Scaled up the text size multiplier to `body.circleRadius * 2.1` to ensure emojis filled their physical bounding boxes, creating a tightly packed appearance ("juiciness").
- Implemented visual physical stress shaking for emojis of Tier 4 and higher to provide visual feedback for late-game tension.
- Taught the render loop to correctly translate and rotate relative to the physical object's angle so emojis tumble dynamically as they fall and roll.

### Phase 4: Game Over Condition
- Built a depth-sensor logic pass running on `beforeUpdate`.
- Set a literal "Death Line" (Y-coordinate 120), represented visually as a dashed red line on the canvas.
- Engineered a 3-second survival mechanism: if any emoji comes to a physical rest (`body.speed < 0.5`) *above* the death line for 3 continuous seconds, the physics engine pauses.
- Showcased a full-screen React overlay UI with restarting mechanics that safely clear the active Matter.js world bodies.

### Phase 5: Theme Switcher
- Designed a UI overlay that handles dynamic theme swapping (Dev, Aussie, Property vibes).
- Implemented state-reactive re-rendering where switching themes smoothly transitions Tailwind background colors via `transition-colors`.
- Automatically clears the board on a theme shift to prevent engine conflict between diverse data dictionaries.

### Phase 6: Post-Launch Juice & Polish
- Engineered max-tier object lifecycle logic to purposefully destroy (`Composite.remove`) max-level emojis upon merging.
- Incentivized max-tier clears by awarding a 2x bonus points multiplier.
- Created an array-driven particle system explicitly managed in React `useRef` and drawn atop the raw physics canvas in `afterRender`. On a max-tier merge, 30 physics-lite colorful confetti particles are spawned with simulated gravity and fadeout.

## Final Adjustments
- Rebalanced the size tiers drastically downwards (e.g. maxing out at 95px instead of 145px) so that the largest final tier emojis are physically capable of sitting side-by-side within the 400px width constraint, eliminating late-game softlocks.
