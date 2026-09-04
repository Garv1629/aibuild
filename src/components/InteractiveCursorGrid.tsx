import React, { useEffect, useRef } from 'react';

interface Point {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface InteractiveCursorGridProps {
  gridSize?: number;
  holeRadius?: number;
  pushStrength?: number;
  className?: string;
}

export const InteractiveCursorGrid: React.FC<InteractiveCursorGridProps> = ({
  gridSize = 64,
  holeRadius = 130,
  pushStrength = 50,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Mouse state with smooth trailing lerp
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: holeRadius,
      isActive: false,
      speed: 0,
      lastMoveTime: 0,
    };

    let points: Point[][] = [];
    let cols = 0;
    let rows = 0;

    const initGrid = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      cols = Math.ceil(width / gridSize) + 2;
      rows = Math.ceil(height / gridSize) + 2;

      points = [];
      for (let r = 0; r < rows; r++) {
        const row: Point[] = [];
        for (let c = 0; c < cols; c++) {
          const baseX = (c - 0.5) * gridSize;
          const baseY = (r - 0.5) * gridSize;
          row.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            vx: 0,
            vy: 0,
          });
        }
        points.push(row);
      }
    };

    initGrid();

    // Physics parameters
    const damping = 0.82;
    const springK = 0.095;
    let isRunning = false;
    let isSettled = true;

    const render = () => {
      // Smooth mouse lerp
      if (mouse.isActive) {
        const dx = mouse.targetX - mouse.x;
        const dy = mouse.targetY - mouse.y;
        mouse.x += dx * 0.4;
        mouse.y += dy * 0.4;
        mouse.speed = Math.sqrt(dx * dx + dy * dy);
        isSettled = false;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.25;
        mouse.y += (-1000 - mouse.y) * 0.25;
      }

      // Fast bounding box for repulsion check
      const rad = mouse.radius;
      const minX = mouse.x - rad;
      const maxX = mouse.x + rad;
      const minY = mouse.y - rad;
      const maxY = mouse.y + rad;

      // Update points physics
      let maxVelocity = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];

          // Hole repulsion force only within bounding box
          if (mouse.isActive && pt.x > minX && pt.x < maxX && pt.y > minY && pt.y < maxY) {
            const dx = pt.x - mouse.x;
            const dy = pt.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < rad * rad && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const angle = Math.atan2(dy, dx);
              const force = Math.pow(1 - dist / rad, 1.6) * pushStrength;
              pt.vx += Math.cos(angle) * force * 0.45;
              pt.vy += Math.sin(angle) * force * 0.45;
              isSettled = false;
            }
          }

          // Hooke's Law spring back to baseX, baseY
          const diffX = pt.baseX - pt.x;
          const diffY = pt.baseY - pt.y;

          if (Math.abs(diffX) > 0.02 || Math.abs(diffY) > 0.02 || Math.abs(pt.vx) > 0.02 || Math.abs(pt.vy) > 0.02) {
            pt.vx = (pt.vx + diffX * springK) * damping;
            pt.vy = (pt.vy + diffY * springK) * damping;
            pt.x += pt.vx;
            pt.y += pt.vy;

            const vel = Math.abs(pt.vx) + Math.abs(pt.vy);
            if (vel > maxVelocity) maxVelocity = vel;
          } else {
            pt.x = pt.baseX;
            pt.y = pt.baseY;
            pt.vx = 0;
            pt.vy = 0;
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Draw horizontal warped grid lines
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = points[r][c - 1];
            const cx = (prev.x + pt.x) / 2;
            const cy = (prev.y + pt.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
          }
        }
      }
      ctx.stroke();

      // Draw vertical warped grid lines
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (r === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = points[r - 1][c];
            const cx = (prev.x + pt.x) / 2;
            const cy = (prev.y + pt.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
          }
        }
      }
      ctx.stroke();

      // Draw subtle intersection crosshair dots
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          ctx.moveTo(pt.x + 1.2, pt.y);
          ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      // Draw soft ethereal hole aura under cursor when active
      if (mouse.isActive && mouse.x > -500) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(32, 37, 38, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // If mouse is inactive and all points settled, stop RAF loop completely
      if (!mouse.isActive && maxVelocity < 0.04) {
        isSettled = true;
        isRunning = false;
        // Snap points to base coordinates for clean resting state
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            points[r][c].x = points[r][c].baseX;
            points[r][c].y = points[r][c].baseY;
            points[r][c].vx = 0;
            points[r][c].vy = 0;
          }
        }
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startRenderLoop = () => {
      if (!isRunning) {
        isRunning = true;
        isSettled = false;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Draw initial static frame
    render();

    // Event listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
      startRenderLoop();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isActive = true;
        startRenderLoop();
      }
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.isActive = false;
      startRenderLoop();
    };

    const handleResize = () => {
      initGrid();
      startRenderLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [gridSize, holeRadius, pushStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{
        mixBlendMode: 'normal',
      }}
    />
  );
};
