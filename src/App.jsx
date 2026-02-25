import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const THEMES = {
  dev: {
    name: "Dev Vibe",
    bgClass: "bg-slate-900",
    chain: [
      { emoji: '🐵', size: 16, points: 2 },
      { emoji: '🦍', size: 22, points: 4 },
      { emoji: '🤔', size: 30, points: 8 },
      { emoji: '😑', size: 40, points: 16 },
      { emoji: '😤', size: 50, points: 32 },
      { emoji: '😡', size: 60, points: 64 },
      { emoji: '🤬', size: 70, points: 128 },
      { emoji: '💥', size: 80, points: 256 },
      { emoji: '🌋', size: 95, points: 512 }
    ]
  },
  aussie: {
    name: "Aussie Vibe",
    bgClass: "bg-sky-900",
    chain: [
      { emoji: '🕷️', size: 16, points: 2 },
      { emoji: '🐍', size: 22, points: 4 },
      { emoji: '🐨', size: 30, points: 8 },
      { emoji: '🦘', size: 40, points: 16 },
      { emoji: '🦈', size: 50, points: 32 },
      { emoji: '🐊', size: 60, points: 64 },
      { emoji: '🐋', size: 70, points: 128 },
      { emoji: '🌏', size: 95, points: 256 }
    ]
  },
  property: {
    name: "Property Vibe",
    bgClass: "bg-emerald-900",
    chain: [
      { emoji: '⛺', size: 16, points: 2 },
      { emoji: '🛖', size: 22, points: 4 },
      { emoji: '🏡', size: 30, points: 8 },
      { emoji: '🏠', size: 40, points: 16 },
      { emoji: '🏘️', size: 50, points: 32 },
      { emoji: '🏢', size: 65, points: 64 },
      { emoji: '🏙️', size: 85, points: 128 }
    ]
  }
};

export default function App() {
  const [currentThemeKey, setCurrentThemeKey] = useState('dev');
  const currentTheme = THEMES[currentThemeKey];

  const [score, setScore] = useState(0);
  const [nextEmojiIndex, setNextEmojiIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [runId, setRunId] = useState(0);

  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setRunId(r => r + 1);
    setNextEmojiIndex(Math.floor(Math.random() * 3));
  };

  const changeTheme = (key) => {
    if (key === currentThemeKey) return;
    setCurrentThemeKey(key);
    handleRestart();
  };

  useEffect(() => {
    // Generate an initial index strictly between 0, 1, 2
    setNextEmojiIndex(Math.floor(Math.random() * 3));

    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = 400;
    const height = 600;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent'
      }
    });
    const runner = Runner.create();

    // Create the static walls and floor
    const wallOptions = {
      isStatic: true,
      render: { fillStyle: '#ffffff' },
      label: 'wall'
    };
    // Thickness of 60, offset of 30
    const ground = Bodies.rectangle(width / 2, height + 30, width + 100, 60, wallOptions);
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 2, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    let gameOverTimer = null;

    Events.on(engine, 'beforeUpdate', () => {
      let isOverflowing = false;
      const bodies = Composite.allBodies(engine.world);

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (body.label !== 'wall' && !body.isMerging) {
          // Death line at y=120, object is moving very slowly (resting)
          if (body.position.y < 120 && body.speed < 0.5) {
            isOverflowing = true;
            break;
          }
        }
      }

      if (isOverflowing) {
        if (!gameOverTimer) {
          gameOverTimer = setTimeout(() => {
            setIsGameOver(true);
            Runner.stop(runner); // Stop the physics simulation
          }, 3000);
        }
      } else {
        if (gameOverTimer) {
          clearTimeout(gameOverTimer);
          gameOverTimer = null;
        }
      }
    });

    // Handle Collisions for Merging
    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];

        // STRICT MERGE LOGIC
        if (bodyA.label === bodyB.label && bodyA.label !== 'wall') {
          if (bodyA.isMerging || bodyB.isMerging) continue;

          bodyA.isMerging = true;
          bodyB.isMerging = true;

          const currentTier = currentTheme.chain.findIndex(item => item.emoji === bodyA.label);

          if (currentTier >= 0 && currentTier < currentTheme.chain.length - 1) {
            const nextTierData = currentTheme.chain[currentTier + 1];

            // Score and Device vibration
            setScore(s => s + nextTierData.points);
            if (typeof window.navigator.vibrate === 'function') {
              try { window.navigator.vibrate(50); } catch (e) { /* ignore */ }
            }

            const newX = (bodyA.position.x + bodyB.position.x) / 2;
            const newY = (bodyA.position.y + bodyB.position.y) / 2;

            const newBody = Bodies.circle(newX, newY, nextTierData.size, {
              restitution: 0.5,
              friction: 0.1,
              label: nextTierData.emoji,
              render: {
                fillStyle: 'transparent',
                strokeStyle: 'transparent',
                lineWidth: 0
              }
            });

            Matter.Composite.remove(engine.world, [bodyA, bodyB]);
            Matter.Composite.add(engine.world, newBody);
          }
        }
      }
    });

    Events.on(render, 'afterRender', () => {
      const context = render.context;
      const allBodies = Composite.allBodies(engine.world);

      context.save();

      // Draw Death Line
      context.beginPath();
      context.moveTo(0, 120);
      context.lineTo(400, 120);
      context.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // Tailwind red-500 equivalent
      context.lineWidth = 2;
      context.setLineDash([10, 10]);
      context.stroke();
      context.setLineDash([]);

      for (let i = 0; i < allBodies.length; i++) {
        const body = allBodies[i];
        if (body.label === 'wall') continue;

        const currentTier = currentTheme.chain.findIndex(item => item.emoji === body.label);
        if (currentTier === -1) continue;

        let shakeX = 0;
        let shakeY = 0;

        if (currentTier >= 4) {
          const intensity = (currentTier - 3) * 0.5;
          shakeX = (Math.random() - 0.5) * intensity;
          shakeY = (Math.random() - 0.5) * intensity;
        }

        const fontSize = body.circleRadius * 2.1;
        context.font = `${fontSize}px sans-serif`;
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const yOffset = body.circleRadius * 0.18;

        context.save();
        context.translate(body.position.x + shakeX, body.position.y + shakeY);
        context.rotate(body.angle);

        context.fillText(
          body.label,
          0,
          yOffset
        );

        context.restore();
      }
      context.restore();
    });

    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      if (gameOverTimer) clearTimeout(gameOverTimer);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, [currentTheme, runId]);

  // Click/Tap handler
  const handleDrop = (e) => {
    if (isGameOver || !engineRef.current || !sceneRef.current) return;

    const canvasRef = sceneRef.current.querySelector('canvas');
    if (!canvasRef) return;

    const rect = canvasRef.getBoundingClientRect();

    // Calculate relative x coordinate inside the canvas
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;

    let x = clientX - rect.left;

    const emojiData = currentTheme.chain[nextEmojiIndex];
    const dropRadius = emojiData.size;

    // Constrain drop so it doesn't clip into walls
    const displayWidth = rect.width;
    // Actually the canvas width is usually 400px but scaled to fit, so let's scale X to logical CSS pixels if needed.
    // Matter.js Render will stretch it if we set style implicitly, but we have explicit style width 400px so it's 1:1.
    if (x < dropRadius) x = dropRadius;
    if (x > displayWidth - dropRadius) x = displayWidth - dropRadius;

    // Use ratio to scale if css size is different from 400
    const ratioX = 400 / displayWidth;
    const physicsX = x * ratioX;

    const body = Matter.Bodies.circle(physicsX, 50, dropRadius, {
      restitution: 0.5,
      friction: 0.1,
      label: emojiData.emoji,
      render: {
        fillStyle: 'transparent',
        strokeStyle: 'transparent',
        lineWidth: 0
      }
    });

    Matter.Composite.add(engineRef.current.world, body);

    setNextEmojiIndex(Math.floor(Math.random() * 3));
  };

  const previewData = currentTheme.chain[nextEmojiIndex];

  return (
    <div className={`min-h-[100dvh] w-full ${currentTheme.bgClass} flex flex-col items-center justify-center text-white select-none transition-colors duration-500`}>
      {/* Theme Switcher */}
      <div className="flex gap-2 mb-6">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => changeTheme(key)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentThemeKey === key
              ? 'bg-white text-black shadow-lg scale-105'
              : 'bg-black/30 text-white hover:bg-black/50'
              }`}
          >
            {theme.name}
          </button>
        ))}
      </div>

      <div className="w-full max-w-[400px] flex justify-between items-center mb-4 px-4">
        <div className="text-2xl font-bold bg-black/30 px-4 py-2 rounded-lg">Score: {score}</div>
        <div className="flex flex-col items-center bg-black/30 p-2 rounded-lg w-24 h-24 justify-center">
          <span className="text-xs mb-2 opacity-75 font-semibold">NEXT</span>
          <div className="flex justify-center items-center" style={{ fontSize: previewData ? `${previewData.size * 1.}px` : '30px' }}>
            {previewData ? previewData.emoji : ''}
          </div>
        </div>
      </div>

      {/* Container for physics engine canvas */}
      <div
        className="relative bg-black/20 border-b-8 border-white border-l-8 border-r-8 shadow-2xl touch-none max-w-full cursor-pointer overflow-hidden"
        style={{ width: '400px', height: '600px' }}
      >
        <div ref={sceneRef} onPointerDown={handleDrop} className="w-full h-full" />

        {isGameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white p-8">
            <h2 className="text-4xl font-bold mb-4 text-red-500">GAME OVER</h2>
            <p className="text-xl mb-6 text-gray-200">Final Score: <span className="text-white font-bold">{score}</span></p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold transition-colors cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
