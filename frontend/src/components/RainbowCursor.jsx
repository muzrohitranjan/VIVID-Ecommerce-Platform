import React, { useEffect, useRef } from 'react';

export default function RainbowCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let hue = 0;
    
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    class Particle {
      constructor(x, y, h) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5; // flame size
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * -3 - 1; // drift upwards like fire
        this.color = `hsl(${h}, 100%, 60%)`;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02; // fade out rate
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size -= 0.3;
        this.life -= this.decay;
      }
      
      draw() {
        ctx.globalCompositeOperation = 'lighter'; // bright fire effect
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    let mouse = { x: null, y: null };
    
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Spawn fresh flame particles at mouse
      for(let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y, hue));
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    // Support touch too
    const onTouchMove = (e) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      for(let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y, hue));
      }
    };
    window.addEventListener('touchmove', onTouchMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hue += 2; // cycle rainbow colors
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0 || particles[i].size <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999, // Extremely high so it covers whole page
        mixBlendMode: 'screen'
      }}
    />
  );
}
