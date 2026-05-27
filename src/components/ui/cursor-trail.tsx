"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    // Disable on mobile/touch screens to preserve performance
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const colors = [
      "rgba(197, 168, 128, 0.4)", // Gold
      "rgba(107, 142, 173, 0.4)", // Air
      "rgba(91, 140, 133, 0.4)", // Water
      "rgba(188, 108, 77, 0.4)", // Fire
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let isDrawing = false;
    let lastSpawnTime = 0;

    const draw = () => {
      if (particles.length === 0) {
        isDrawing = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render & Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        p.size *= 0.96;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        // Direct color-mix alpha changes to bypass globalAlpha state overhead
        ctx.fillStyle = p.color.replace("0.4", String(Math.max(0, p.alpha * 0.4)));
        ctx.fill();
      });

      // Filter dead particles
      particles = particles.filter((p) => p.alpha > 0 && p.size > 0.1);

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      const now = Date.now();
      // Throttle particle spawning to at most once per 16ms (~60fps) to eliminate latency
      if (now - lastSpawnTime > 16) {
        lastSpawnTime = now;
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1,
          });
        }

        // Start draw loop if idle
        if (!isDrawing) {
          isDrawing = true;
          draw();
        }
      }
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen"
      style={{ opacity: 0.7 }}
    />
  );
}
