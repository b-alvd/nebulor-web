'use client';

import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const STAR_COUNT = 220;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? 'rgba(126, 247, 240,' : Math.random() > 0.7 ? 'rgba(192, 132, 252,' : 'rgba(255, 255, 255,',
    }));

    const blobs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 120 + Math.random() * 200,
      color: i % 3 === 0 ? '78, 205, 196' : i % 3 === 1 ? '139, 92, 246' : '232, 98, 42',
      speed: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      blobs.forEach(b => {
        b.x += b.speed;
        b.y += b.vy;
        if (b.x > canvas.width + b.r) b.x = -b.r;
        if (b.x < -b.r) b.x = canvas.width + b.r;
        if (b.y > canvas.height + b.r) b.y = -b.r;
        if (b.y < -b.r) b.y = canvas.height + b.r;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(${b.color}, 0.04)`);
        grad.addColorStop(1, `rgba(${b.color}, 0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      stars.forEach(s => {
        const flicker = Math.sin(t * s.speed * 100 + s.phase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${(s.alpha * flicker).toFixed(2)})`;
        ctx.fill();
        if (s.r > 1.1) {
          const haloGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
          haloGrad.addColorStop(0, `${s.color}${(0.15 * flicker).toFixed(2)})`);
          haloGrad.addColorStop(1, `${s.color}0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
