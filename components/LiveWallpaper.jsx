'use client';
import { useEffect, useRef } from 'react';

export default function LiveWallpaper() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 120; // Number of floating orbs

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        color: Math.random() > 0.5 ? '0, 240, 255' : '139, 92, 246',
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    const render = () => {
      // Create a slight trailing effect for motion blur
      ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw Connections (Neural Network Effect)
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
           const dx = particles[i].x - particles[j].x;
           const dy = particles[i].y - particles[j].y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           
           if (dist < 120) {
              ctx.beginPath();
              // Line opacity gets stronger as they get closer
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 - dist/1000})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
           }
        }
      }

      // Draw and Move Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges smoothly
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${p.color}, 1)`;
        ctx.fill();
        // Reset shadow to not mess up connections
        ctx.shadowBlur = 0;
      });
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }} 
    />
  );
}
