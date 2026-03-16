"use client";
import { useEffect, useRef } from "react";

export default function GalaxyScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    // Detect if mobile
    const isMobile = w < 768;
    const starSpeed = isMobile ? 1 : 2; // Slower on mobile

    // 🌌 3D Star Properties
    const starCount = 200; // Increased from 120 to 200 for more visible stars
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 2000, // Wide spread for 3D
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000,         // Depth coordinate
      baseSize: 3 + Math.random() * 4, // Increased from 2-3 to 3-7
      blinkSpeed: 0.008 + Math.random() * 0.015, // Slightly faster blink for visibility
      opacity: Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Center of the screen for 3D projection
      const centerX = w / 2;
      const centerY = h / 2;
      const focalLength = w; // Perspective strength

      stars.forEach((s) => {
        // 1. Move stars closer (decrease Z) - slower on mobile
        s.z -= starSpeed; 
        if (s.z <= 0) s.z = 2000; // Reset star to far distance

        // 2. 3D to 2D Projection Math
        // As Z decreases, the scale (focalLength / z) increases
        const scale = focalLength / s.z;
        const px = centerX + s.x * scale;
        const py = centerY + s.y * scale;
        const pSize = s.baseSize * scale * 0.5; // Size grows as it gets closer

        // 3. Only draw if within screen bounds
        if (px > 0 && px < w && py > 0 && py < h) {
          // Twinkle effect with minimum visibility
          const blink = Math.abs(Math.sin(Date.now() * s.blinkSpeed)) * 0.7 + 0.3; // Min 0.3 opacity for visibility
          
          // ✨ Radial Gradient for Glow - Enhanced visibility
          const glowRadius = pSize * 3.5; // Increased glow radius
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
          gradient.addColorStop(0, `rgba(137, 87, 229, ${blink})`);
          gradient.addColorStop(0.3, `rgba(163, 113, 247, ${blink * 0.6})`);
          gradient.addColorStop(0.6, `rgba(137, 87, 229, ${blink * 0.3})`);
          gradient.addColorStop(1, `rgba(137, 87, 229, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Core "Hot" center for all stars (not just z < 800)
          ctx.fillStyle = `rgba(255, 255, 255, ${blink * 0.9})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Extra bright core for very close stars
          if (s.z < 600) {
            ctx.fillStyle = `rgba(255, 255, 255, ${blink})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    animate();
    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}