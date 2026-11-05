'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Tree {
  z: number;
  side: -1 | 1;
  offset: number;
  heightScale: number;
}

interface Deer {
  active: boolean;
  z: number;
  x: number; // -1.5 (left forest) to 1.5 (right forest), road is -0.85 to 0.85
  dir: -1 | 1;
  speed: number;
  legPhase: number;
}

export default function ForestDeerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [deathReason, setDeathReason] = useState<string>('');
  const [speedKmh, setSpeedKmh] = useState<number>(0);

  // Use refs for real-time game loop state
  const stateRef = useRef({
    status: 'START' as 'START' | 'PLAYING' | 'GAMEOVER',
    playerX: 0, // -1 to 1 is the road width
    speed: 0,
    maxSpeed: 0.45,
    distance: 0,
    wheelAngle: 0,
    keys: { w: false, a: false, s: false, d: false },
    trees: [] as Tree[],
    deer: {
      active: false,
      z: 30,
      x: -1.5,
      dir: 1 as -1 | 1,
      speed: 0.022,
      legPhase: 0,
    } as Deer,
    nextDeerDistance: 120,
  });

  const initGame = () => {
    const trees: Tree[] = [];
    for (let i = 1; i <= 40; i++) {
      trees.push({
        z: i * 1.2,
        side: -1,
        offset: 1.05 + Math.random() * 0.9,
        heightScale: 0.85 + Math.random() * 0.4,
      });
      trees.push({
        z: i * 1.2 + 0.6,
        side: 1,
        offset: 1.05 + Math.random() * 0.9,
        heightScale: 0.85 + Math.random() * 0.4,
      });
    }

    stateRef.current = {
      status: 'PLAYING',
      playerX: 0,
      speed: 0.1,
      maxSpeed: 0.48,
      distance: 0,
      wheelAngle: 0,
      keys: { w: false, a: false, s: false, d: false },
      trees,
      deer: {
        active: false,
        z: 35,
        x: -1.6,
        dir: 1,
        speed: 0.022,
        legPhase: 0,
      },
      nextDeerDistance: 80 + Math.random() * 90,
    };

    setScore(0);
    setSpeedKmh(25);
    setDeathReason('');
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) {
        e.preventDefault();
      }
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      const st = stateRef.current;
      if (st.status !== 'PLAYING') return;

      // Controls: W = forward, S = stop/brake, A = left, D = right
      if (st.keys.s) {
        st.speed = Math.max(0, st.speed - 0.016);
      } else if (st.keys.w) {
        st.speed = Math.min(st.maxSpeed, st.speed + 0.005);
      } else {
        st.speed = Math.max(0, st.speed - 0.0025);
      }

      // Steering
      const steerFactor = st.speed > 0.01 ? 0.022 * Math.min(1, st.speed / 0.15) : 0;
      if (st.keys.a) {
        st.playerX -= steerFactor;
        st.wheelAngle = Math.max(-0.65, st.wheelAngle - 0.08);
      } else if (st.keys.d) {
        st.playerX += steerFactor;
        st.wheelAngle = Math.min(0.65, st.wheelAngle + 0.08);
      } else {
        st.wheelAngle *= 0.82;
      }

      st.distance += st.speed;
      const currentMeters = Math.floor(st.distance * 2.5);
      setScore(currentMeters);
      setSpeedKmh(Math.round((st.speed / st.maxSpeed) * 140));

      // Check off-road tree crash (narrow forest road!)
      if (Math.abs(st.playerX) > 0.92) {
        st.status = 'GAMEOVER';
        setDeathReason('You veered off the narrow road and crashed into the forest trees!');
        setGameState('GAMEOVER');
        setHighScore((prev) => Math.max(prev, currentMeters));
        return;
      }

      // Update trees
      for (const t of st.trees) {
        t.z -= st.speed;
        if (t.z < 0.5) {
          t.z += 48;
          t.offset = 1.05 + Math.random() * 0.9;
        }
      }

      // Spawn deer at random moments
      if (!st.deer.active && st.distance >= st.nextDeerDistance) {
        const dir: -1 | 1 = Math.random() < 0.5 ? 1 : -1;
        st.deer = {
          active: true,
          z: 34 + Math.random() * 8,
          x: dir === 1 ? -1.45 : 1.45,
          dir,
          speed: 0.015 + Math.random() * 0.014,
          legPhase: 0,
        };
      }

      // Update active deer
      if (st.deer.active) {
        st.deer.z -= st.speed;
        st.deer.x += st.deer.dir * st.deer.speed;
        st.deer.legPhase += 0.28;

        // Check collision when deer is right in front of the car hood
        if (st.deer.z < 3.6 && st.deer.z > 0.8) {
          const hitThreshold = 0.42;
          if (Math.abs(st.deer.x - st.playerX) < hitThreshold && st.speed > 0.01) {
            st.status = 'GAMEOVER';
            setDeathReason('A deer jumped in front of your car and you hit it!');
            setGameState('GAMEOVER');
            setHighScore((prev) => Math.max(prev, currentMeters));
            return;
          }
        }

        // Despawn deer once passed or crossed completely into the opposite woods
        if (st.deer.z < 0.4 || Math.abs(st.deer.x) > 1.75) {
          st.deer.active = false;
          st.nextDeerDistance = st.distance + 65 + Math.random() * 110;
        }
      }
    };

    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const st = stateRef.current;
      const horizonY = height * 0.42;
      const centerX = width * 0.5;
      const cameraShiftX = st.playerX * width * 0.36;

      // 1. Night/Dusk Forest Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#0b132b');
      skyGrad.addColorStop(1, '#1c2541');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant treeline silhouette
      ctx.fillStyle = '#0a1912';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 25) {
        const peak = horizonY - 18 - Math.sin(x * 0.05) * 8 - Math.cos(x * 0.13) * 6;
        ctx.lineTo(x, peak);
      }
      ctx.lineTo(width, horizonY);
      ctx.fill();

      // 2. Forest Ground
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, '#0f2419');
      groundGrad.addColorStop(1, '#193827');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 3. Narrow Forest Road (Perspective Polygon)
      const roadTopWidth = 22;
      const roadBottomWidth = width * 0.82;
      const roadTopX = centerX - st.playerX * 15;
      const roadBottomX = centerX - cameraShiftX;

      // Dirt shoulder
      ctx.fillStyle = '#3d3124';
      ctx.beginPath();
      ctx.moveTo(roadTopX - roadTopWidth * 0.7, horizonY);
      ctx.lineTo(roadTopX + roadTopWidth * 0.7, horizonY);
      ctx.lineTo(roadBottomX + roadBottomWidth * 0.58, height);
      ctx.lineTo(roadBottomX - roadBottomWidth * 0.58, height);
      ctx.closePath();
      ctx.fill();

      // Asphalt surface
      ctx.fillStyle = '#2b2d38';
      ctx.beginPath();
      ctx.moveTo(roadTopX - roadTopWidth * 0.5, horizonY);
      ctx.lineTo(roadTopX + roadTopWidth * 0.5, horizonY);
      ctx.lineTo(roadBottomX + roadBottomWidth * 0.5, height);
      ctx.lineTo(roadBottomX - roadBottomWidth * 0.5, height);
      ctx.closePath();
      ctx.fill();

      // Headlight beam glow on road
      const beamGrad = ctx.createRadialGradient(
        centerX,
        height * 0.82,
        20,
        centerX,
        height * 0.65,
        width * 0.45
      );
      beamGrad.addColorStop(0, 'rgba(255, 250, 210, 0.22)');
      beamGrad.addColorStop(1, 'rgba(255, 250, 210, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Moving Center Dashed Line
      ctx.strokeStyle = '#d4a359';
      ctx.lineCap = 'butt';
      const stripeCount = 16;
      const offsetPhase = (st.distance * 1.5) % 1;
      for (let i = 0; i < stripeCount; i++) {
        const z1 = (i + offsetPhase) * 2.5 + 1;
        const z2 = z1 + 1.1;
        const p1 = 1 / z1;
        const p2 = 1 / z2;

        const y1 = horizonY + (height - horizonY) * Math.min(1, p1 * 1.6);
        const y2 = horizonY + (height - horizonY) * Math.min(1, p2 * 1.6);
        const x1 = roadTopX + (roadBottomX - roadTopX) * Math.min(1, p1 * 1.6);
        const x2 = roadTopX + (roadBottomX - roadTopX) * Math.min(1, p2 * 1.6);

        ctx.lineWidth = Math.max(1.5, 9 * p1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 4. Sort and Draw 2D Sprites (Trees & Deer) Back-to-Front
      const sortedTrees = [...st.trees].sort((a, b) => b.z - a.z);

      const drawTree = (t: Tree) => {
        const p = 1.6 / t.z;
        if (p <= 0 || p > 2.2) return;

        const screenY = horizonY + (height - horizonY) * p;
        const roadCenterAtZ = roadTopX + (roadBottomX - roadTopX) * p;
        const roadHalfWidthAtZ = (roadTopWidth * 0.5) + (roadBottomWidth * 0.5 - roadTopWidth * 0.5) * p;
        const screenX = roadCenterAtZ + t.side * roadHalfWidthAtZ * t.offset;

        const treeW = 95 * p * t.heightScale;
        const treeH = 260 * p * t.heightScale;

        // Trunk
        ctx.fillStyle = '#3b2314';
        ctx.fillRect(screenX - treeW * 0.1, screenY - treeH * 0.22, treeW * 0.2, treeH * 0.22);

        // Pine layers
        const layers = 3;
        for (let l = 0; l < layers; l++) {
          const layerBottom = screenY - treeH * (0.18 + l * 0.22);
          const layerTop = screenY - treeH * (0.55 + l * 0.22);
          const layerHalfW = treeW * (0.55 - l * 0.11);

          ctx.fillStyle = l % 2 === 0 ? '#133824' : '#1b472f';
          ctx.beginPath();
          ctx.moveTo(screenX - layerHalfW, layerBottom);
          ctx.lineTo(screenX + layerHalfW, layerBottom);
          ctx.lineTo(screenX, layerTop);
          ctx.closePath();
          ctx.fill();
        }
      };

      const drawDeer = (d: Deer) => {
        const p = 1.6 / d.z;
        if (p <= 0 || p > 2.5) return;

        const screenY = horizonY + (height - horizonY) * p;
        const roadCenterAtZ = roadTopX + (roadBottomX - roadTopX) * p;
        const roadHalfWidthAtZ = (roadTopWidth * 0.5) + (roadBottomWidth * 0.5 - roadTopWidth * 0.5) * p;
        const screenX = roadCenterAtZ + d.x * roadHalfWidthAtZ;

        const scale = p * 1.15;
        const bodyW = 68 * scale;
        const bodyH = 32 * scale;
        const legH = 34 * scale;

        ctx.save();
        ctx.translate(screenX, screenY);
        if (d.dir === -1) ctx.scale(-1, 1);

        const swing = Math.sin(d.legPhase) * 8 * scale;

        // Legs
        ctx.strokeStyle = '#6e4223';
        ctx.lineWidth = Math.max(2, 5 * scale);
        ctx.beginPath();
        ctx.moveTo(-bodyW * 0.35, -legH);
        ctx.lineTo(-bodyW * 0.35 + swing, 0);
        ctx.moveTo(-bodyW * 0.2, -legH);
        ctx.lineTo(-bodyW * 0.2 - swing, 0);
        ctx.moveTo(bodyW * 0.3, -legH);
        ctx.lineTo(bodyW * 0.3 - swing, 0);
        ctx.moveTo(bodyW * 0.42, -legH);
        ctx.lineTo(bodyW * 0.42 + swing, 0);
        ctx.stroke();

        // Body
        ctx.fillStyle = '#9c5f34';
        ctx.beginPath();
        ctx.roundRect(-bodyW * 0.5, -legH - bodyH * 0.85, bodyW, bodyH, 8 * scale);
        ctx.fill();

        // White tail
        ctx.fillStyle = '#f4f1ea';
        ctx.beginPath();
        ctx.arc(-bodyW * 0.52, -legH - bodyH * 0.65, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Neck & Head
        ctx.fillStyle = '#8a522b';
        ctx.beginPath();
        ctx.moveTo(bodyW * 0.3, -legH - bodyH * 0.6);
        ctx.lineTo(bodyW * 0.52, -legH - bodyH * 1.45);
        ctx.lineTo(bodyW * 0.35, -legH - bodyH * 1.45);
        ctx.lineTo(bodyW * 0.15, -legH - bodyH * 0.6);
        ctx.closePath();
        ctx.fill();

        // Head snout
        ctx.beginPath();
        ctx.ellipse(bodyW * 0.52, -legH - bodyH * 1.48, 14 * scale, 8 * scale, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Glowing eye in headlights
        ctx.fillStyle = '#ffef7a';
        ctx.beginPath();
        ctx.arc(bodyW * 0.54, -legH - bodyH * 1.52, Math.max(1.5, 2.8 * scale), 0, Math.PI * 2);
        ctx.fill();

        // Antlers
        ctx.strokeStyle = '#d6bfa3';
        ctx.lineWidth = Math.max(1.5, 3 * scale);
        ctx.beginPath();
        ctx.moveTo(bodyW * 0.44, -legH - bodyH * 1.55);
        ctx.lineTo(bodyW * 0.38, -legH - bodyH * 2.05);
        ctx.lineTo(bodyW * 0.25, -legH - bodyH * 2.2);
        ctx.moveTo(bodyW * 0.38, -legH - bodyH * 1.85);
        ctx.lineTo(bodyW * 0.52, -legH - bodyH * 2.1);
        ctx.stroke();

        ctx.restore();
      };

      let deerDrawn = false;
      for (const t of sortedTrees) {
        if (st.deer.active && !deerDrawn && st.deer.z >= t.z) {
          drawDeer(st.deer);
          deerDrawn = true;
        }
        drawTree(t);
      }
      if (st.deer.active && !deerDrawn) {
        drawDeer(st.deer);
      }

      // Warning indicator when deer is jumping out
      if (st.deer.active && st.deer.z < 24 && st.deer.z > 2) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ DEER CROSSING AHEAD! PRESS [S] TO BRAKE!', centerX, 42);
      }

      // 5. First-Person Cockpit / Car Interior Overlay
      // Car Hood
      const hoodGrad = ctx.createLinearGradient(0, height * 0.73, 0, height * 0.88);
      hoodGrad.addColorStop(0, '#1e3a2f');
      hoodGrad.addColorStop(1, '#12241d');
      ctx.fillStyle = hoodGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.12, height * 0.84);
      ctx.quadraticCurveTo(centerX, height * 0.74, width * 0.88, height * 0.84);
      ctx.lineTo(width * 0.95, height);
      ctx.lineTo(width * 0.05, height);
      ctx.closePath();
      ctx.fill();

      // Windshield Pillars (A-pillars) & Roof Frame
      ctx.fillStyle = '#0f1319';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(width * 0.92, height);
      ctx.lineTo(width * 0.84, 24);
      ctx.lineTo(width * 0.16, 24);
      ctx.lineTo(width * 0.08, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Rearview Mirror
      ctx.fillStyle = '#161b24';
      ctx.beginPath();
      ctx.roundRect(centerX - 55, 16, 110, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dashboard Base
      ctx.fillStyle = '#151921';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.83);
      ctx.quadraticCurveTo(centerX, height * 0.78, width, height * 0.83);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Dashboard Speedometer Cluster
      const clusterX = width * 0.34;
      const clusterY = height * 0.89;
      ctx.fillStyle = '#0b0e14';
      ctx.beginPath();
      ctx.arc(clusterX, clusterY, 52, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Brake red glow on dashboard when pressing S
      if (st.keys.s) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BRAKE', clusterX, clusterY - 26);
      }

      // Steering Wheel (rotates with A / D)
      ctx.save();
      ctx.translate(clusterX, height * 0.96);
      ctx.rotate(st.wheelAngle);

      // Outer wheel ring
      ctx.strokeStyle = '#222733';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 82, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#333b4d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 82, 0, Math.PI * 2);
      ctx.stroke();

      // Red top center stripe on wheel
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 82, -Math.PI / 2 - 0.08, -Math.PI / 2 + 0.08);
      ctx.stroke();

      // Wheel spokes
      ctx.fillStyle = '#1c202b';
      ctx.fillRect(-78, -8, 156, 18);
      ctx.fillRect(-14, 0, 28, 78);

      // Center horn pad
      ctx.fillStyle = '#14171f';
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      update();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          draw(ctx, canvas.width, canvas.height);
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-[760px]">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#131b2e] px-4 py-3 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              🌲 Forest Night Drive
            </h1>
            <p className="text-xs text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">W</kbd> Gas •{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">S</kbd> Stop/Brake •{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">A</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">D</kbd> Steer
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Speed
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {speedKmh} <small className="text-xs font-normal">km/h</small>
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Distance
              </span>
              <span className="text-xl font-mono font-bold text-amber-400">
                {score} <small className="text-xs font-normal">m</small>
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                Best
              </span>
              <span className="text-xl font-mono font-bold text-indigo-400">
                {highScore} <small className="text-xs font-normal">m</small>
              </span>
            </div>
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={760}
            height={480}
            className="w-full h-auto block"
          />

          {/* Start Overlay */}
          {gameState === 'START' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl font-extrabold mb-2 text-white">
                Watch Out For Deer!
              </h2>
              <p className="max-w-md text-slate-300 text-sm mb-6 leading-relaxed">
                Drive through the narrow forest road from a first-person cockpit view.
                Hold <b>W</b> to accelerate, steer with <b>A</b> and <b>D</b>, and slam{' '}
                <b>S</b> to stop when a deer suddenly crosses the road!
              </p>
              <button
                type="button"
                onClick={initGame}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition cursor-pointer shadow-lg"
              >
                Start Driving
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-red-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-red-500/20 text-red-300 mb-2">
                Crashed
              </span>
              <h2 className="text-3xl font-extrabold mb-2 text-white">
                You Died!
              </h2>
              <p className="max-w-md text-red-200 text-sm mb-4">
                {deathReason}
              </p>
              <p className="text-lg font-mono text-amber-300 mb-6">
                Distance driven: <b>{score} m</b>
              </p>
              <button
                type="button"
                onClick={initGame}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-base transition cursor-pointer shadow-lg"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
