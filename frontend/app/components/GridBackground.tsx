"use client";

import { useEffect, useRef } from "react";

const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Grid properties
    const cellSize = 20;
    const columns = Math.ceil(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);

    // Characters to display (minimal set for subtlety)
    const chars = "01";

    // Matrix grid state
    const grid: {
      char: string;
      opacity: number;
      targetOpacity: number;
      fadeSpeed: number;
      updateCounter: number;
      updateFrequency: number;
    }[][] = [];

    // Initialize grid
    for (let x = 0; x < columns; x++) {
      grid[x] = [];
      for (let y = 0; y < rows; y++) {
        grid[x][y] = {
          char: chars[Math.floor(Math.random() * chars.length)],
          opacity: 0,
          targetOpacity: Math.random() * 0.1,
          fadeSpeed: 0.01 + Math.random() * 0.02,
          updateCounter: 0,
          updateFrequency: 100 + Math.floor(Math.random() * 200),
        };
      }
    }

    // Animation
    const animate = () => {
      // Clear with very subtle fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set font
      ctx.font = `${Math.floor(cellSize * 0.7)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Update and draw grid
      for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
          const cell = grid[x][y];

          // Occasionally change character and target opacity
          cell.updateCounter++;
          if (cell.updateCounter >= cell.updateFrequency) {
            cell.updateCounter = 0;
            cell.char = chars[Math.floor(Math.random() * chars.length)];

            // 20% chance to become more visible, 80% chance to fade out
            if (Math.random() < 0.2) {
              cell.targetOpacity = 0.1 + Math.random() * 0.2;
            } else {
              cell.targetOpacity = Math.random() * 0.05;
            }
          }

          // Gradually move toward target opacity
          if (cell.opacity < cell.targetOpacity) {
            cell.opacity = Math.min(
              cell.opacity + cell.fadeSpeed,
              cell.targetOpacity
            );
          } else if (cell.opacity > cell.targetOpacity) {
            cell.opacity = Math.max(
              cell.opacity - cell.fadeSpeed,
              cell.targetOpacity
            );
          }

          // Only draw if visible enough
          if (cell.opacity > 0.01) {
            // Subtle green tint
            const green = 50 + Math.floor(cell.opacity * 150);
            ctx.fillStyle = `rgba(0, ${green}, 0, ${cell.opacity})`;

            // Draw character
            ctx.fillText(
              cell.char,
              x * cellSize + cellSize / 2,
              y * cellSize + cellSize / 2
            );
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] bg-black opacity-70"
    />
  );
};

export default GridBackground;
