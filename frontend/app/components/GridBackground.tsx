"use client"

import { useEffect, useRef } from "react"

const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Square properties
    const squareSize = 15 // Smaller squares
    const squares: {
      x: number
      y: number
      opacity: number
      speed: number
      angle: number
      angleSpeed: number
      radius: number
    }[] = []
    const numSquares = 25 // Fewer squares

    // Initialize squares with circular motion parameters
    for (let i = 0; i < numSquares; i++) {
      squares.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.15, // Slightly reduced opacity
        speed: 0.2 + Math.random() * 0.5, // Slower base speed
        angle: Math.random() * Math.PI * 2, // Random starting angle
        angleSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed
        radius: Math.random() * 50 + 20, // Random orbit radius
      })
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update squares
      squares.forEach((square) => {
        ctx.fillStyle = `rgba(158, 158, 158, ${square.opacity})`
        ctx.fillRect(square.x, square.y, squareSize, squareSize)

        // Update angle for circular motion
        square.angle += square.angleSpeed

        // Calculate new position using circular motion
        square.x += Math.cos(square.angle) * square.speed
        square.y += Math.sin(square.angle) * square.speed

        // Wrap around screen edges
        if (square.x < -squareSize) square.x = canvas.width
        if (square.x > canvas.width) square.x = -squareSize
        if (square.y < -squareSize) square.y = canvas.height
        if (square.y > canvas.height) square.y = -squareSize
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] bg-transparent" />
}

export default GridBackground

